const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=================================================");
  console.log("Deploying Industrial Equipment Registry Contract");
  console.log("=================================================");

  const [admin, engineer, inspector, operator] = await ethers.getSigners();

  console.log(`Deploying contracts with account: ${admin.address}`);
  const balance = await ethers.provider.getBalance(admin.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

  // 1. Deploy Contract
  const RegistryFactory = await ethers.getContractFactory("IndustrialEquipmentRegistry");
  const registry = await RegistryFactory.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log(`\n Contract deployed successfully to: ${contractAddress}`);

  // 2. Authorize standard demo roles
  console.log("\nConfiguring initial role permissions...");
  if (engineer) {
    const txEng = await registry.authorizeEngineer(engineer.address);
    await txEng.wait();
    console.log(` Authorized Engineer: ${engineer.address}`);
  }

  if (inspector) {
    const txInsp = await registry.authorizeInspector(inspector.address);
    await txInsp.wait();
    console.log(` Authorized Inspector: ${inspector.address}`);
  }

  if (operator) {
    const txOp = await registry.authorizeOperator(operator.address);
    await txOp.wait();
    console.log(` Authorized Operator:  ${operator.address}`);
  }

  // 3. Register Seed Machines for realistic demo
  console.log("\nRegistering initial industrial equipment...");

  const seedMachines = [
    {
      machineId: "EQ-CNC-101",
      name: "Haas 5-Axis CNC Milling Center",
      category: "Machining & Milling",
      manufacturer: "Haas Automation Inc.",
      modelNumber: "UMC-750SS",
      serialNumber: "HAAS-2023-88319",
      factoryLocation: "Main Plant Detroit - Bay 4",
      installationDate: Math.floor(new Date("2023-03-15").getTime() / 1000),
    },
    {
      machineId: "EQ-ROB-204",
      name: "KUKA Industrial Robotic Arm",
      category: "Assembly & Welding",
      manufacturer: "KUKA Robotics",
      modelNumber: "KR 210 R2700-2",
      serialNumber: "KUKA-ROB-45920",
      factoryLocation: "Automated Assembly Line B",
      installationDate: Math.floor(new Date("2022-08-20").getTime() / 1000),
    },
    {
      machineId: "EQ-HYD-305",
      name: "Schuler 500-Ton Hydraulic Stamping Press",
      category: "Heavy Press & Forging",
      manufacturer: "Schuler Group",
      modelNumber: "HP-500-SERVO",
      serialNumber: "SCH-HYD-77142",
      factoryLocation: "Stamping Facility - Hall 1",
      installationDate: Math.floor(new Date("2021-11-10").getTime() / 1000),
    },
  ];

  for (const m of seedMachines) {
    const tx = await registry.registerMachine(
      m.machineId,
      m.name,
      m.category,
      m.manufacturer,
      m.modelNumber,
      m.serialNumber,
      m.factoryLocation,
      m.installationDate
    );
    await tx.wait();
    console.log(` Registered machine: [${m.machineId}] ${m.name}`);
  }

  // 4. Seed initial maintenance record (from engineer)
  console.log("\nRecording initial maintenance record...");
  const sampleDocHash = "0x5a2d7f8c9b0e1a2f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a";
  const txMaint = await registry.connect(engineer).addMaintenanceRecord(
    "EQ-CNC-101",
    "Quarterly Spindle Laser Alignment",
    "Spindle runout variation exceeded 4 microns after high-feed cycle.",
    "Performed laser interferometer dynamic alignment and tensioned timing belt.",
    "Optibelt High-Torque Timing Belt #T10-840",
    sampleDocHash,
    "https://storage.industrial-blockchain.local/docs/EQ-CNC-101-Alignment.pdf"
  );
  await txMaint.wait();
  console.log(" Added maintenance record for EQ-CNC-101 by Engineer");

  // 5. Seed initial inspection record (from inspector)
  console.log("\nRecording initial inspection record...");
  const sampleEvidenceHash = "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f";
  const txInsp = await registry.connect(inspector).addInspectionRecord(
    "EQ-CNC-101",
    "ISO 9001:2015 Precision Compliance Audit",
    true, // PASSED
    "Spindle runout measured at 1.1 microns (within 2 micron tolerance). All emergency stops verified.",
    sampleEvidenceHash,
    "https://storage.industrial-blockchain.local/inspections/EQ-CNC-101-Audit-Passed.pdf"
  );
  await txInsp.wait();
  console.log(" Added PASSED inspection record for EQ-CNC-101 by Inspector");

  // 6. Export Contract ABI and Address to frontend and backend
  console.log("\nExporting contract artifact files for frontend and backend...");

  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/IndustrialEquipmentRegistry.sol/IndustrialEquipmentRegistry.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const contractData = {
    address: contractAddress,
    network: "localhost",
    chainId: 31337,
    abi: artifact.abi,
    sampleAccounts: {
      admin: admin.address,
      engineer: engineer ? engineer.address : "",
      inspector: inspector ? inspector.address : "",
      operator: operator ? operator.address : "",
    },
    sampleDocumentHashes: [
      {
        machineId: "EQ-CNC-101",
        docType: "Maintenance Calibration Certificate",
        hash: sampleDocHash,
        status: "VERIFIED",
      },
      {
        machineId: "EQ-CNC-101",
        docType: "ISO 9001 Compliance Audit",
        hash: sampleEvidenceHash,
        status: "VERIFIED",
      },
    ],
  };

  const targets = [
    path.join(__dirname, "../../frontend/src/contracts"),
    path.join(__dirname, "../../backend/src/contracts"),
  ];

  for (const dir of targets) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, "contractData.json");
    fs.writeFileSync(filePath, JSON.stringify(contractData, null, 2), "utf8");
    console.log(` Exported contractData.json to ${filePath}`);
  }

  console.log("\n Deployment and initial setup completed successfully!");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
