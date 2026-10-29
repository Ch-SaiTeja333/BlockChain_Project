import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useBlockchain } from "../context/BlockchainContext";
import { useTransactionModal } from "../context/TransactionModalContext";

export const MachineRegistrationPage = () => {
  const navigate = useNavigate();
  const { contract, roles, account } = useBlockchain();
  const { showTxPending, showTxSuccess, showTxError } = useTransactionModal();

  const [formData, setFormData] = useState({
    machineId: "",
    name: "",
    category: "Machining & Milling",
    manufacturer: "",
    modelNumber: "",
    serialNumber: "",
    factoryLocation: "Main Plant Detroit - Bay 4",
    installationDate: new Date().toISOString().split("T")[0],
    description: "",
    criticality: "High",
    department: "Precision Aerostructures",
    operatorInCharge: "Sarah Jenkins",
    recommendedServiceIntervalDays: 90,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreFill = (sampleType) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    if (sampleType === "cnc") {
      setFormData({
        machineId: `EQ-CNC-${randomSuffix}`,
        name: "DMG MORI 5-Axis Universal Milling Machine",
        category: "Machining & Milling",
        manufacturer: "DMG MORI",
        modelNumber: "DMU 50 3rd Gen",
        serialNumber: `SN-DMG-${randomSuffix}-DE`,
        factoryLocation: "Facility 2 - Machining Cell 3",
        installationDate: new Date().toISOString().split("T")[0],
        description: "Equipped with CELOS Siemens control and 20,000 rpm speedMASTER spindle.",
        criticality: "Mission Critical",
        department: "Precision Aerostructures",
        operatorInCharge: "Michael Chang",
        recommendedServiceIntervalDays: 45,
      });
    } else if (sampleType === "welder") {
      setFormData({
        machineId: `EQ-ROB-${randomSuffix}`,
        name: "ABB Automated Laser Welding Cell",
        category: "Assembly & Welding",
        manufacturer: "ABB Robotics",
        modelNumber: "IRB 2600ID",
        serialNumber: `SN-ABB-${randomSuffix}-SE`,
        factoryLocation: "Assembly Hall 4 - Line 2",
        installationDate: new Date().toISOString().split("T")[0],
        description: "Integrated process dressing with hollow wrist for continuous seam welding.",
        criticality: "High",
        department: "Automated Body-In-White Assembly",
        operatorInCharge: "Elena Rostova",
        recommendedServiceIntervalDays: 60,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!contract) {
      alert("Smart contract connection not available. Check network.");
      return;
    }

    try {
      setIsSubmitting(true);
      showTxPending(null, "Submitting Machine Registration to Blockchain...");

      const installTimestamp = Math.floor(new Date(formData.installationDate).getTime() / 1000);

      // Call smart contract function: registerMachine(...)
      const tx = await contract.registerMachine(
        formData.machineId.trim(),
        formData.name.trim(),
        formData.category.trim(),
        formData.manufacturer.trim(),
        formData.modelNumber.trim(),
        formData.serialNumber.trim(),
        formData.factoryLocation.trim(),
        installTimestamp
      );

      showTxPending(tx.hash, "Mining Machine Registration Block...");

      // Wait for block mining
      const receipt = await tx.wait();

      // Save off-chain metadata to MongoDB
      try {
        await fetch(`/api/machines/${formData.machineId.trim()}/metadata`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: formData.description,
            criticality: formData.criticality,
            department: formData.department,
            operatorInCharge: formData.operatorInCharge,
            recommendedServiceIntervalDays: Number(formData.recommendedServiceIntervalDays),
          }),
        });
      } catch (metaErr) {
        console.warn("Notice: Saved on-chain, off-chain metadata sync note:", metaErr.message);
      }

      showTxSuccess({
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        title: "Industrial Machine Registered On-Chain!",
        message: `Machine [${formData.machineId}] has been permanently minted into the immutable registry.`,
      });

      setTimeout(() => {
        navigate(`/machines/${formData.machineId.trim()}`);
      }, 1500);
    } catch (err) {
      console.error("Machine registration error:", err);
      showTxError({ error: err, title: "Registration Reverted" });
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
                Register New Industrial Equipment
              </h2>
              <p className="text-muted small mb-0">
                Authorizes a new physical machine and anchors its cryptographic genesis record on the ledger.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handlePreFill("cnc")}
              >
                <i className="bi bi-magic me-1" /> Auto-Fill CNC Mill
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handlePreFill("welder")}
              >
                <i className="bi bi-magic me-1" /> Auto-Fill Robot Cell
              </button>
            </div>
          </div>

          {!roles.isAdmin && (
            <div className="alert alert-warning border-warning d-flex align-items-center justify-content-between mb-4">
              <div>
                <i className="bi bi-shield-exclamation me-2 fs-5" />
                <strong>Role Notice:</strong> Only wallets granted with{" "}
                <code className="text-dark fw-bold">DEFAULT_ADMIN_ROLE</code> can sign this transaction.
                Your current role is: <strong>{roles.roleLabel}</strong>.
              </div>
              <Link to="/login" className="btn btn-sm btn-dark">
                Switch to Admin Wallet
              </Link>
            </div>
          )}

          <div className="card-industrial p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Section 1: On-Chain Core Identity */}
                <div className="col-12">
                  <h5 className="industrial-heading text-primary border-bottom border-secondary pb-2 mb-3">
                    1. On-Chain Cryptographic Specifications (Solidity Contract)
                  </h5>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">
                    Machine ID <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control mono text-info"
                    placeholder="e.g. EQ-CNC-401"
                    name="machineId"
                    value={formData.machineId}
                    onChange={handleChange}
                    required
                  />
                  <div className="text-muted small" style={{ fontSize: "0.72rem" }}>
                    Must be globally unique on-chain
                  </div>
                </div>

                <div className="col-12 col-md-8">
                  <label className="form-label">
                    Machine Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Haas 5-Axis High Precision Machining Center"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">Equipment Category</label>
                  <select
                    className="form-select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Machining & Milling">Machining & Milling</option>
                    <option value="Assembly & Welding">Assembly & Welding</option>
                    <option value="Heavy Press & Forging">Heavy Press & Forging</option>
                    <option value="Packaging & Material Handling">Packaging & Material Handling</option>
                    <option value="Inspection & Metrology">Inspection & Metrology</option>
                  </select>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">
                    Manufacturer <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Haas Automation / KUKA / DMG MORI"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">Model Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. UMC-750SS"
                    name="modelNumber"
                    value={formData.modelNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">
                    Serial Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control mono"
                    placeholder="e.g. SN-HAAS-9982"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">
                    Installation Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    name="installationDate"
                    value={formData.installationDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">
                    Factory / Plant Location <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Detroit Plant - Bay 4"
                    name="factoryLocation"
                    value={formData.factoryLocation}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Section 2: Off-Chain Supplementary Data */}
                <div className="col-12 mt-4">
                  <h5 className="industrial-heading text-secondary border-bottom border-secondary pb-2 mb-3">
                    2. Off-Chain Supplementary Metadata (MongoDB Storage)
                  </h5>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">Criticality Level</label>
                  <select
                    className="form-select"
                    name="criticality"
                    value={formData.criticality}
                    onChange={handleChange}
                  >
                    <option value="Low">Low - Redundant Standby</option>
                    <option value="Medium">Medium - Line Supportive</option>
                    <option value="High">High - Core Production</option>
                    <option value="Mission Critical">Mission Critical - Zero Downtime</option>
                  </select>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">Assigned Department</label>
                  <input
                    type="text"
                    className="form-control"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">Recommended Interval (Days)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="recommendedServiceIntervalDays"
                    value={formData.recommendedServiceIntervalDays}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Equipment Operational Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Operational parameters, duty cycles, sensory telemetry channels..."
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Submit Button */}
                <div className="col-12 mt-4 text-end">
                  <button
                    type="submit"
                    className="btn btn-primary px-4 py-2"
                    disabled={isSubmitting}
                  >
                    <i className="bi bi-link-45deg me-2" />
                    {isSubmitting ? "Submitting Transaction..." : "Sign & Mint Machine to Blockchain"}
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
