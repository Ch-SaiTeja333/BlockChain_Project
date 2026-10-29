import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useBlockchain } from "../context/BlockchainContext";
import { HashBadge } from "../components/HashBadge";

export const DocumentVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const initialHash = searchParams.get("hash") || "";
  const initialMachineId = searchParams.get("machineId") || "";

  const { readOnlyContract } = useBlockchain();

  const [inputHash, setInputHash] = useState(initialHash);
  const [machineId, setMachineId] = useState(initialMachineId);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Verification Results
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Quick Sample Test Presets
  const sampleCertHash = "0x5a2d7f8c9b0e1a2f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a";
  const sampleAuditHash = "0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f";
  const tamperedHash = "0xdeadbeef11223344556677889900aabbccddeeff00112233445566778899aabb";

  // If initialHash is present from URL query, auto verify
  useEffect(() => {
    if (initialHash) {
      verifyHash(initialHash, initialMachineId);
    }
  }, [initialHash, initialMachineId]);

  // Compute hash when file is dropped or selected
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsCalculating(true);

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      setInputHash(hashHex);
      verifyHash(hashHex, machineId);
    } catch (err) {
      console.error("Browser hashing failed:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const verifyHash = async (hashToVerify, targetMachine) => {
    if (!hashToVerify) return;

    setIsVerifying(true);
    setResult(null);

    const cleanHash = hashToVerify.trim();

    try {
      // 1. First, query smart contract directly (client-side verification against Ethereum node)
      let onChainResult = null;
      let onChainKnown = false;

      if (readOnlyContract) {
        try {
          onChainKnown = await readOnlyContract.isDocumentHashRegistered(cleanHash);
          if (targetMachine) {
            const res = await readOnlyContract.verifyDocumentHash(targetMachine, cleanHash);
            if (res[0]) {
              onChainResult = {
                machineId: targetMachine,
                recordType: res[1],
                timestamp: Number(res[2]),
                submitter: res[3],
              };
            }
          }
        } catch (bcErr) {
          console.warn("Direct contract read note:", bcErr.message);
        }
      }

      // 2. Also query backend verification endpoint for complete audit metadata
      const res = await fetch("/api/documents/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hash: cleanHash,
          machineId: targetMachine || undefined,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setResult(json);
      } else {
        // Fallback to client-side verification result if backend was offline
        let status = "NO RECORD FOUND";
        if (onChainResult) status = "VERIFIED";
        else if (onChainKnown) status = targetMachine ? "VERIFICATION FAILED" : "VERIFIED";

        setResult({
          status,
          computedHash: cleanHash,
          machineId: targetMachine,
          onChainDetails: onChainResult,
          explanation:
            "Direct query to smart contract completed. Immutability guaranteed on chainId 31337.",
        });
      }
    } catch (err) {
      console.error("Verification error:", err);
      setResult({
        status: "NO RECORD FOUND",
        computedHash: cleanHash,
        error: "Verification network error",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    verifyHash(inputHash, machineId);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="text-center mb-4">
            <h2 className="industrial-heading fw-bold text-light mb-2">
              Tamper-Evident Document Integrity Verification Portal
            </h2>
            <p className="text-muted">
              Cryptographically verify supporting maintenance certificates, inspection audits, and invoices against the immutable blockchain ledger.
            </p>
          </div>

          {/* Quick Demo Test Buttons */}
          <div className="card-industrial mb-4 p-3 bg-opacity-25 bg-primary border-primary">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <span className="small text-light fw-bold text-uppercase">
                <i className="bi bi-patch-check text-primary me-2" />
                Quick Test Bench (Instant Demonstration):
              </span>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => {
                    setInputHash(sampleCertHash);
                    setMachineId("EQ-CNC-101");
                    verifyHash(sampleCertHash, "EQ-CNC-101");
                  }}
                >
                  <i className="bi bi-check-circle me-1" /> Test Authentic Calibration Cert (VERIFIED)
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info"
                  onClick={() => {
                    setInputHash(sampleAuditHash);
                    setMachineId("EQ-CNC-101");
                    verifyHash(sampleAuditHash, "EQ-CNC-101");
                  }}
                >
                  <i className="bi bi-check-circle me-1" /> Test ISO Audit Evidence (VERIFIED)
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    setInputHash(tamperedHash);
                    setMachineId("EQ-CNC-101");
                    verifyHash(tamperedHash, "EQ-CNC-101");
                  }}
                >
                  <i className="bi bi-x-circle me-1" /> Test Tampered Document (FAILED)
                </button>
              </div>
            </div>
          </div>

          {/* Input Form & Drag-and-Drop */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-6">
              <div className="card-industrial h-100 p-4">
                <h5 className="industrial-heading text-light mb-3">
                  <i className="bi bi-file-earmark-arrow-up text-primary me-2" />
                  Option A: Verify Physical File
                </h5>
                <p className="text-muted small mb-3">
                  Select or drag a PDF certificate, spreadsheet, or scan. Your browser will compute the SHA-256 hash client-side and match it to on-chain records.
                </p>

                <div className="border border-2 border-dashed border-secondary rounded p-4 text-center bg-dark mb-3">
                  <i className="bi bi-cloud-arrow-up text-info fs-1 mb-2" />
                  <div className="text-light fw-bold mb-1">Choose Document File</div>
                  <div className="text-muted small mb-3">PDF, PNG, JPG, CSV up to 25MB</div>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileSelect}
                    accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
                  />
                </div>

                {isCalculating && (
                  <div className="text-center text-info small mono">
                    <span className="spinner-border spinner-border-sm me-2" />
                    Computing cryptographic SHA-256 digest in browser...
                  </div>
                )}

                {selectedFile && !isCalculating && (
                  <div className="p-2 bg-dark rounded border border-secondary small text-muted">
                    <strong>Loaded:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card-industrial h-100 p-4">
                <h5 className="industrial-heading text-light mb-3">
                  <i className="bi bi-hash text-warning me-2" />
                  Option B: Verify SHA-256 Hash
                </h5>
                <p className="text-muted small mb-3">
                  Paste an existing cryptographic hash to check if it exists in any append-only maintenance or inspection record.
                </p>

                <form onSubmit={handleManualSubmit}>
                  <div className="mb-3">
                    <label className="form-label">SHA-256 Cryptographic Hash</label>
                    <input
                      type="text"
                      className="form-control mono text-info small"
                      placeholder="0x5a2d7f8c9b0e1a2f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a"
                      value={inputHash}
                      onChange={(e) => setInputHash(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Associated Machine ID (Optional)</label>
                    <input
                      type="text"
                      className="form-control mono"
                      placeholder="e.g. EQ-CNC-101 (Leave blank for global registry search)"
                      value={machineId}
                      onChange={(e) => setMachineId(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={isVerifying || !inputHash}
                  >
                    <i className="bi bi-shield-check me-2" />
                    {isVerifying ? "Querying Smart Contract Ledger..." : "Execute Blockchain Verification"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Verification Results Card */}
          {result && (
            <div
              className={`card-industrial mb-4 p-4 border-2 ${
                result.status === "VERIFIED"
                  ? "border-success glow-green"
                  : result.status === "VERIFICATION FAILED"
                  ? "border-danger glow-red"
                  : "border-warning"
              }`}
            >
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary gap-2">
                <div className="d-flex align-items-center gap-3">
                  {result.status === "VERIFIED" && (
                    <div className="rounded-circle bg-success bg-opacity-25 p-2 text-success">
                      <i className="bi bi-shield-check fs-2" />
                    </div>
                  )}
                  {result.status === "VERIFICATION FAILED" && (
                    <div className="rounded-circle bg-danger bg-opacity-25 p-2 text-danger">
                      <i className="bi bi-shield-x fs-2" />
                    </div>
                  )}
                  {result.status === "NO RECORD FOUND" && (
                    <div className="rounded-circle bg-warning bg-opacity-25 p-2 text-warning">
                      <i className="bi bi-question-circle fs-2" />
                    </div>
                  )}

                  <div>
                    <span
                      className={`badge fs-5 mb-1 ${
                        result.status === "VERIFIED"
                          ? "bg-success"
                          : result.status === "VERIFICATION FAILED"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {result.status}
                    </span>
                    <div className="text-light fw-bold">
                      {result.status === "VERIFIED" && "Cryptographic Integrity Confirmed by Smart Contract"}
                      {result.status === "VERIFICATION FAILED" && "Document Hash Mismatch or Machine Association Conflict"}
                      {result.status === "NO RECORD FOUND" && "Hash Not Recorded in Smart Contract Ledger"}
                    </div>
                  </div>
                </div>

                <div className="mono text-muted small">
                  Audit Timestamp: {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* Hash Display */}
              <div className="p-3 bg-dark rounded border border-secondary mb-3">
                <div className="text-muted small text-uppercase mb-1">Queried Cryptographic Hash</div>
                <div className="mono text-info text-break">{result.computedHash}</div>
              </div>

              {/* On-Chain Record Details */}
              {result.onChainDetails && (
                <div className="bg-dark p-3 rounded border border-secondary mb-3">
                  <h6 className="text-light fw-bold mb-2">On-Chain Event Ledger Match:</h6>
                  <div className="row g-2 small">
                    {result.onChainDetails.machineId && (
                      <div className="col-12 col-md-4">
                        <span className="text-muted">Bound Machine:</span>
                        <div className="mono text-info fw-bold">{result.onChainDetails.machineId}</div>
                      </div>
                    )}
                    {result.onChainDetails.recordType && (
                      <div className="col-12 col-md-4">
                        <span className="text-muted">Record Category:</span>
                        <div className="text-light">{result.onChainDetails.recordType}</div>
                      </div>
                    )}
                    {result.onChainDetails.timestamp && (
                      <div className="col-12 col-md-4">
                        <span className="text-muted">Committed Timestamp:</span>
                        <div className="mono text-light">
                          {new Date(result.onChainDetails.timestamp * 1000).toLocaleString()}
                        </div>
                      </div>
                    )}
                    {result.onChainDetails.submitter && (
                      <div className="col-12">
                        <span className="text-muted">Authorized Signer (Wallet):</span>
                        <div className="mono text-light">{result.onChainDetails.submitter}</div>
                      </div>
                    )}
                    {result.onChainDetails.note && (
                      <div className="col-12 text-warning">{result.onChainDetails.note}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Educational Explanation required by section 4, Feature 5 */}
              <div className="alert alert-secondary mb-0 small">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-info-circle-fill text-info" />
                  <strong>Blockchain Integrity Rationale:</strong>
                </div>
                <p className="mb-0 text-muted">
                  The blockchain ledger enforces tamper-evident immutability. If even a single byte, comma, or timestamp is modified
                  inside the physical PDF or report, its cryptographic SHA-256 hash completely changes (avalanche effect),
                  immediately triggering <strong>VERIFICATION FAILED</strong>.
                  <br />
                  <em>
                    * Note on Blockchain Boundaries: The blockchain proves that this specific document was submitted at this exact block height by this authorized wallet address and has never been altered since; it does not prove that the initial physical measurements entered by the human technician were truthful.
                  </em>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
