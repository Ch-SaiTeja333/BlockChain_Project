require("dotenv").config();
const mongoose = require("mongoose");
const MachineMetadata = require("./models/MachineMetadata");
const User = require("./models/User");
const DocumentRecord = require("./models/DocumentRecord");
const MaintenanceRequest = require("./models/MaintenanceRequest");
const { defaultUsers } = require("./controllers/userController");

const seedData = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/industrial_blockchain";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log("Connected to MongoDB for seeding...");

    // 1. Seed Users
    await User.deleteMany({});
    await User.insertMany(defaultUsers);
    console.log(` Seeded ${defaultUsers.length} user profiles.`);

    // 2. Seed Machine Metadata
    await MachineMetadata.deleteMany({});
    const machineMetas = [
      {
        machineId: "EQ-CNC-101",
        description: "High-speed 5-axis vertical machining center used for aerospace titanium impeller milling.",
        criticality: "Mission Critical",
        department: "Precision Aerostructures",
        operatorInCharge: "Sarah Jenkins",
        recommendedServiceIntervalDays: 45,
        operatingHours: 3420,
        manualUrl: "https://docs.haascnc.com/umc-750ss-operators-manual.pdf",
        imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
        additionalNotes: "Calibrated with dynamic laser interferometer quarterly.",
      },
      {
        machineId: "EQ-ROB-204",
        description: "6-axis heavy payload articulated industrial robot with high-torque foundry wrist.",
        criticality: "High",
        department: "Automated Body-In-White Assembly",
        operatorInCharge: "Michael Chang",
        recommendedServiceIntervalDays: 90,
        operatingHours: 5890,
        manualUrl: "https://docs.kuka.com/kr210-technical-spec.pdf",
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
        additionalNotes: "Gearbox grease sampling scheduled for next major overhaul.",
      },
      {
        machineId: "EQ-HYD-305",
        description: "5000 kN servo-hydraulic stamping press with programmable velocity curve and active cushion.",
        criticality: "Mission Critical",
        department: "Sheet Metal Stamping",
        operatorInCharge: "Robert Kowalski",
        recommendedServiceIntervalDays: 60,
        operatingHours: 8120,
        manualUrl: "https://docs.schulergroup.com/hydraulic-press-hp500.pdf",
        imageUrl: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80",
        additionalNotes: "Hydraulic oil ISO VG 46 tested for particle count last month.",
      },
    ];
    await MachineMetadata.insertMany(machineMetas);
    console.log(` Seeded ${machineMetas.length} machine metadata records.`);

    // 3. Seed Maintenance Requests
    await MaintenanceRequest.deleteMany({});
    const requests = [
      {
        requestId: "REQ-2026-001",
        machineId: "EQ-ROB-204",
        operatorAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906".toLowerCase(),
        operatorName: "Sarah Jenkins",
        urgency: "High",
        issueSummary: "Axis 3 servo temperature warning triggering during rapid traverse moves.",
        notes: "Operator noticed minor acoustic whine at 100% duty cycle.",
        status: "Pending",
      },
    ];
    await MaintenanceRequest.insertMany(requests);
    console.log(` Seeded ${requests.length} maintenance requests.`);

    // 4. Seed Documents with matching on-chain hashes
    await DocumentRecord.deleteMany({});
    const sampleDocHash = "0x5a2d7f8c9b0e1a2f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a";
    const sampleEvidenceHash = "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f";

    const docs = [
      {
        docId: "DOC-CAL-101",
        fileName: "spindle-laser-alignment-cert.pdf",
        originalName: "Haas_UMC750_Laser_Alignment_Certificate_2026.pdf",
        mimeType: "application/pdf",
        sizeBytes: 142850,
        filePath: "/uploads/spindle-laser-alignment-cert.pdf",
        sha256Hash: sampleDocHash,
        machineId: "EQ-CNC-101",
        docType: "Maintenance Calibration Certificate",
        uploadedBy: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8".toLowerCase(),
        verifiedOnChain: true,
      },
      {
        docId: "DOC-ISO-101",
        fileName: "iso-9001-audit-report.pdf",
        originalName: "ISO9001_Precision_Compliance_Audit_Signoff.pdf",
        mimeType: "application/pdf",
        sizeBytes: 254190,
        filePath: "/uploads/iso-9001-audit-report.pdf",
        sha256Hash: sampleEvidenceHash,
        machineId: "EQ-CNC-101",
        docType: "ISO Safety Audit Evidence",
        uploadedBy: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC".toLowerCase(),
        verifiedOnChain: true,
      },
    ];
    await DocumentRecord.insertMany(docs);
    console.log(` Seeded ${docs.length} document verification records.`);

    console.log(" Database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.warn("⚠️ MongoDB offline or unreachable for seeding:", err.message);
    console.warn("Continuing startup with off-chain fallback cache...");
    process.exit(0);
  }
};

seedData();
