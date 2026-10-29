import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useBlockchain } from "../context/BlockchainContext";
import { useTransactionModal } from "../context/TransactionModalContext";

export const AddMaintenancePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMachineId = searchParams.get("machineId") || "";

  const { contract, roles, account } = useBlockchain();
  const { showTxPending, showTxSuccess, showTxError } = useTransactionModal();

  const [machineList, setMachineList] = useState([]);
  const [formData, setFormData] = useState({
    machineId: initialMachineId,
    maintenanceType: "Preventive Bearing Overhaul",
    problemDescription: "High-frequency vibration harmonics detected on main spindle drive.",
    workPerformed: "Extracted worn angular contact bearings, cleaned spindle taper, installed ceramic hybrid bearings, and recalibrated preload torque.",
    partsReplaced: "FAG Hybrid Ceramic Spindle Bearings #B7014-E-T-P4S-UL, Viton O-Ring Seals",
    metadataURI: "ipfs://QmSpindleOverhaulWorkOrder2026",
  });

  // Document attachment and hash
  const [attachedFile, setAttachedFile] = useState(null);
  const [computedDocHash, setComputedDocHash] = useState("0x5a2d7f8c9b0e1a2f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a");
  const [isHashing, setIsHashing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch machine IDs for selector dropdown
  useEffect(() => {
    fetch("/api/machines")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          setMachineList(json.data);
          if (!formData.machineId) {
            setFormData((prev) => ({ ...prev, machineId: json.data[0].machineId }));
          }
        }
      })
      .catch((err) => console.warn("Failed fetching machine list:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Browser-side SHA-256 computation using Web Crypto API
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAttachedFile(file);
    setIsHashing(true);

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      setComputedDocHash(hashHex);

      // Upload file to backend off-chain storage
      const uploadFormData = new FormData();
      uploadFormData.append("document", file);
      uploadFormData.append("machineId", formData.machineId);
      uploadFormData.append("docType", "Maintenance Work Report");
      uploadFormData.append("uploadedBy", account || "");

      fetch("/api/documents/upload", {
        method: "POST",
        body: uploadFormData,
      }).catch((uploadErr) => console.warn("Off-chain document upload notice:", uploadErr));
    } catch (err) {
      console.error("Hash calculation failed:", err);
    } finally {
      setIsHashing(false);
    }
  };

  const handlePreFill = (type) => {
    if (type === "hydraulic") {
      setFormData((prev) => ({
        ...prev,
        maintenanceType: "High-Pressure Hydraulic Seal Replacement",
        problemDescription: "Fluid seepage observed on cylinder rod gland during 300-bar pressing cycle.",
        workPerformed: "Depressurized hydraulic manifold, flushed line, replaced primary polyurethane rod seal and scraper ring. Re-torqued manifold flange to 180 Nm.",
        partsReplaced: "Parker PolyPak Rod Seal 90A, Parker H-Wiper Scraper",
        metadataURI: "ipfs://QmHydraulicServiceRecord9918",
      }));
      setComputedDocHash("0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b");
    } else if (type === "electrical") {
      setFormData((prev) => ({
        ...prev,
        maintenanceType: "Servo Drive Inverter Overhaul",
        problemDescription: "DC bus overvoltage error code E-702 tripped repeatedly on Y-axis traverse.",
        workPerformed: "Tested regenerative braking resistor bank. Found open-circuit power resistor. Replaced resistor and recalibrated servo drive loop gain.",
        partsReplaced: "Yaskawa Dynamic Braking Resistor 1500W 20-Ohm",
        metadataURI: "ipfs://QmElectricalDiagnosticTrace773",
      }));
      setComputedDocHash("0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!contract) {
      alert("Smart contract connection not available.");
      return;
    }

    try {
      setIsSubmitting(true);
      showTxPending(null, "Submitting Maintenance Record to Append-Only Blockchain Ledger...");

      // Call smart contract function: addMaintenanceRecord(...)
      const tx = await contract.addMaintenanceRecord(
        formData.machineId.trim(),
        formData.maintenanceType.trim(),
        formData.problemDescription.trim(),
        formData.workPerformed.trim(),
        formData.partsReplaced.trim(),
        computedDocHash.trim(),
        formData.metadataURI.trim()
      );

      showTxPending(tx.hash, "Mining Maintenance Block on Ethereum Network...");

      // Wait for block mining
      const receipt = await tx.wait();

      showTxSuccess({
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        title: "Maintenance Record Commited to Blockchain!",
        message: `Maintenance event permanently appended to machine [${formData.machineId}]. Immutability guaranteed.`,
      });

      setTimeout(() => {
        navigate(`/machines/${formData.machineId.trim()}`);
      }, 1500);
    } catch (err) {
      console.error("Maintenance submission error:", err);
      showTxError({ error: err, title: "Submission Reverted" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="industrial-heading fw-bold text-light mb-1">
                Record Maintenance Activity
              </h2>
              <p className="text-muted small mb-0">
                Authorized Maintenance Engineers submit service history directly to the append-only ledger.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handlePreFill("hydraulic")}
              >
                <i className="bi bi-magic me-1" /> Hydraulic Preset
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handlePreFill("electrical")}
              >
                <i className="bi bi-magic me-1" /> Servo Drive Preset
              </button>
            </div>
          </div>

          {!roles.isEngineer && (
            <div className="alert alert-warning border-warning d-flex align-items-center justify-content-between mb-4">
              <div>
                <i className="bi bi-shield-exclamation me-2 fs-5" />
                <strong>Role Notice:</strong> Only accounts assigned the{" "}
                <code className="text-dark fw-bold">MAINTENANCE_ENGINEER_ROLE</code> on-chain can submit.
                Your current role: <strong>{roles.roleLabel}</strong>.
              </div>
              <Link to="/login" className="btn btn-sm btn-dark">
                Switch to Engineer Wallet
              </Link>
            </div>
          )}

          <div className="card-industrial p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Target Equipment */}
                <div className="col-12 col-md-6">
                  <label className="form-label">
                    Target Machine ID <span className="text-danger">*</span>
                  </label>
                  {machineList.length > 0 ? (
                    <select
                      className="form-select mono"
                      name="machineId"
                      value={formData.machineId}
                      onChange={handleChange}
                      required
                    >
                      {machineList.map((m) => (
                        <option key={m.machineId} value={m.machineId}>
                          {m.machineId} — {m.name} ({m.factoryLocation})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-control mono text-info"
                      name="machineId"
                      value={formData.machineId}
                      onChange={handleChange}
                      placeholder="e.g. EQ-CNC-101"
                      required
                    />
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">
                    Maintenance Category / Type <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Preventive Spindle Alignment, Bearing Replacement..."
                    name="maintenanceType"
                    value={formData.maintenanceType}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Problem Description */}
                <div className="col-12">
                  <label className="form-label">
                    Problem Identified / Symptom Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Detailed description of anomaly, acoustic feedback, or error codes..."
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Work Performed */}
                <div className="col-12">
                  <label className="form-label">
                    Maintenance Work Performed <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Step-by-step procedures executed, calibrations performed, torque specifications..."
                    name="workPerformed"
                    value={formData.workPerformed}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Parts Replaced */}
                <div className="col-12">
                  <label className="form-label">Components & Parts Replaced</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Manufacturer part numbers, serial numbers of replacements..."
                    name="partsReplaced"
                    value={formData.partsReplaced}
                    onChange={handleChange}
                  />
                  <div className="text-muted small" style={{ fontSize: "0.72rem" }}>
                    Permanently binds the component serials to this machine's blockchain lifecycle.
                  </div>
                </div>

                {/* Document Attachment & Cryptographic Hashing */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Supporting Document (Calibration Cert, Log, Invoice)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
                  />
                  <div className="text-muted small" style={{ fontSize: "0.72rem" }}>
                    {isHashing
                      ? "Calculating SHA-256 hash in browser via WebCrypto..."
                      : "File is hashed in browser. Hash is committed to the blockchain, file is stored off-chain."}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Calculated SHA-256 Document Hash (On-Chain Proof)</label>
                  <input
                    type="text"
                    className="form-control mono text-info small"
                    value={computedDocHash}
                    onChange={(e) => setComputedDocHash(e.target.value)}
                    required
                  />
                  <div className="text-muted small" style={{ fontSize: "0.72rem" }}>
                    Tamper-evident verification anchor
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Metadata URI / Off-Chain Reference</label>
                  <input
                    type="text"
                    className="form-control mono small"
                    placeholder="ipfs://... or https://..."
                    name="metadataURI"
                    value={formData.metadataURI}
                    onChange={handleChange}
                  />
                </div>

                {/* Signer address info */}
                <div className="col-12 mt-3">
                  <div className="p-3 bg-dark rounded border border-secondary d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small">Signing Wallet (Maintenance Engineer):</div>
                      <div className="mono text-light small">{account || "No wallet connected"}</div>
                    </div>
                    <span className="badge bg-primary">OpenZeppelin AccessControl</span>
                  </div>
                </div>

                {/* Submit button */}
                <div className="col-12 mt-4 text-end">
                  <button
                    type="submit"
                    className="btn btn-primary px-4 py-2"
                    disabled={isSubmitting || !account}
                  >
                    <i className="bi bi-lock-fill me-2" />
                    {isSubmitting ? "Mining Transaction..." : "Append Maintenance Event to Blockchain"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
