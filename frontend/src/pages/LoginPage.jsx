import React, { useState } from "react";
import { useBlockchain, DEMO_ACCOUNTS } from "../context/BlockchainContext";

export const LoginPage = () => {
  const {
    account,
    balance,
    roles,
    isConnecting,
    isCorrectNetwork,
    connectWallet,
    switchNetwork,
    setDemoRoleAccount,
  } = useBlockchain();

  const [copiedKey, setCopiedKey] = useState("");

  const copyToClipboard = (label, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="text-center mb-4">
            <h2 className="industrial-heading fw-bold text-light mb-2">
              Blockchain Ledger Authentication & Wallet Portal
            </h2>
            <p className="text-muted">
              Connect your Ethereum wallet (MetaMask) to interact with the immutable equipment maintenance ledger.
            </p>
          </div>

          {/* Active Connection Status Card */}
          <div className="card-industrial mb-4 p-4">
            <div className="row align-items-center">
              <div className="col-12 col-md-8">
                <h5 className="industrial-heading text-light mb-2">Current Connection State</h5>
                {account ? (
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-success">WALLET CONNECTED</span>
                      <span className="badge bg-primary">{roles.roleLabel}</span>
                    </div>
                    <div className="mono text-info small mb-1">
                      <strong>Address:</strong> {account}
                    </div>
                    <div className="mono text-muted small">
                      <strong>Balance:</strong> {balance} ETH | <strong>Network:</strong>{" "}
                      {isCorrectNetwork ? (
                        <span className="text-success">Hardhat Localhost (Chain ID: 31337)</span>
                      ) : (
                        <span className="text-danger">Incorrect Network</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted mb-0">
                    No wallet currently connected. Click connect below or select one of the pre-authorized actor accounts.
                  </p>
                )}
              </div>

              <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
                {account ? (
                  <div className="d-flex flex-column gap-2">
                    {!isCorrectNetwork && (
                      <button className="btn btn-warning btn-sm" onClick={switchNetwork}>
                        <i className="bi bi-arrow-repeat me-1" /> Switch to Chain 31337
                      </button>
                    )}
                    <button className="btn btn-outline-secondary btn-sm" onClick={connectWallet}>
                      <i className="bi bi-arrow-clockwise me-1" /> Refresh Account
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary px-4 py-2"
                    onClick={connectWallet}
                    disabled={isConnecting}
                  >
                    <i className="bi bi-wallet2 me-2" />
                    {isConnecting ? "Connecting to MetaMask..." : "Connect MetaMask Wallet"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* System Roles and Pre-Funded Demo Accounts */}
          <div className="card-industrial mb-4">
            <div className="card-header-industrial d-flex justify-content-between align-items-center">
              <span>Authorized System Roles (Hardhat Node Pre-Funded Accounts)</span>
              <span className="badge bg-info text-dark">Local Testnet Ready</span>
            </div>
            <div className="card-body p-4">
              <p className="text-muted small mb-4">
                In an industrial environment, cryptographic wallets are issued to verified personnel based on their duties.
                Click <strong>"Switch Active Actor"</strong> to simulate any of the four roles directly, or click the key icon to copy the private key into MetaMask.
              </p>

              <div className="row g-3">
                {DEMO_ACCOUNTS.map((actor) => {
                  const isActive = account.toLowerCase() === actor.address.toLowerCase();

                  return (
                    <div key={actor.role} className="col-12 col-md-6">
                      <div
                        className={`p-3 rounded border h-100 ${
                          isActive
                            ? "border-primary bg-primary bg-opacity-10 glow-blue"
                            : "border-secondary bg-dark"
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className={actor.badgeClass}>{actor.role}</span>
                          {isActive && <span className="badge bg-success small">CURRENTLY ACTIVE</span>}
                        </div>

                        <div className="fw-bold text-light mb-1">{actor.name}</div>
                        <p className="text-muted small mb-2">{actor.description}</p>

                        <div className="p-2 bg-black bg-opacity-50 rounded border border-secondary mono small text-break mb-3" style={{ fontSize: "0.78rem" }}>
                          <div className="text-secondary small mb-1">Wallet Address:</div>
                          <div className="text-info">{actor.address}</div>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            className={`btn btn-sm flex-grow-1 ${
                              isActive ? "btn-secondary disabled" : "btn-primary"
                            }`}
                            onClick={() => setDemoRoleAccount(actor)}
                            disabled={isActive}
                          >
                            <i className="bi bi-person-check me-1" />
                            {isActive ? "Active Role" : `Assume Role: ${actor.role}`}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => copyToClipboard(actor.role, actor.privateKey)}
                            title="Copy Private Key"
                          >
                            <i className={`bi ${copiedKey === actor.role ? "bi-check2 text-success" : "bi-key"}`} />
                            <span className="ms-1 small">
                              {copiedKey === actor.role ? "Copied" : "MetaMask Key"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick MetaMask Configuration Instructions */}
          <div className="card-industrial p-4">
            <h5 className="industrial-heading text-light mb-3">
              <i className="bi bi-info-circle text-primary me-2" />
              MetaMask Network Setup Guide
            </h5>
            <div className="row g-3 text-muted small">
              <div className="col-12 col-md-3">
                <strong className="text-light">Network Name:</strong>
                <div>Hardhat Localhost</div>
              </div>
              <div className="col-12 col-md-3">
                <strong className="text-light">RPC URL:</strong>
                <div className="mono text-info">http://127.0.0.1:8545</div>
              </div>
              <div className="col-12 col-md-3">
                <strong className="text-light">Chain ID:</strong>
                <div className="mono text-info">31337</div>
              </div>
              <div className="col-12 col-md-3">
                <strong className="text-light">Currency Symbol:</strong>
                <div className="mono text-info">ETH</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
