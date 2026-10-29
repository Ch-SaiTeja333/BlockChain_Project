const { getContract } = require("../config/blockchain");
const MachineMetadata = require("../models/MachineMetadata");
const MaintenanceRequest = require("../models/MaintenanceRequest");

const statusLabels = ["Operational", "UnderMaintenance", "AwaitingInspection", "Decommissioned"];

// Helper to format on-chain machine struct
const formatOnChainMachine = (m) => {
  return {
    machineId: m.machineId,
    name: m.name,
    category: m.category,
    manufacturer: m.manufacturer,
    modelNumber: m.modelNumber,
    serialNumber: m.serialNumber,
    factoryLocation: m.factoryLocation,
    installationDate: Number(m.installationDate),
    registrationTimestamp: Number(m.registrationTimestamp),
    registeredBy: m.registeredBy,
    exists: m.exists,
    statusCode: Number(m.status),
    status: statusLabels[Number(m.status)] || "Unknown",
  };
};

const getMachines = async (req, res, next) => {
  try {
    const contract = getContract();
    let onChainMachines = [];

    if (contract) {
      try {
        const ids = await contract.getAllMachineIds();
        for (const id of ids) {
          const m = await contract.getMachineDetails(id);
          onChainMachines.push(formatOnChainMachine(m));
        }
      } catch (err) {
        console.warn("Notice: Contract read in getMachines:", err.message);
      }
    }

    // Fetch off-chain metadata from MongoDB
    let metadataList = [];
    try {
      metadataList = await MachineMetadata.find({});
    } catch (e) {
      console.warn("Notice: MongoDB query in getMachines:", e.message);
    }

    const metadataMap = {};
    metadataList.forEach((meta) => {
      metadataMap[meta.machineId] = meta;
    });

    // Merge blockchain authoritative data with MongoDB metadata
    const merged = onChainMachines.map((m) => {
      const meta = metadataMap[m.machineId] || {};
      return {
        ...m,
        description: meta.description || "",
        criticality: meta.criticality || "High",
        department: meta.department || "Manufacturing",
        operatorInCharge: meta.operatorInCharge || "Unassigned",
        operatingHours: meta.operatingHours || 1000,
        manualUrl: meta.manualUrl || "",
        imageUrl: meta.imageUrl || "",
      };
    });

    res.json({
      success: true,
      count: merged.length,
      data: merged,
      source: "blockchain_with_mongo_metadata",
    });
  } catch (error) {
    next(error);
  }
};

const getMachineById = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const contract = getContract();

    if (!contract) {
      return res.status(503).json({
        success: false,
        message: "Blockchain connection unavailable",
      });
    }

    let onChainMachine;
    try {
      const m = await contract.getMachineDetails(machineId);
      onChainMachine = formatOnChainMachine(m);
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: `Machine with ID ${machineId} not found on blockchain`,
      });
    }

    let metadata = null;
    try {
      metadata = await MachineMetadata.findOne({ machineId });
    } catch (e) {
      console.warn("MongoDB query error:", e.message);
    }

    res.json({
      success: true,
      data: {
        ...onChainMachine,
        metadata: metadata || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMachineHistory = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const contract = getContract();

    if (!contract) {
      return res.status(503).json({
        success: false,
        message: "Blockchain connection unavailable",
      });
    }

    // 1. Fetch on-chain machine details
    const m = await contract.getMachineDetails(machineId);
    const machine = formatOnChainMachine(m);

    // 2. Fetch on-chain maintenance history
    const rawMaintHistory = await contract.getMaintenanceHistory(machineId);
    const maintenanceRecords = rawMaintHistory.map((r) => ({
      type: "MAINTENANCE",
      recordId: Number(r.recordId),
      machineId: r.machineId,
      maintenanceType: r.maintenanceType,
      problemDescription: r.problemDescription,
      workPerformed: r.workPerformed,
      partsReplaced: r.partsReplaced,
      actorAddress: r.engineer,
      timestamp: Number(r.timestamp),
      documentHash: r.documentHash,
      metadataURI: r.metadataURI,
    }));

    // 3. Fetch on-chain inspection history
    const rawInspHistory = await contract.getInspectionHistory(machineId);
    const inspectionRecords = rawInspHistory.map((r) => ({
      type: "INSPECTION",
      recordId: Number(r.recordId),
      machineId: r.machineId,
      inspectionType: r.inspectionType,
      passed: r.passed,
      notes: r.inspectionNotes,
      actorAddress: r.inspector,
      timestamp: Number(r.timestamp),
      documentHash: r.evidenceHash,
      metadataURI: r.metadataURI,
    }));

    // 4. Registration event
    const registrationEvent = {
      type: "REGISTRATION",
      recordId: 0,
      machineId: machine.machineId,
      name: machine.name,
      actorAddress: machine.registeredBy,
      timestamp: machine.registrationTimestamp,
      details: `Registered at ${machine.factoryLocation} by Admin`,
    };

    // 5. Combine and sort chronologically
    const allEvents = [registrationEvent, ...maintenanceRecords, ...inspectionRecords].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    res.json({
      success: true,
      machine,
      totalEvents: allEvents.length,
      maintenanceCount: maintenanceRecords.length,
      inspectionCount: inspectionRecords.length,
      events: allEvents,
    });
  } catch (error) {
    next(error);
  }
};

const upsertMachineMetadata = async (req, res, next) => {
  try {
    const { machineId } = req.params;
    const updateData = req.body;

    const metadata = await MachineMetadata.findOneAndUpdate(
      { machineId },
      { ...updateData, machineId, lastSyncTimestamp: new Date() },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Machine metadata updated in MongoDB",
      data: metadata,
    });
  } catch (error) {
    next(error);
  }
};

const createMaintenanceRequest = async (req, res, next) => {
  try {
    const { machineId, operatorAddress, operatorName, urgency, issueSummary, notes } = req.body;

    if (!machineId || !operatorAddress || !issueSummary) {
      return res.status(400).json({
        success: false,
        message: "Machine ID, operator address, and issue summary are required",
      });
    }

    const requestId = `REQ-${Date.now().toString(36).toUpperCase()}`;

    const request = await MaintenanceRequest.create({
      requestId,
      machineId,
      operatorAddress,
      operatorName: operatorName || "Factory Operator",
      urgency: urgency || "Normal",
      issueSummary,
      notes: notes || "",
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Maintenance request logged in off-chain database",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

const getMaintenanceRequests = async (req, res, next) => {
  try {
    const { machineId, status } = req.query;
    const filter = {};
    if (machineId) filter.machineId = machineId;
    if (status) filter.status = status;

    const requests = await MaintenanceRequest.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMachines,
  getMachineById,
  getMachineHistory,
  upsertMachineMetadata,
  createMaintenanceRequest,
  getMaintenanceRequests,
};
