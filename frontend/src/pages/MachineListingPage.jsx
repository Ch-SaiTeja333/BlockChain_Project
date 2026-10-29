import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { useBlockchain } from "../context/BlockchainContext";

export const MachineListingPage = () => {
  const { roles } = useBlockchain();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/machines");
      const json = await res.json();
      if (json.success) {
        setMachines(json.data);
      } else {
        setError(json.message);
      }
    } catch (err) {
      console.error("Machine list fetch error:", err);
      setError("Failed to fetch equipment records from backend/blockchain");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // Filter logic
  const filteredMachines = machines.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.machineId.toLowerCase().includes(term) ||
      m.name.toLowerCase().includes(term) ||
      m.serialNumber.toLowerCase().includes(term) ||
      m.manufacturer.toLowerCase().includes(term) ||
      m.factoryLocation.toLowerCase().includes(term);

    const matchesStatus =
      selectedStatus === "ALL" || m.status.toLowerCase() === selectedStatus.toLowerCase();

    const matchesCategory =
      selectedCategory === "ALL" || m.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(machines.map((m) => m.category).filter(Boolean)));

  return (
    <div className="container-fluid py-4">
      {/* Header and Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="industrial-heading fw-bold text-light mb-1">Industrial Equipment Directory</h2>
          <p className="text-muted small mb-0">
            Registered machines anchored on-chain with immutable service history.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={fetchMachines}>
            <i className="bi bi-arrow-clockwise me-1" /> Refresh
          </button>
          {roles.isAdmin && (
            <Link to="/register-machine" className="btn btn-sm btn-primary">
              <i className="bi bi-plus-circle me-1" /> Register New Machine
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-industrial p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-muted">
                <i className="bi bi-search" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by Machine ID, Serial No, Name, Manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x" />
                </button>
              )}
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Operational">Operational</option>
              <option value="UnderMaintenance">Under Maintenance</option>
              <option value="AwaitingInspection">Awaiting Inspection</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-2 text-md-end">
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm ${viewMode === "table" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setViewMode("table")}
              >
                <i className="bi bi-table me-1" /> Table
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setViewMode("grid")}
              >
                <i className="bi bi-grid me-1" /> Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <div className="text-muted mt-2 mono">Loading blockchain equipment registry...</div>
        </div>
      ) : filteredMachines.length === 0 ? (
        <div className="card-industrial p-5 text-center">
          <i className="bi bi-cpu text-muted fs-1 mb-3" />
          <h5 className="text-light">No Industrial Equipment Found</h5>
          <p className="text-muted small">No machines matched your search filters or the registry is empty.</p>
          {roles.isAdmin && (
            <Link to="/register-machine" className="btn btn-primary btn-sm mx-auto">
              Register First Machine
            </Link>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="card-industrial">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead className="table-secondary text-uppercase small text-muted">
                <tr>
                  <th scope="col" className="ps-3">Machine ID</th>
                  <th scope="col">Name & Category</th>
                  <th scope="col">Manufacturer / Model</th>
                  <th scope="col">Serial Number</th>
                  <th scope="col">Location</th>
                  <th scope="col">Ledger Status</th>
                  <th scope="col" className="pe-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.map((m) => (
                  <tr key={m.machineId}>
                    <td className="ps-3">
                      <Link to={`/machines/${m.machineId}`} className="text-info fw-bold mono text-decoration-none">
                        {m.machineId}
                      </Link>
                    </td>
                    <td>
                      <div className="text-light fw-medium">{m.name}</div>
                      <div className="text-muted small">{m.category}</div>
                    </td>
                    <td>
                      <div className="text-light">{m.manufacturer}</div>
                      <div className="text-muted small">{m.modelNumber || "N/A"}</div>
                    </td>
                    <td className="mono text-muted small">{m.serialNumber}</td>
                    <td className="text-light small">{m.factoryLocation}</td>
                    <td>
                      <StatusBadge status={m.status} code={m.statusCode} />
                    </td>
                    <td className="pe-3 text-end">
                      <div className="btn-group">
                        <Link to={`/machines/${m.machineId}`} className="btn btn-sm btn-outline-info" title="Full Timeline & Specs">
                          <i className="bi bi-clock-history me-1" /> History
                        </Link>
                        {roles.isEngineer && (
                          <Link to={`/add-maintenance?machineId=${m.machineId}`} className="btn btn-sm btn-outline-primary" title="Record Maintenance">
                            <i className="bi bi-wrench" />
                          </Link>
                        )}
                        {roles.isInspector && (
                          <Link to={`/add-inspection?machineId=${m.machineId}`} className="btn btn-sm btn-outline-success" title="Record Inspection">
                            <i className="bi bi-clipboard-check" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="row g-4">
          {filteredMachines.map((m) => (
            <div key={m.machineId} className="col-12 col-md-6 col-xl-4">
              <div className="card-industrial h-100 p-3 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="mono fw-bold text-info">{m.machineId}</span>
                  <StatusBadge status={m.status} code={m.statusCode} />
                </div>

                <h5 className="text-light mb-1">{m.name}</h5>
                <div className="text-muted small mb-3">{m.category} | {m.manufacturer}</div>

                <div className="bg-dark p-2 rounded border border-secondary mb-3 small">
                  <div className="d-flex justify-content-between text-muted mb-1">
                    <span>Serial No:</span>
                    <span className="mono text-light">{m.serialNumber}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted mb-1">
                    <span>Location:</span>
                    <span className="text-light">{m.factoryLocation}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted">
                    <span>Operating Hours:</span>
                    <span className="mono text-info">{m.operatingHours} hrs</span>
                  </div>
                </div>

                <p className="text-muted small flex-grow-1" style={{ fontSize: "0.82rem" }}>
                  {m.description || "Industrial asset verified on the Ethereum smart contract ledger."}
                </p>

                <div className="d-flex gap-2 pt-2 border-top border-secondary">
                  <Link to={`/machines/${m.machineId}`} className="btn btn-sm btn-outline-info flex-grow-1">
                    <i className="bi bi-clock-history me-1" /> View Timeline
                  </Link>
                  {roles.isEngineer && (
                    <Link to={`/add-maintenance?machineId=${m.machineId}`} className="btn btn-sm btn-outline-primary" title="Record Maintenance">
                      <i className="bi bi-wrench" />
                    </Link>
                  )}
                  {roles.isInspector && (
                    <Link to={`/add-inspection?machineId=${m.machineId}`} className="btn btn-sm btn-outline-success" title="Record Inspection">
                      <i className="bi bi-clipboard-check" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
