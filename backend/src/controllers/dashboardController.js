const { getContract } = require("../config/blockchain");
const MachineMetadata = require("../models/MachineMetadata");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const DocumentRecord = require("../models/DocumentRecord");

const statusLabels = ["Operational", "UnderMaintenance", "AwaitingInspection", "Decommissioned"];

const getDashboardSummary = async (req, res, next) => {
  try {
    const contract = getContract();

    let totalMachines = 0;
    let machinesUnderMaintenance = 0;
    let machinesAwaitingInspection = 0;
    let operationalMachines = 0;
    let totalMaintenanceRecords = 0;
    let totalInspections = 0;
    let passedInspections = 0;
    let failedInspections = 0;
    let recentEvents = [];
    const categoryCounts = {};
    const monthlyEvents = {
      Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
    };

    if (contract) {
      try {
        const ids = await contract.getAllMachineIds();
        totalMachines = ids.length;

        for (const id of ids) {
          const m = await contract.getMachineDetails(id);
          const statusCode = Number(m.status);
          const category = m.category || "General";
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;

          if (statusCode === 0) operationalMachines++;
          else if (statusCode === 1) machinesUnderMaintenance++;
          else if (statusCode === 2) machinesAwaitingInspection++;

          // History
          const maint = await contract.getMaintenanceHistory(id);
          totalMaintenanceRecords += maint.length;
          maint.forEach((r) => {
            const date = new Date(Number(r.timestamp) * 1000);
            const monthStr = date.toLocaleString("en-US", { month: "short" });
            if (monthlyEvents[monthStr] !== undefined) monthlyEvents[monthStr]++;

            recentEvents.push({
              id: `MAINT-${id}-${r.recordId}`,
              type: "MAINTENANCE",
              machineId: id,
              title: r.maintenanceType,
              actor: r.engineer,
              timestamp: Number(r.timestamp),
              hash: r.documentHash,
              statusText: "Completed",
            });
          });

          const insp = await contract.getInspectionHistory(id);
          totalInspections += insp.length;
          insp.forEach((r) => {
            if (r.passed) passedInspections++;
            else failedInspections++;

            const date = new Date(Number(r.timestamp) * 1000);
            const monthStr = date.toLocaleString("en-US", { month: "short" });
            if (monthlyEvents[monthStr] !== undefined) monthlyEvents[monthStr]++;

            recentEvents.push({
              id: `INSP-${id}-${r.recordId}`,
              type: "INSPECTION",
              machineId: id,
              title: r.inspectionType,
              actor: r.inspector,
              timestamp: Number(r.timestamp),
              hash: r.evidenceHash,
              statusText: r.passed ? "PASSED" : "FAILED",
            });
          });

          // Registration event
          recentEvents.push({
            id: `REG-${id}`,
            type: "REGISTRATION",
            machineId: id,
            title: `Commissioned: ${m.name}`,
            actor: m.registeredBy,
            timestamp: Number(m.registrationTimestamp),
            hash: "",
            statusText: "Operational",
          });
        }
      } catch (err) {
        console.warn("Blockchain read during dashboard aggregation:", err.message);
      }
    }

    // Sort recent events newest first
    recentEvents.sort((a, b) => b.timestamp - a.timestamp);
    const topRecentEvents = recentEvents.slice(0, 10);

    // Off-chain MongoDB statistics
    let pendingRequestsCount = 0;
    let totalUploadedDocuments = 0;
    try {
      pendingRequestsCount = await MaintenanceRequest.countDocuments({ status: "Pending" });
      totalUploadedDocuments = await DocumentRecord.countDocuments({});
    } catch (e) {
      console.warn("MongoDB counts error:", e.message);
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      blockchainMetrics: {
        totalMachines,
        operationalMachines,
        machinesUnderMaintenance,
        machinesAwaitingInspection,
        totalMaintenanceRecords,
        totalInspections,
        passedInspections,
        failedInspections,
        label: "AUTHORITATIVE ON-CHAIN LEDGER",
      },
      offChainMetrics: {
        pendingRequestsCount,
        totalUploadedDocuments,
        label: "MONGODB SUPPLEMENTARY STORAGE",
      },
      charts: {
        categoryDistribution: categoryCounts,
        inspectionOutcomes: {
          passed: passedInspections,
          failed: failedInspections,
        },
        machineStatusDistribution: {
          Operational: operationalMachines,
          UnderMaintenance: machinesUnderMaintenance,
          AwaitingInspection: machinesAwaitingInspection,
        },
        monthlyMaintenanceTrends: monthlyEvents,
      },
      recentEvents: topRecentEvents,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
