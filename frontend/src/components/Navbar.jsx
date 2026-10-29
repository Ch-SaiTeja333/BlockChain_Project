import React from "react";
import { Link } from "react-router-dom";
import { useBlockchain } from "../context/BlockchainContext";

export const Navbar = () => {
  const {
    account,
    balance,
    chainId,
    isCorrectNetwork,
    roles,
    isConnecting,
    connectWallet,
    switchNetwork,
  } = useBlockchain();

  const getRoleBadge = () => {
    if (roles.isAdmin) return <span className="badge bg-danger">ADMINISTRATOR</span>;
    if (roles.isEngineer) return <span className="badge bg-primary">MAINTENANCE ENGINEER</span>;
    if (roles.isInspector) return <span className="badge bg-success">INSPECTOR</span>;
    if (roles.isOperator) return <span className="badge bg-warning text-dark">FACTORY OPERATOR</span>;
    return <span className="badge bg-secondary">AUDITOR / GUEST</span>;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark card-industrial border-0 border-bottom rounded-0 py-2 px-3 sticky-top">
      <div className="container-fluid px-0">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 mb-0">
          <div
            className="rounded p-1 d-flex align-items-center justify-content-center bg-primary bg-opacity-25 border border-primary"
            style={{ width: "36px", height: "36px" }}
          >
            <i className="bi bi-cpu-fill text-primary fs-5" />
          </div>
          <div>
            <div className="industrial-heading fw-bold fs-5 text-light text-uppercase mb-0" style={{ letterSpacing: "1px" }}>
              Industrial Equipment Ledger
            </div>
            <div className="text-muted small" style={{ fontSize: "0.68rem" }}>
              Tamper-Evident Maintenance & Service History
            </div>
          </div>
        </Link>

        {/* Right Info Section */}
        <div className="d-flex align-items-center gap-3 ms-auto">
          {/* Network Indicator */}
          {isCorrectNetwork ? (
            <span className="badge bg-dark border border-success text-success d-none d-md-inline-flex align-items-center gap-1 mono small">
              <span className="spinner-grow spinner-grow-sm text-success" style={{ width: "6px", height: "6px" }} />
              <span>Hardhat Network (31337)</span>
            </span>
          ) : (
            <button className="btn btn-sm btn-outline-danger py-1 px-2 mono small" onClick={switchNetwork}>
              <i className="bi bi-exclamation-triangle-fill me-1" />
              Switch to Hardhat (31337)
            </button>
          )}

          {/* Connected Role Badge */}
          <div className="d-none d-sm-block">{getRoleBadge()}</div>

          {/* Wallet Address & Balance */}
          {account ? (
            <div className="d-flex align-items-center gap-2 bg-dark p-1 ps-3 pe-2 rounded border border-secondary">
              <div className="text-end d-none d-md-block">
                <div className="mono text-light small fw-bold">{balance} ETH</div>
                <div className="mono text-muted small" style={{ fontSize: "0.7rem" }}>
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </div>
              </div>
              <div
                className="rounded-circle bg-primary bg-opacity-25 d-flex align-items-center justify-content-center text-primary"
                style={{ width: "32px", height: "32px" }}
              >
                <i className="bi bi-wallet2" />
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-2"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              <i className="bi bi-wallet2" />
              <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
