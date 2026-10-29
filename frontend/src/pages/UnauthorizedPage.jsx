import React from "react";
import { Link } from "react-router-dom";
import { useBlockchain } from "../context/BlockchainContext";

export const UnauthorizedPage = () => {
  const { account, roles } = useBlockchain();

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 text-center">
          <div className="card-industrial p-5 border-danger">
            <div className="rounded-circle bg-danger bg-opacity-25 p-3 d-inline-flex align-items-center justify-content-center text-danger mb-3">
              <i className="bi bi-shield-lock-fill fs-1" />
            </div>

            <h3 className="industrial-heading fw-bold text-light mb-2">
              Unauthorized Blockchain Operation (403)
            </h3>
            <p className="text-muted mb-4">
              Your connected wallet does not hold the cryptographic role required to sign this transaction in the smart contract.
            </p>

            <div className="bg-dark p-3 rounded border border-secondary mb-4 text-start small">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Connected Account:</span>
                <span className="mono text-info">{account ? `${account.substring(0, 10)}...${account.substring(34)}` : "None"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Detected Role:</span>
                <span className="badge bg-secondary">{roles.roleLabel}</span>
              </div>
            </div>

            <div className="d-flex justify-content-center gap-3">
              <Link to="/login" className="btn btn-primary btn-sm px-4">
                <i className="bi bi-arrow-repeat me-1" /> Switch Active Wallet
              </Link>
              <Link to="/" className="btn btn-outline-secondary btn-sm px-4">
                <i className="bi bi-house me-1" /> Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
