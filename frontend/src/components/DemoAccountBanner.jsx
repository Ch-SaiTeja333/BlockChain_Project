import React, { useState } from "react";
import { useBlockchain, DEMO_ACCOUNTS } from "../context/BlockchainContext";

export const DemoAccountBanner = () => {
  const { account, roles, setDemoRoleAccount } = useBlockchain();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  return (
    <div className="card-industrial mb-4 border-primary">
      <div className="card-header-industrial d-flex justify-content-between align-items-center py-2 px-3 bg-opacity-25 bg-primary">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-person-badge text-primary fs-5" />
          <span className="fw-bold small text-uppercase text-light">Role & Account Quick Switcher</span>
          <span className="badge bg-secondary small">Demo & Grading Helper</span>
        </div>
        <button
          className="btn btn-sm btn-outline-primary py-0 px-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <i className="bi bi-chevron-up me-1" /> Collapse
            </>
          ) : (
            <>
              <i className="bi bi-chevron-down me-1" /> Switch Roles / View Test Keys
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="card-body p-3">
          <p className="small text-muted mb-3">
            Switch between authorized actors with 1-click below or copy private keys to import into MetaMask.
            All contract transactions are signed and verified on-chain against OpenZeppelin AccessControl.
          </p>

          <div className="row g-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const isActive = account.toLowerCase() === acc.address.toLowerCase();

              return (
                <div key={acc.role} className="col-12 col-md-6 col-lg-3">
                  <div
                    className={`p-3 rounded border h-100 ${
                      isActive
                        ? "border-primary bg-primary bg-opacity-10 glow-blue"
                        : "border-secondary bg-dark"
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={acc.badgeClass}>{acc.role}</span>
                      {isActive && (
                        <span className="badge bg-success small">
                          <i className="bi bi-check-circle me-1" /> Active
                        </span>
                      )}
                    </div>
                    <div className="fw-bold text-light small mb-1">{acc.name}</div>
                    <div className="mono text-muted small text-break mb-2" style={{ fontSize: "0.75rem" }}>
                      {acc.address.substring(0, 10)}...{acc.address.substring(34)}
                    </div>
                    <p className="text-secondary small mb-3" style={{ fontSize: "0.75rem", minHeight: "2.5rem" }}>
                      {acc.description}
                    </p>

                    <div className="d-flex gap-2">
                      <button
                        className={`btn btn-sm flex-grow-1 ${
                          isActive ? "btn-primary disabled" : "btn-outline-primary"
                        }`}
                        onClick={() => setDemoRoleAccount(acc)}
                        disabled={isActive}
                      >
                        {isActive ? "Active Role" : "Switch to Role"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleCopy(acc.role, acc.privateKey)}
                        title="Copy Private Key for MetaMask import"
                      >
                        <i className={`bi ${copiedKey === acc.role ? "bi-check2 text-success" : "bi-key"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
