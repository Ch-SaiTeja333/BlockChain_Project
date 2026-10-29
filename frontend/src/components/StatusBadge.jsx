import React from "react";

export const StatusBadge = ({ status, code }) => {
  let label = status;
  let statusCode = code;

  if (statusCode === undefined) {
    if (status === "Operational" || status === 0) statusCode = 0;
    else if (status === "UnderMaintenance" || status === "Under Maintenance" || status === 1) statusCode = 1;
    else if (status === "AwaitingInspection" || status === "Awaiting Inspection" || status === 2) statusCode = 2;
    else if (status === "Decommissioned" || status === 3) statusCode = 3;
    else statusCode = 0;
  }

  switch (Number(statusCode)) {
    case 0:
      return (
        <span className="badge badge-operational px-2 py-1 d-inline-flex align-items-center gap-1">
          <i className="bi bi-check-circle-fill text-success" />
          <span>Operational</span>
        </span>
      );
    case 1:
      return (
        <span className="badge badge-maintenance px-2 py-1 d-inline-flex align-items-center gap-1">
          <i className="bi bi-tools text-warning" />
          <span>Under Maintenance</span>
        </span>
      );
    case 2:
      return (
        <span className="badge badge-inspection px-2 py-1 d-inline-flex align-items-center gap-1">
          <i className="bi bi-clipboard-pulse text-info" />
          <span>Awaiting Inspection</span>
        </span>
      );
    case 3:
      return (
        <span className="badge badge-decommissioned px-2 py-1 d-inline-flex align-items-center gap-1">
          <i className="bi bi-slash-circle text-danger" />
          <span>Decommissioned</span>
        </span>
      );
    default:
      return <span className="badge bg-secondary">{label || "Unknown"}</span>;
  }
};
