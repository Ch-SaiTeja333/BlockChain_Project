import React, { useState } from "react";
import { useTransactionModal } from "../context/TransactionModalContext";

export const TransactionStatusModal = () => {
  const { modalState, closeTxModal } = useTransactionModal();
  const [copied, setCopied] = useState(false);

  if (!modalState.isOpen) return null;

  const copyHash = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(3, 7, 18, 0.85)", backdropFilter: "blur(6px)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content card-industrial border-2" style={{ borderColor: modalState.status === "confirmed" ? "#10b981" : modalState.status === "failed" ? "#ef4444" : "#3b82f6" }}>
          <div className="modal-header border-bottom border-secondary d-flex justify-content-between align-items-center">
            <h5 className="modal-title industrial-heading d-flex align-items-center gap-2 mb-0">
              {modalState.status === "pending" && (
                <>
                  <span className="spinner-border spinner-border-sm text-primary" role="status" />
                  <span className="text-primary">{modalState.title}</span>
                </>
              )}
              {modalState.status === "confirmed" && (
                <>
                  <i className="bi bi-shield-check text-success fs-4" />
                  <span className="text-success">{modalState.title}</span>
                </>
              )}
              {modalState.status === "failed" && (
                <>
                  <i className="bi bi-shield-x text-danger fs-4" />
                  <span className="text-danger">{modalState.title}</span>
                </>
              )}
            </h5>
            {modalState.status !== "pending" && (
              <button type="button" className="btn-close btn-close-white" onClick={closeTxModal} />
            )}
          </div>

          <div className="modal-body p-4">
            <p className="text-light mb-3">{modalState.message}</p>

            {modalState.txHash && modalState.txHash.startsWith("0x") && (
              <div className="p-3 bg-dark rounded border border-secondary mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-muted small text-uppercase">Transaction Hash</span>
                  <button
                    className="btn btn-sm btn-outline-secondary py-0 px-2"
                    onClick={() => copyHash(modalState.txHash)}
                  >
                    <i className="bi bi-clipboard me-1" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="mono text-info text-break small">
                  {modalState.txHash}
                </div>
              </div>
            )}

            {modalState.blockNumber && (
              <div className="d-flex align-items-center justify-content-between p-2 px-3 bg-dark rounded border border-secondary mb-3">
                <span className="text-muted small text-uppercase">Mined in Block</span>
                <span className="badge bg-secondary mono fs-6">
                  #{modalState.blockNumber}
                </span>
              </div>
            )}

            {modalState.status === "failed" && modalState.errorMessage && (
              <div className="alert alert-danger mb-0 mono small">
                <strong>Error Details:</strong>
                <div className="mt-1">{modalState.errorMessage}</div>
              </div>
            )}

            {modalState.status === "pending" && (
              <div className="d-flex align-items-center gap-2 text-warning small mt-2">
                <i className="bi bi-hourglass-split" />
                <span>Synchronizing state with local node on chainId 31337...</span>
              </div>
            )}
          </div>

          <div className="modal-footer border-top border-secondary">
            {modalState.status === "pending" ? (
              <button className="btn btn-secondary btn-sm" disabled>
                Processing...
              </button>
            ) : (
              <button className="btn btn-primary btn-sm px-4" onClick={closeTxModal}>
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
