import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { DemoAccountBanner } from "../components/DemoAccountBanner";
import { HashBadge } from "../components/HashBadge";
import { StatusBadge } from "../components/StatusBadge";
import { useBlockchain } from "../context/BlockchainContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const DashboardPage = () => {
  const { contractAddress } = useBlockchain();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.message);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }} />
        <p className="text-muted mt-3 mono">Querying Blockchain Ledger & MongoDB Telemetry...</p>
      </div>
    );
  }

  const bc = data?.blockchainMetrics || {};
  const offChain = data?.offChainMetrics || {};
  const charts = data?.charts || {};
  const recentEvents = data?.recentEvents || [];

  // Chart 1: Machine Status Distribution (Doughnut)
  const statusChartData = {
    labels: ["Operational", "Under Maintenance", "Awaiting Inspection"],
    datasets: [
      {
        data: [
          charts.machineStatusDistribution?.Operational || 0,
          charts.machineStatusDistribution?.UnderMaintenance || 0,
          charts.machineStatusDistribution?.AwaitingInspection || 0,
        ],
        backgroundColor: ["#10b981", "#f59e0b", "#06b6d4"],
        borderColor: ["#0b1320", "#0b1320", "#0b1320"],
        borderWidth: 2,
      },
    ],
  };

  // Chart 2: Monthly Events Trend (Bar)
  const monthlyKeys = Object.keys(charts.monthlyMaintenanceTrends || {});
  const monthlyValues = Object.values(charts.monthlyMaintenanceTrends || {});
  const trendChartData = {
    labels: monthlyKeys,
    datasets: [
      {
        label: "Recorded Ledger Events",
        data: monthlyValues,
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#94a3b8", font: { family: "Inter" } },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(36, 53, 82, 0.5)" },
      },
      y: {
        ticks: { color: "#94a3b8", stepSize: 1 },
        grid: { color: "rgba(36, 53, 82, 0.5)" },
      },
    },
  };

  return (
    <div className="container-fluid py-4">
      {/* Demo Switcher Bar */}
      <DemoAccountBanner />

      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="industrial-heading fw-bold text-light mb-1">
            Supervisory Control & Ledger Dashboard
          </h2>
          <div className="text-muted small">
            Authoritative Smart Contract:{" "}
            <span className="mono text-info">{contractAddress || "0x5FbDB...80aa3"}</span>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={fetchDashboard}>
            <i className="bi bi-arrow-clockwise me-1" /> Refresh
          </button>
          <Link to="/register-machine" className="btn btn-sm btn-primary">
            <i className="bi bi-plus-circle me-1" /> Register Equipment
          </Link>
        </div>
      </div>

      {/* Distinction Header: Live Blockchain vs MongoDB */}
      <div className="row g-3 mb-4">
        {/* Metric 1 */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card-industrial p-3 h-100 border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: "0.72rem" }}>
                Total Machines
              </span>
              <span className="badge bg-dark text-info mono" style={{ fontSize: "0.65rem" }}>ON-CHAIN</span>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold industrial-heading text-light">{bc.totalMachines || 0}</span>
              <span className="small text-success">Active</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
              Permanent IDs in contract
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card-industrial p-3 h-100 border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: "0.72rem" }}>
                Attention Needed
              </span>
              <span className="badge bg-dark text-info mono" style={{ fontSize: "0.65rem" }}>ON-CHAIN</span>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold industrial-heading text-warning">
                {(bc.machinesUnderMaintenance || 0) + (bc.machinesAwaitingInspection || 0)}
              </span>
              <span className="small text-warning">Units</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
              {bc.machinesUnderMaintenance || 0} maint + {bc.machinesAwaitingInspection || 0} inspect
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card-industrial p-3 h-100 border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: "0.72rem" }}>
                Maintenance Logs
              </span>
              <span className="badge bg-dark text-info mono" style={{ fontSize: "0.65rem" }}>ON-CHAIN</span>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold industrial-heading text-light">
                {bc.totalMaintenanceRecords || 0}
              </span>
              <span className="small text-primary">Append-Only</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
              Immutable engineer records
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card-industrial p-3 h-100 border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: "0.72rem" }}>
                Total Inspections
              </span>
              <span className="badge bg-dark text-info mono" style={{ fontSize: "0.65rem" }}>ON-CHAIN</span>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold industrial-heading text-light">{bc.totalInspections || 0}</span>
              <span className="small text-success">{bc.passedInspections || 0} Passed</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
              Certified audit logs
            </div>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card-industrial p-3 h-100 border-start border-4 border-danger">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: "0.72rem" }}>
                Failed Audits
              </span>
              <span className="badge bg-dark text-info mono" style={{ fontSize: "0.65rem" }}>ON-CHAIN</span>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold industrial-heading text-danger">{bc.failedInspections || 0}</span>
              <span className="small text-danger">Rejections</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
              Require immediate triage
            </div>
          </div>
        </div>

        {/* Metric 6: Off-Chain MongoDB */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card-industrial p-3 h-100 border-start border-4 border-secondary">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: "0.72rem" }}>
                Off-Chain Queue
              </span>
              <span className="badge bg-dark text-secondary mono" style={{ fontSize: "0.65rem" }}>MONGODB</span>
            </div>
            <div className="d-flex align-items-baseline gap-2">
              <span className="fs-3 fw-bold industrial-heading text-light">
                {offChain.pendingRequestsCount || 0}
              </span>
              <span className="small text-muted">Work Orders</span>
            </div>
            <div className="text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
              {offChain.totalUploadedDocuments || 0} docs hashed & stored
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-4">
          <div className="card-industrial h-100">
            <div className="card-header-industrial d-flex justify-content-between align-items-center">
              <span>Equipment Operational Status</span>
              <span className="badge bg-dark text-info mono small">Blockchain Live</span>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center p-3" style={{ minHeight: "260px" }}>
              <div style={{ width: "220px", height: "220px" }}>
                <Doughnut
                  data={statusChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom", labels: { color: "#94a3b8" } } },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card-industrial h-100">
            <div className="card-header-industrial d-flex justify-content-between align-items-center">
              <span>Maintenance & Inspection Service Frequency</span>
              <span className="badge bg-dark text-info mono small">Append-Only Ledger</span>
            </div>
            <div className="card-body p-3" style={{ minHeight: "260px" }}>
              <div style={{ height: "230px" }}>
                <Bar data={trendChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ledger Events Timeline */}
      <div className="card-industrial">
        <div className="card-header-industrial d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-clock-history text-primary" />
            <span>Recent Append-Only Blockchain Events</span>
          </div>
          <Link to="/ledger" className="btn btn-sm btn-outline-primary">
            View Complete Ledger <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="table-secondary text-uppercase small text-muted">
              <tr>
                <th scope="col" className="ps-3">Event Type</th>
                <th scope="col">Machine ID</th>
                <th scope="col">Summary / Activity</th>
                <th scope="col">Recorded By</th>
                <th scope="col">Document / Evidence Hash</th>
                <th scope="col">Status</th>
                <th scope="col" className="pe-3 text-end">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No transactions recorded on-chain yet.
                  </td>
                </tr>
              ) : (
                recentEvents.map((evt) => (
                  <tr key={evt.id}>
                    <td className="ps-3">
                      {evt.type === "REGISTRATION" && (
                        <span className="badge bg-warning text-dark">REGISTRATION</span>
                      )}
                      {evt.type === "MAINTENANCE" && (
                        <span className="badge bg-primary">MAINTENANCE</span>
                      )}
                      {evt.type === "INSPECTION" && (
                        <span className="badge bg-success">INSPECTION</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/machines/${evt.machineId}`} className="text-info fw-bold text-decoration-none mono">
                        {evt.machineId}
                      </Link>
                    </td>
                    <td className="text-light">{evt.title}</td>
                    <td>
                      <span className="mono text-muted small">
                        {evt.actor ? `${evt.actor.substring(0, 8)}...${evt.actor.substring(36)}` : "System"}
                      </span>
                    </td>
                    <td>
                      {evt.hash ? (
                        <HashBadge hash={evt.hash} length={8} />
                      ) : (
                        <span className="text-muted small">N/A</span>
                      )}
                    </td>
                    <td>
                      {evt.statusText === "PASSED" ? (
                        <span className="badge bg-success">PASSED</span>
                      ) : evt.statusText === "FAILED" ? (
                        <span className="badge bg-danger">FAILED</span>
                      ) : (
                        <span className="badge bg-secondary">{evt.statusText}</span>
                      )}
                    </td>
                    <td className="pe-3 text-end mono text-muted small">
                      {new Date(evt.timestamp * 1000).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
