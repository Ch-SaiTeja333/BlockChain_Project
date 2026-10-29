const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IndustrialEquipmentRegistry Smart Contract Tests", function () {
  let registry;
  let admin, engineer, inspector, operator, unauthorizedUser;

  const sampleMachine = {
    machineId: "EQ-CNC-001",
    name: "CNC Milling Station Alpha",
    category: "Machining",
    manufacturer: "Haas Automation",
    modelNumber: "VF-2SS",
    serialNumber: "SN-987654321",
    factoryLocation: "Plant A - Section 3",
    installationDate: Math.floor(Date.now() / 1000) - 86400 * 365, // 1 year ago
  };

  const sampleDocHash = "0x4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a";
  const sampleEvidenceHash = "0x8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4";

  beforeEach(async function () {
    [admin, engineer, inspector, operator, unauthorizedUser] = await ethers.getSigners();

    const IndustrialEquipmentRegistry = await ethers.getContractFactory("IndustrialEquipmentRegistry");
    registry = await IndustrialEquipmentRegistry.deploy();
    await registry.waitForDeployment();

    // Authorize engineer and inspector by admin
    await registry.connect(admin).authorizeEngineer(engineer.address);
    await registry.connect(admin).authorizeInspector(inspector.address);
    await registry.connect(admin).authorizeOperator(operator.address);
  });

  describe("1. Machine Registration", function () {
    it("Should successfully register a new industrial machine by admin", async function () {
      const tx = await registry.connect(admin).registerMachine(
        sampleMachine.machineId,
        sampleMachine.name,
        sampleMachine.category,
        sampleMachine.manufacturer,
        sampleMachine.modelNumber,
        sampleMachine.serialNumber,
        sampleMachine.factoryLocation,
        sampleMachine.installationDate
      );

      await expect(tx)
        .to.emit(registry, "MachineRegistered")
        .withArgs(
          sampleMachine.machineId,
          sampleMachine.name,
          sampleMachine.serialNumber,
          sampleMachine.factoryLocation,
          admin.address,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp)
        );

      const machine = await registry.getMachineDetails(sampleMachine.machineId);
      expect(machine.name).to.equal(sampleMachine.name);
      expect(machine.serialNumber).to.equal(sampleMachine.serialNumber);
      expect(machine.exists).to.be.true;
      expect(machine.status).to.equal(0); // MachineStatus.Operational
    });

    it("Should reject duplicate machine registration with the same machine ID", async function () {
      await registry.connect(admin).registerMachine(
        sampleMachine.machineId,
        sampleMachine.name,
        sampleMachine.category,
        sampleMachine.manufacturer,
        sampleMachine.modelNumber,
        sampleMachine.serialNumber,
        sampleMachine.factoryLocation,
        sampleMachine.installationDate
      );

      await expect(
        registry.connect(admin).registerMachine(
          sampleMachine.machineId,
          "Duplicate CNC Station",
          sampleMachine.category,
          sampleMachine.manufacturer,
          sampleMachine.modelNumber,
          "SN-DUPLICATE",
          sampleMachine.factoryLocation,
          sampleMachine.installationDate
        )
      ).to.be.revertedWith("Machine already registered with this ID");
    });

    it("Should reject machine registration by non-admin accounts", async function () {
      await expect(
        registry.connect(unauthorizedUser).registerMachine(
          "EQ-FORGE-999",
          "Forge Press",
          "Pressing",
          "Schuler",
          "FP-200",
          "SN-FORGE-1",
          "Plant B",
          Math.floor(Date.now() / 1000)
        )
      ).to.be.reverted;
    });

    it("Should reject empty machine ID or empty machine name", async function () {
      await expect(
        registry.connect(admin).registerMachine(
          "",
          sampleMachine.name,
          sampleMachine.category,
          sampleMachine.manufacturer,
          sampleMachine.modelNumber,
          sampleMachine.serialNumber,
          sampleMachine.factoryLocation,
          sampleMachine.installationDate
        )
      ).to.be.revertedWith("Machine ID cannot be empty");

      await expect(
        registry.connect(admin).registerMachine(
          "EQ-VALID-ID",
          "",
          sampleMachine.category,
          sampleMachine.manufacturer,
          sampleMachine.modelNumber,
          sampleMachine.serialNumber,
          sampleMachine.factoryLocation,
          sampleMachine.installationDate
        )
      ).to.be.revertedWith("Machine name cannot be empty");
    });
  });

  describe("2. Maintenance Records (Append-Only)", function () {
    beforeEach(async function () {
      await registry.connect(admin).registerMachine(
        sampleMachine.machineId,
        sampleMachine.name,
        sampleMachine.category,
        sampleMachine.manufacturer,
        sampleMachine.modelNumber,
        sampleMachine.serialNumber,
        sampleMachine.factoryLocation,
        sampleMachine.installationDate
      );
    });

    it("Should allow authorized maintenance engineer to record maintenance", async function () {
      const tx = await registry.connect(engineer).addMaintenanceRecord(
        sampleMachine.machineId,
        "Preventive Spindle Calibration",
        "Spindle bearing vibration detected during shift 2",
        "Replaced ceramic bearings and performed precision dynamic balance",
        "SKF Spindle Ceramic Bearings #7014C",
        sampleDocHash,
        "ipfs://QmCalibrationReportHash123"
      );

      await expect(tx)
        .to.emit(registry, "MaintenanceRecorded")
        .withArgs(
          sampleMachine.machineId,
          0,
          "Preventive Spindle Calibration",
          engineer.address,
          sampleDocHash,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp)
        );

      const history = await registry.getMaintenanceHistory(sampleMachine.machineId);
      expect(history.length).to.equal(1);
      expect(history[0].engineer).to.equal(engineer.address);
      expect(history[0].partsReplaced).to.equal("SKF Spindle Ceramic Bearings #7014C");
      expect(history[0].documentHash).to.equal(sampleDocHash);

      // Verify machine status changed to AwaitingInspection
      const machine = await registry.getMachineDetails(sampleMachine.machineId);
      expect(machine.status).to.equal(2); // MachineStatus.AwaitingInspection
    });

    it("Should reject maintenance record creation by unauthorized users", async function () {
      await expect(
        registry.connect(unauthorizedUser).addMaintenanceRecord(
          sampleMachine.machineId,
          "Unauthorized Oil Change",
          "Issue",
          "Work",
          "Parts",
          sampleDocHash,
          ""
        )
      ).to.be.reverted;
    });

    it("Should preserve complete maintenance history in append-only fashion", async function () {
      await registry.connect(engineer).addMaintenanceRecord(
        sampleMachine.machineId,
        "Maintenance Event 1",
        "Issue 1",
        "Work 1",
        "Part A",
        "hash-1",
        "uri-1"
      );

      await registry.connect(engineer).addMaintenanceRecord(
        sampleMachine.machineId,
        "Maintenance Event 2",
        "Issue 2",
        "Work 2",
        "Part B",
        "hash-2",
        "uri-2"
      );

      const history = await registry.getMaintenanceHistory(sampleMachine.machineId);
      expect(history.length).to.equal(2);
      expect(history[0].problemDescription).to.equal("Issue 1");
      expect(history[1].problemDescription).to.equal("Issue 2");
      // History has no update or delete functions in the ABI, preserving immutability
    });
  });

  describe("3. Inspection Records", function () {
    beforeEach(async function () {
      await registry.connect(admin).registerMachine(
        sampleMachine.machineId,
        sampleMachine.name,
        sampleMachine.category,
        sampleMachine.manufacturer,
        sampleMachine.modelNumber,
        sampleMachine.serialNumber,
        sampleMachine.factoryLocation,
        sampleMachine.installationDate
      );
    });

    it("Should allow authorized inspector to submit a PASSED inspection record and set status to Operational", async function () {
      const tx = await registry.connect(inspector).addInspectionRecord(
        sampleMachine.machineId,
        "Annual ISO 9001 Safety Inspection",
        true, // PASSED
        "All emergency shutoffs, vibration levels, and electrical grounds verified within spec.",
        sampleEvidenceHash,
        "ipfs://QmSafetyAuditCertificateHash"
      );

      await expect(tx)
        .to.emit(registry, "InspectionRecorded")
        .withArgs(
          sampleMachine.machineId,
          0,
          "Annual ISO 9001 Safety Inspection",
          true,
          inspector.address,
          sampleEvidenceHash,
          await ethers.provider.getBlock("latest").then((b) => b.timestamp)
        );

      const machine = await registry.getMachineDetails(sampleMachine.machineId);
      expect(machine.status).to.equal(0); // Operational
    });

    it("Should set machine status to UnderMaintenance if inspection FAILS", async function () {
      await registry.connect(inspector).addInspectionRecord(
        sampleMachine.machineId,
        "Safety Audit",
        false, // FAILED
        "Coolant pressure leak observed at valve manifold.",
        sampleEvidenceHash,
        ""
      );

      const machine = await registry.getMachineDetails(sampleMachine.machineId);
      expect(machine.status).to.equal(1); // UnderMaintenance
    });

    it("Should reject inspection record creation by unauthorized users", async function () {
      await expect(
        registry.connect(unauthorizedUser).addInspectionRecord(
          sampleMachine.machineId,
          "Safety Audit",
          true,
          "Notes",
          sampleEvidenceHash,
          ""
        )
      ).to.be.reverted;
    });
  });

  describe("4. Tamper-Evident Document Hash Verification", function () {
    beforeEach(async function () {
      await registry.connect(admin).registerMachine(
        sampleMachine.machineId,
        sampleMachine.name,
        sampleMachine.category,
        sampleMachine.manufacturer,
        sampleMachine.modelNumber,
        sampleMachine.serialNumber,
        sampleMachine.factoryLocation,
        sampleMachine.installationDate
      );

      await registry.connect(engineer).addMaintenanceRecord(
        sampleMachine.machineId,
        "Hydraulic Hose Replacement",
        "Cracked hose",
        "Installed reinforced 5000psi hose",
        "Gates Hose 5000psi",
        sampleDocHash,
        ""
      );
    });

    it("Should verify document hash matching with on-chain records", async function () {
      const result = await registry.verifyDocumentHash(sampleMachine.machineId, sampleDocHash);
      expect(result.exists).to.be.true;
      expect(result.recordType).to.equal("MAINTENANCE");
      expect(result.submitter).to.equal(engineer.address);
      expect(result.timestamp).to.be.greaterThan(0);

      const isKnown = await registry.isDocumentHashRegistered(sampleDocHash);
      expect(isKnown).to.be.true;
    });

    it("Should detect document hash mismatch for altered documents", async function () {
      const tamperedHash = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
      const result = await registry.verifyDocumentHash(sampleMachine.machineId, tamperedHash);
      expect(result.exists).to.be.false;

      const isKnown = await registry.isDocumentHashRegistered(tamperedHash);
      expect(isKnown).to.be.false;
    });
  });

  describe("5. Role Revocation and Access Control", function () {
    it("Should revoke engineer authorization and prevent further maintenance submissions", async function () {
      await registry.connect(admin).revokeEngineerAuthorization(engineer.address);

      await expect(
        registry.connect(engineer).addMaintenanceRecord(
          sampleMachine.machineId,
          "Type",
          "Issue",
          "Work",
          "Parts",
          sampleDocHash,
          ""
        )
      ).to.be.reverted;
    });

    it("Should revoke inspector authorization and prevent further inspection submissions", async function () {
      await registry.connect(admin).revokeInspectorAuthorization(inspector.address);

      await expect(
        registry.connect(inspector).addInspectionRecord(
          sampleMachine.machineId,
          "Type",
          true,
          "Notes",
          sampleEvidenceHash,
          ""
        )
      ).to.be.reverted;
    });
  });

  describe("6. Invalid Machine ID and Edge Cases", function () {
    it("Should reject operations on non-existent machine IDs", async function () {
      await expect(
        registry.getMachineDetails("NON-EXISTENT-ID")
      ).to.be.revertedWith("Machine does not exist");

      await expect(
        registry.connect(engineer).addMaintenanceRecord(
          "NON-EXISTENT-ID",
          "Type",
          "Issue",
          "Work",
          "Parts",
          sampleDocHash,
          ""
        )
      ).to.be.revertedWith("Machine does not exist");
    });

    it("Should correctly report verification false for non-existent records", async function () {
      const exists = await registry.verifyRecordExists("EQ-CNC-001", "MAINTENANCE", 999);
      expect(exists).to.be.false;
    });
  });
});
