import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useBlockchain } from "../context/BlockchainContext";
import { useTransactionModal } from "../context/TransactionModalContext";
import { StatusBadge } from "../components/StatusBadge";
import { HashBadge } from "../components/HashBadge";

export const MachineDetailsPage = () => {
  const { id } = useParams();
  const { contract, roles, account } = useBlockchain();
  const { showTxPending, showTxSuccess, showTxError } = useTransactionModal();

  const [machineData, setMachineData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update modal / form
  const [newStatus, setNewStatus] = useState(0);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Operator maintenance request state
  const [requestText, setRequestText] = useState("");
  const [requestUrgency, setRequestUrgency] = useState("Normal");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const fetchMachineDetails = async () => {
    try {
      setLoading(true);
      const [mRes, hRes] = await Promise.all([
        fetch(`/api/machines/${id}`),
        fetch(`/api/machines/${id}/history`),
      ]);

      const mJson = await mRes.json();
      const hJson = await hRes.json();

      if (mJson.success) setMachineData(mJson.data);
      if (hJson.success) setHistoryData(hJson);
    } catch (err) {
      console.error("Machine details fetch error:", err);
      setError("Failed to fetch equipment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineDetails();
  }, [id]);

  // Handle on-chain status update (Operational, UnderMaintenance, AwaitingInspection, Decommissioned)
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!contract) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      showTxPending(null, "Updating Machine Status on Blockchain...");

      const tx = await contract.updateMachineStatus(id, Number(newStatus));
      showTxPending(tx.hash, "Updating Machine Status on Blockchain...");

      const receipt = await tx.wait();
      showTxSuccess({
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        title: "Status Updated On-Chain!",
        message: `Machine status successfully updated to code ${newStatus} on the immutable ledger.`,
      });

      fetchMachineDetails();
    } catch (err) {
      console.error("Status update error:", err);
      showTxError({ error: err, title: "Failed to Update Status" });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle off-chain operator maintenance request
  const handleOperatorRequest = async (e) => {
    e.preventDefault();
    if (!requestText.trim()) return;

    try {
      const res = await fetch("/api/machines/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machineId: id,
          operatorAddress: account || "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
          urgency: requestUrgency,
          issueSummary: requestText,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRequestSubmitted(true);
        setRequestText("");
      }
    } catch (err) {
      console.error("Operator request error:", err);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-3 mono">Retrieving on-chain history for {id}...</p>
      </div>
    );
  }

  if (error || !machineData) {
    return (
      <div className="container-fluid py-5">
        <div className="card-industrial p-5 text-center">
          <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3" />
          <h4 className="text-light">Equipment Record Not Found</h4>
          <p className="text-muted">{error || `No on-chain record found for ID ${id}`}</p>
          <Link to="/machines" className="btn btn-outline-primary btn-sm mx-auto">
            Return to Equipment Directory
          </Link>
        </div>
      </div>
    );
  }

  const events = historyData?.events || [];
  const meta = machineData.metadata || {};

  return (
    <div className="container-fluid py-4">
      {/* Breadcrumb / Top Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-2">
          <Link to="/machines" className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-arrow-left" /> Back
          </Link>
          <h2 className="industrial-heading fw-bold text-light mb-0">{machineData.name}</h2>
          <span className="mono badge bg-dark text-info fs-6 border border-secondary">
            {machineData.machineId}
          </span>
          <StatusBadge status={machineData.status} code={machineData.statusCode} />
        </div>

        <div className="d-flex gap-2">
          {roles.isEngineer && (
            <Link to={`/add-maintenance?machineId=${id}`} className="btn btn-sm btn-primary">
              <i className="bi bi-wrench me-1" /> Add Maintenance
            </Link>
          )}
          {roles.isInspector && (
            <Link to={`/add-inspection?machineId=${id}`} className="btn btn-sm btn-success">
              <i className="bi bi-clipboard-check me-1" /> Add Inspection
            </Link>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Equipment Specifications and Off-Chain Data */}
        <div className="col-12 col-lg-4">
          {/* On-Chain Authoritative Specs Card */}
          <div className="card-industrial mb-4">
            <div className="card-header-industrial d-flex justify-content-between align-items-center">
              <span>On-Chain Specifications</span>
              <span className="badge bg-dark text-info mono small">Blockchain Truth</span>
            </div>
            <div className="card-body p-3">
              <div className="d-flex justify-content-between py-2 border-bottom border-secondary small">
                <span className="text-muted">Serial Number:</span>
                <span className="mono text-light fw-bold">{machineData.serialNumber}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom border-secondary small">
                <span className="text-muted">Manufacturer:</span>
                <span className="text-light">{machineData.manufacturer}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom border-secondary small">
                <span className="text-muted">Model Number:</span>
                <span className="text-light">{machineData.modelNumber || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom border-secondary small">
                <span className="text-muted">Category:</span>
                <span className="text-light">{machineData.category}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom border-secondary small">
                <span className="text-muted">Factory Location:</span>
                <span className="text-light">{machineData.factoryLocation}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom border-secondary small">
                <span className="text-muted">Commissioned Date:</span>
                <span className="mono text-light">
                  {new Date(machineData.installationDate * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="d-flex justify-content-between py-2 small">
                <span className="text-muted">Registered By:</span>
                <span className="mono text-info small">
                  {machineData.registeredBy.substring(0, 8)}...{machineData.registeredBy.substring(34)}
                </span>
              </div>
            </div>
          </div>

          {/* Off-Chain Supplementary Specs (MongoDB) */}
          <div className="card-industrial mb-4">
            <div className="card-header-industrial d-flex justify-content-between align-items-center">
              <span>Supplementary Telemetry</span>
              <span className="badge bg-dark text-secondary mono small">MongoDB Cached</span>
            </div>
            <div className="card-body p-3">
              <p className="text-muted small mb-3">
                {meta.description || "High-precision manufacturing apparatus equipped with smart sensory telemetry."}
              </p>
              <div className="d-flex justify-content-between py-2 border-bottom border-secondary small">
                <span className="text-muted">Operating Hours:</span>
                <span className="mono text-info">{meta.operatingHours || 1200} hrs</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom border-secondary small">
                <span className="text-muted">Criticality Level:</span>
                <span className="badge bg-warning text-dark">{meta.criticality || "High"}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom border-secondary small">
                <span className="text-muted">Assigned Operator:</span>
                <span className="text-light">{meta.operatorInCharge || "Sarah Jenkins"}</span>
              </div>
              <div className="d-flex justify-content-between py-2 small">
                <span className="text-muted">Service Interval:</span>
                <span className="text-light">{meta.recommendedServiceIntervalDays || 90} days</span>
              </div>
            </div>
          </div>

          {/* Machine Operational Status Management (On-Chain) */}
          {(roles.isAdmin || roles.isEngineer || roles.isOperator) && (
            <div className="card-industrial mb-4">
              <div className="card-header-industrial">
                <span>Update Ledger Status</span>
              </div>
              <div className="card-body p-3">
                <form onSubmit={handleStatusUpdate}>
                  <div className="mb-3">
                    <label className="form-label">New Operational State</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value={0}>Operational (Green)</option>
                      <option value={1}>Under Maintenance (Amber)</option>
                      <option value={2}>Awaiting Inspection (Cyan)</option>
                      <option value={3}>Decommissioned (Red)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-outline-primary btn-sm w-100"
                    disabled={isUpdatingStatus}
                  >
                    <i className="bi bi-pencil-square me-1" />
                    {isUpdatingStatus ? "Signing On-Chain..." : "Commit Status to Blockchain"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Operator Maintenance Request (Off-Chain) */}
          <div className="card-industrial">
            <div className="card-header-industrial d-flex justify-content-between align-items-center">
              <span>Operator Maintenance Request</span>
              <span className="badge bg-secondary small">Off-Chain</span>
            </div>
            <div className="card-body p-3">
              {requestSubmitted ? (
                <div className="alert alert-success small mb-0">
                  <i className="bi bi-check-circle me-1" /> Request logged in work order queue!
                </div>
              ) : (
                <form onSubmit={handleOperatorRequest}>
                  <div className="mb-2">
                    <label className="form-label">Urgency</label>
                    <select
                      className="form-select form-select-sm"
                      value={requestUrgency}
                      onChange={(e) => setRequestUrgency(e.target.value)}
                    >
                      <option value="Normal">Normal Maintenance</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent / Line Halt Risk</option>
                      <option value="Emergency Shutdown">Emergency Safety Stop</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Issue Summary</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      placeholder="e.g. Unusual hydraulic pressure oscillation..."
                      value={requestText}
                      onChange={(e) => setRequestText(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-warning btn-sm w-100 text-dark">
                    <i className="bi bi-send me-1" /> Submit Work Order Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Append-Only Chronological Service History Timeline */}
        <div className="col-12 col-lg-8">
          <div className="card-industrial">
            <div className="card-header-industrial d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-hourglass-split text-primary fs-5" />
                <span className="fs-5">Append-Only Service History & Verification Timeline</span>
              </div>
              <span className="badge bg-primary mono">
                {events.length} Historical Records
              </span>
            </div>

            <div className="card-body p-4">
              <div className="alert alert-dark border-secondary small mb-4">
                <i className="bi bi-shield-lock-fill text-info me-2 fs-6" />
                <strong>Tamper-Evident Immutability Guarantee:</strong> Every event below was mined on the Ethereum blockchain.
                Neither factory operators, maintenance technicians, nor system administrators can edit, overwrite, or delete past entries.
              </div>

              {events.length === 0 ? (
                <p className="text-muted text-center py-4">No service events recorded yet.</p>
              ) : (
                <div className="timeline-container">
                  {events.map((evt, idx) => {
                    const isMaint = evt.type === "MAINTENANCE";
                    const isInsp = evt.type === "INSPECTION";
                    const isReg = evt.type === "REGISTRATION";

                    let markerClass = "maint";
                    let markerIcon = "bi-tools";
                    if (isInsp) {
                      markerClass = evt.passed ? "insp-pass" : "insp-fail";
                      markerIcon = evt.passed ? "bi-check-lg" : "bi-x-lg";
                    } else if (isReg) {
                      markerClass = "reg";
                      markerIcon = "bi-flag-fill";
                    }

                    return (
                      <div key={idx} className="timeline-item">
                        {/* Marker circle */}
                        <div className={`timeline-marker ${markerClass}`}>
                          <i className={`bi ${markerIcon}`} />
                        </div>

                        {/* Event Card */}
                        <div className="card-industrial p-3 border-secondary">
                          <div className="d-flex flex-wrap justify-content-between align-items-start mb-2 gap-2">
                            <div>
                              <span className="badge bg-secondary me-2 small mono">#{idx + 1}</span>
                              {isReg && <span className="badge bg-warning text-dark me-2">COMMISSIONED</span>}
                              {isMaint && <span className="badge bg-primary me-2">MAINTENANCE RECORD</span>}
                              {isInsp && (
                                <span className={`badge me-2 ${evt.passed ? "bg-success" : "bg-danger"}`}>
                                  INSPECTION: {evt.passed ? "PASSED" : "FAILED"}
                                </span>
                              )}
                              <span className="fw-bold text-light">
                                {isReg ? evt.name : isMaint ? evt.maintenanceType : evt.inspectionType}
                              </span>
                            </div>

                            <div className="mono text-muted small">
                              <i className="bi bi-clock me-1" />
                              {new Date(evt.timestamp * 1000).toLocaleString()}
                            </div>
                          </div>

                          {/* Event Details */}
                          {isReg && (
                            <p className="text-muted small mb-2">{evt.details}</p>
                          )}

                          {isMaint && (
                            <div className="mb-2">
                              <div className="small mb-1">
                                <strong className="text-muted">Issue Identified: </strong>
                                <span className="text-light">{evt.problemDescription}</span>
                              </div>
                              <div className="small mb-1">
                                <strong className="text-muted">Work Performed: </strong>
                                <span className="text-light">{evt.workPerformed}</span>
                              </div>
                              {evt.partsReplaced && (
                                <div className="small mb-1">
                                  <strong className="text-muted">Parts Replaced: </strong>
                                  <span className="text-warning mono">{evt.partsReplaced}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {isInsp && (
                            <div className="mb-2">
                              <div className="small">
                                <strong className="text-muted">Inspector Evaluation Notes: </strong>
                                <span className="text-light">{evt.notes}</span>
                              </div>
                            </div>
                          )}

                          {/* Signer Address and Document Hash */}
                          <div className="pt-2 border-top border-secondary d-flex flex-wrap justify-content-between align-items-center gap-2 small">
                            <div className="d-flex align-items-center gap-1">
                              <span className="text-muted">Recorded By:</span>
                              <HashBadge hash={evt.actorAddress} length={8} />
                            </div>

                            {evt.documentHash && (
                              <div className="d-flex align-items-center gap-2">
                                <span className="text-muted">Doc Hash:</span>
                                <HashBadge hash={evt.documentHash} length={10} verified={true} />
                                <Link
                                  to={`/verify?hash=${encodeURIComponent(evt.documentHash)}&machineId=${machineData.machineId}`}
                                  className="btn btn-sm btn-outline-info py-0 px-2"
                                  title="Verify this hash on-chain"
                                >
                                  <i className="bi bi-patch-check me-1" /> Verify
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
