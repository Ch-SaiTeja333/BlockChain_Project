const express = require("express");
const router = express.Router();
const {
  getMachines,
  getMachineById,
  getMachineHistory,
  upsertMachineMetadata,
  createMaintenanceRequest,
  getMaintenanceRequests,
} = require("../controllers/machineController");

// Machine endpoints
router.get("/", getMachines);
router.get("/:machineId", getMachineById);
router.get("/:machineId/history", getMachineHistory);
router.post("/:machineId/metadata", upsertMachineMetadata);

// Maintenance request endpoints (Operator off-chain workflow)
router.post("/requests", createMaintenanceRequest);
router.get("/requests/all", getMaintenanceRequests);

module.exports = router;
