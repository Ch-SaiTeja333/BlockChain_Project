import React, { useState } from "react";

export const HashBadge = ({ hash, length = 12, label, verified = false }) => {
  const [copied, setCopied] = useState(false);

  if (!hash) return <span className="text-muted small">None</span>;

  const display =
    hash.length > length * 2
      ? `${hash.substring(0, length)}...${hash.substring(hash.length - 6)}`
      : hash;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span
      className="d-inline-flex align-items-center gap-1 bg-dark px-2 py-1 rounded border border-secondary mono text-info small"
      style={{ cursor: "pointer", fontSize: "0.8rem" }}
      onClick={handleCopy}
      title={`Click to copy full value:\n${hash}`}
    >
      {verified && <i className="bi bi-patch-check-fill text-success" title="Verified on ledger" />}
      {label && <span className="text-muted me-1">{label}:</span>}
      <span>{display}</span>
      <i className={`bi ${copied ? "bi-check2 text-success" : "bi-clipboard text-muted"}`} />
    </span>
  );
};
