import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBlockchain } from "../context/BlockchainContext";
import { HashBadge } from "../components/HashBadge";

export const TransactionHistoryPage = () => {
  const { readOnlyContract, contractAddress } = useBlockchain();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");

  const fetchLedgerEvents = async () => {
    if (!readOnlyContract) return;

    try {
      setLoading(true);

      // Query raw emitted Solidity events directly from local node
      const [regEvents, maintEvents, inspEvents, statusEvents] = await Promise.all([
        readOnlyContract.queryFilter("MachineRegistered").catch(() => []),
        readOnlyContract.queryFilter("MaintenanceRecorded").catch(() => []),
        readOnlyContract.queryFilter("InspectionRecorded").catch(() => []),
        readOnlyContract.queryFilter("MachineStatusUpdated").catch(() => []),
      ]);

      const formatted = [];

      // Format MachineRegistered
      for (const e of regEvents) {
        formatted.push({
          id: `REG-${e.transactionHash}-${e.index}`,
          eventName: "MachineRegistered",
          machineId: e.args[0],
          summary: `Registered "${e.args[1]}" (SN: ${e.args[2]}) at ${e.args[3]}`,
          submitter: e.args[4],
          docHash: "",
          timestamp: Number(e.args[5]),
          blockNumber: e.blockNumber,
          txHash: e.transactionHash,
          badgeClass: "badge bg-warning text-dark",
        });
      }

      // Format MaintenanceRecorded
      for (const e of maintEvents) {
        formatted.push({
          id: `MAINT-${e.transactionHash}-${e.index}`,
          eventName: "MaintenanceRecorded",
          machineId: e.args[0],
          summary: `Maintenance: ${e.args[2]}`,
          submitter: e.args[3],
          docHash: e.args[4],
          timestamp: Number(e.args[5]),
          blockNumber: e.blockNumber,
          txHash: e.transactionHash,
          badgeClass: "badge bg-primary",
        });
      }

      // Format InspectionRecorded
      for (const e of inspEvents) {
        const passed = e.args[3];
        formatted.push({
          id: `INSP-${e.transactionHash}-${e.index}`,
          eventName: "InspectionRecorded",
          machineId: e.args[0],
          summary: `Inspection [${e.args[2]}]: ${passed ? "PASSED" : "FAILED"}`,
          submitter: e.args[4],
          docHash: e.args[5],
          timestamp: Number(e.args[6]),
          blockNumber: e.blockNumber,
          txHash: e.transactionHash,
          badgeClass: passed ? "badge bg-success" : "badge bg-danger",
        });
      }

      // Format MachineStatusUpdated
      for (const e of statusEvents) {
        const statusMap = ["Operational", "Under Maintenance", "Awaiting Inspection", "Decommissioned"];
        formatted.push({
          id: `STATUS-${e.transactionHash}-${e.index}`,
          eventName: "MachineStatusUpdated",
          machineId: e.args[0],
          summary: `Status updated to ${statusMap[Number(e.args[1])] || "Unknown"}`,
          submitter: e.args[2],
          docHash: "",
          timestamp: Number(e.args[3]),
          blockNumber: e.blockNumber,
          txHash: e.transactionHash,
          badgeClass: "badge bg-info text-dark",
        });
      }

      // Sort newest events first
      formatted.sort((a, b) => b.blockNumber - a.blockNumber);
      setEvents(formatted);
    } catch (err) {
      console.error("Ledger event query error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerEvents();
  }, [readOnlyContract]);

  const filtered = events.filter((e) => {
    if (filterType === "ALL") return true;
    return e.eventName === filterType;
  });

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="industrial-heading fw-bold text-light mb-1">
            Blockchain Event Ledger & Audit Trail
          </h2>
          <div className="text-muted small">
            Directly queries all historical events emitted by smart contract:{" "}
            <span className="mono text-info">{contractAddress}</span>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={fetchLedgerEvents}>
            <i className="bi bi-arrow-clockwise me-1" /> Re-Scan Blocks
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card-industrial p-3 mb-4">
        <div className="d-flex flex-wrap gap-2">
          <button
            className={`btn btn-sm ${filterType === "ALL" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setFilterType("ALL")}
          >
            All Ledger Events ({events.length})
          </button>
          <button
            className={`btn btn-sm ${filterType === "MachineRegistered" ? "btn-warning text-dark" : "btn-outline-secondary"}`}
            onClick={() => setFilterType("MachineRegistered")}
          >
            Machine Registered
          </button>
          <button
            className={`btn btn-sm ${filterType === "MaintenanceRecorded" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setFilterType("MaintenanceRecorded")}
          >
            Maintenance Recorded
          </button>
          <button
            className={`btn btn-sm ${filterType === "InspectionRecorded" ? "btn-success" : "btn-outline-secondary"}`}
            onClick={() => setFilterType("InspectionRecorded")}
          >
            Inspection Recorded
          </button>
          <button
            className={`btn btn-sm ${filterType === "MachineStatusUpdated" ? "btn-info text-dark" : "btn-outline-secondary"}`}
            onClick={() => setFilterType("MachineStatusUpdated")}
          >
            Status Changes
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="card-industrial">
        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="table-secondary text-uppercase small text-muted">
              <tr>
                <th scope="col" className="ps-3">Block #</th>
                <th scope="col">Event Signature</th>
                <th scope="col">Machine ID</th>
                <th scope="col">Summary & Payload</th>
                <th scope="col">Signer Wallet</th>
                <th scope="col">Document Hash</th>
                <th scope="col" className="pe-3 text-end">Transaction Hash</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" />
                    <span className="mono text-muted">Querying Ethereum event logs...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No matching blockchain transactions mined yet.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-3">
                      <span className="badge bg-secondary mono">#{item.blockNumber}</span>
                    </td>
                    <td>
                      <span className={item.badgeClass}>{item.eventName}</span>
                    </td>
                    <td>
                      <Link to={`/machines/${item.machineId}`} className="text-info fw-bold mono text-decoration-none">
                        {item.machineId}
                      </Link>
                    </td>
                    <td className="text-light small">{item.summary}</td>
                    <td>
                      <HashBadge hash={item.submitter} length={6} />
                    </td>
                    <td>
                      {item.docHash ? (
                        <HashBadge hash={item.docHash} length={6} verified={true} />
                      ) : (
                        <span className="text-muted small">None</span>
                      )}
                    </td>
                    <td className="pe-3 text-end">
                      <HashBadge hash={item.txHash} length={8} />
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
