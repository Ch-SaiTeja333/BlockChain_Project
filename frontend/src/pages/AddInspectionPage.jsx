import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useBlockchain } from "../context/BlockchainContext";
import { useTransactionModal } from "../context/TransactionModalContext";

export const AddInspectionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMachineId = searchParams.get("machineId") || "";

  const { contract, roles, account } = useBlockchain();
  const { showTxPending, showTxSuccess, showTxError } = useTransactionModal();

  const [machineList, setMachineList] = useState([]);
  const [formData, setFormData] = useState({
    machineId: initialMachineId,
    inspectionType: "ISO 9001:2015 Safety & Precision Audit",
    passed: true,
    inspectionNotes: "All 3-axis positional accuracy verified with laser interferometer (error < 2.0 microns). Emergency stop circuit and protective interlock sensors fully compliant.",
    evidenceHash: "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    metadataURI: "ipfs://QmSafetyInspectionCertificate2026",
  });

  const [attachedFile, setAttachedFile] = useState(null);
  const [isHashing, setIsHashing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

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

      setFormData((prev) => ({ ...prev, evidenceHash: hashHex }));

      // Upload off-chain
      const uploadFormData = new FormData();
      uploadFormData.append("document", file);
      uploadFormData.append("machineId", formData.machineId);
      uploadFormData.append("docType", "ISO Safety Audit Evidence");
      uploadFormData.append("uploadedBy", account || "");

      fetch("/api/documents/upload", {
        method: "POST",
        body: uploadFormData,
      }).catch((uploadErr) => console.warn("Document upload note:", uploadErr));
    } catch (err) {
      console.error("Hash calculation failed:", err);
    } finally {
      setIsHashing(false);
    }
  };

  const handlePreFill = (status) => {
    if (status === "pass") {
      setFormData((prev) => ({
        ...prev,
        inspectionType: "Annual OSHA / CE Conformity Audit",
        passed: true,
        inspectionNotes: "Light curtain safety stops triggered reliably under 12ms. Electrical grounding resistance 0.04 ohms. Machine approved for continuous duty.",
        evidenceHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        metadataURI: "ipfs://QmOSHAComplianceSignoff2026",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        inspectionType: "Post-Maintenance Vibration & Thermal Audit",
        passed: false,
        inspectionNotes: "FAILED: Hydraulic accumulator pressure fell below minimum threshold (140 bar vs 180 bar nominal). Risk of pressure hammer during rapid stroke.",
        evidenceHash: "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
        metadataURI: "ipfs://QmInspectionRejectionNotice2026",
      }));
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
      showTxPending(null, "Submitting Inspection Record to Blockchain Ledger...");

      // Call smart contract: addInspectionRecord(...)
      const tx = await contract.addInspectionRecord(
        formData.machineId.trim(),
        formData.inspectionType.trim(),
        formData.passed,
        formData.inspectionNotes.trim(),
        formData.evidenceHash.trim(),
        formData.metadataURI.trim()
      );

      showTxPending(tx.hash, "Mining Inspection Block on Ethereum Network...");

      const receipt = await tx.wait();

      showTxSuccess({
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        title: `Inspection Record [${formData.passed ? "PASSED" : "FAILED"}] Commited!`,
        message: `Inspection audit for machine [${formData.machineId}] recorded on-chain. Machine status updated accordingly.`,
      });

      setTimeout(() => {
        navigate(`/machines/${formData.machineId.trim()}`);
      }, 1500);
    } catch (err) {
      console.error("Inspection submission error:", err);
      showTxError({ error: err, title: "Inspection Submission Reverted" });
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
                Record Equipment Inspection
              </h2>
              <p className="text-muted small mb-0">
                Certified Inspectors log regulatory compliance and quality audits directly to the blockchain.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                onClick={() => handlePreFill("pass")}
              >
                <i className="bi bi-check-circle me-1" /> Preset: Passed Audit
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => handlePreFill("fail")}
              >
                <i className="bi bi-x-circle me-1" /> Preset: Failed Audit
              </button>
            </div>
          </div>

          {!roles.isInspector && (
            <div className="alert alert-warning border-warning d-flex align-items-center justify-content-between mb-4">
              <div>
                <i className="bi bi-shield-exclamation me-2 fs-5" />
                <strong>Role Notice:</strong> Only wallets granted with{" "}
                <code className="text-dark fw-bold">INSPECTOR_ROLE</code> on the smart contract can sign this record.
                Your current role: <strong>{roles.roleLabel}</strong>.
              </div>
              <Link to="/login" className="btn btn-sm btn-dark">
                Switch to Inspector Wallet
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
                    Inspection Type / Standard <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. ISO 9001:2015, OSHA Safety Inspection, Vibration Audit"
                    name="inspectionType"
                    value={formData.inspectionType}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Inspection Result Radio */}
                <div className="col-12">
                  <label className="form-label">
                    Audit Outcome <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex gap-4 p-3 bg-dark rounded border border-secondary">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="passedRadio"
                        id="outcomePass"
                        checked={formData.passed === true}
                        onChange={() => setFormData((prev) => ({ ...prev, passed: true }))}
                      />
                      <label className="form-check-label text-success fw-bold" htmlFor="outcomePass">
                        <i className="bi bi-check-circle-fill me-1" />
                        PASSED — Machine meets all precision and safety criteria (Sets Status to Operational)
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="passedRadio"
                        id="outcomeFail"
                        checked={formData.passed === false}
                        onChange={() => setFormData((prev) => ({ ...prev, passed: false }))}
                      />
                      <label className="form-check-label text-danger fw-bold" htmlFor="outcomeFail">
                        <i className="bi bi-x-circle-fill me-1" />
                        FAILED — Defect observed (Reverts Status to Under Maintenance)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Inspection Notes */}
                <div className="col-12">
                  <label className="form-label">
                    Inspection Notes & Technical Assessment <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Provide detailed measurements, calibration tolerance checks, safety switch responses..."
                    name="inspectionNotes"
                    value={formData.inspectionNotes}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Evidence Attachment and Cryptographic Hash */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Evidence Document (Checklist, Sensor Log, Photo)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
                  />
                  <div className="text-muted small" style={{ fontSize: "0.72rem" }}>
                    {isHashing
                      ? "Calculating SHA-256 evidence hash via WebCrypto..."
                      : "Document content is cryptographically digested in your browser."}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Calculated SHA-256 Evidence Hash (On-Chain Proof)</label>
                  <input
                    type="text"
                    className="form-control mono text-info small"
                    name="evidenceHash"
                    value={formData.evidenceHash}
                    onChange={handleChange}
                    required
                  />
                  <div className="text-muted small" style={{ fontSize: "0.72rem" }}>
                    Tamper-evident verification anchor for inspectors
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Metadata URI / Audit Log Link</label>
                  <input
                    type="text"
                    className="form-control mono small"
                    placeholder="ipfs://... or https://..."
                    name="metadataURI"
                    value={formData.metadataURI}
                    onChange={handleChange}
                  />
                </div>

                {/* Signer Info */}
                <div className="col-12 mt-3">
                  <div className="p-3 bg-dark rounded border border-secondary d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small">Signing Wallet (Certified Inspector):</div>
                      <div className="mono text-light small">{account || "No wallet connected"}</div>
                    </div>
                    <span className="badge bg-success">OpenZeppelin AccessControl</span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="col-12 mt-4 text-end">
                  <button
                    type="submit"
                    className={`btn px-4 py-2 ${formData.passed ? "btn-success" : "btn-danger"}`}
                    disabled={isSubmitting || !account}
                  >
                    <i className="bi bi-shield-check me-2" />
                    {isSubmitting ? "Mining Inspection..." : `Commit [${formData.passed ? "PASSED" : "FAILED"}] to Blockchain`}
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
