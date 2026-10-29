require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { connectDB, getDBStatus } = require("./config/db");
const { initBlockchain, getContractData } = require("./config/blockchain");

// Import Routes
const machineRoutes = require("./routes/machineRoutes");
const documentRoutes = require("./routes/documentRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded documents statically
app.use("/uploads", express.static(uploadDir));

// System Health & Info
app.get("/api/health", (req, res) => {
  const contractData = getContractData();
  res.json({
    status: "HEALTHY",
    service: "Industrial Equipment Maintenance Ledger API",
    version: "1.0.0",
    database: getDBStatus() ? "CONNECTED" : "OFFLINE_FALLBACK",
    contractAddress: contractData ? contractData.address : "NOT_DEPLOYED",
    timestamp: new Date().toISOString(),
  });
});

// Register API Routes
app.use("/api/machines", machineRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error occurred",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Initialize Services and Start Server
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Initialize blockchain connection
  initBlockchain();

  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` Industrial Maintenance API running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
};

startServer();
