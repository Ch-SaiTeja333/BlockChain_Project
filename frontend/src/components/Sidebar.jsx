import React from "react";
import { NavLink } from "react-router-dom";
import { useBlockchain } from "../context/BlockchainContext";

export const Sidebar = () => {
  const { roles } = useBlockchain();

  return (
    <aside
      className="card-industrial border-0 border-end rounded-0 p-3 h-100 d-flex flex-column"
      style={{ minWidth: "260px", maxWidth: "260px", minHeight: "calc(100vh - 65px)" }}
    >
      <div className="text-uppercase small text-muted fw-bold px-2 mb-2" style={{ fontSize: "0.72rem", letterSpacing: "1px" }}>
        Operations & Audit
      </div>

      <nav className="d-flex flex-column gap-1 mb-4">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <i className="bi bi-grid-1x2 text-primary" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/machines" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <i className="bi bi-cpu text-info" />
          <span>Industrial Equipment</span>
        </NavLink>

        <NavLink to="/verify" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <i className="bi bi-shield-check text-success" />
          <span>Document Integrity</span>
        </NavLink>

        <NavLink to="/ledger" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <i className="bi bi-journal-code text-warning" />
          <span>Blockchain Ledger</span>
        </NavLink>
      </nav>

      <div className="text-uppercase small text-muted fw-bold px-2 mb-2" style={{ fontSize: "0.72rem", letterSpacing: "1px" }}>
        On-Chain Actions
      </div>

      <nav className="d-flex flex-column gap-1 mb-4">
        <NavLink
          to="/register-machine"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <i className="bi bi-plus-circle text-danger" />
          <div className="d-flex justify-content-between align-items-center w-100">
            <span>Register Machine</span>
            <span className="badge bg-danger" style={{ fontSize: "0.65rem" }}>Admin</span>
          </div>
        </NavLink>

        <NavLink
          to="/add-maintenance"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <i className="bi bi-wrench-adjustable text-primary" />
          <div className="d-flex justify-content-between align-items-center w-100">
            <span>Add Maintenance</span>
            <span className="badge bg-primary" style={{ fontSize: "0.65rem" }}>Engineer</span>
          </div>
        </NavLink>

        <NavLink
          to="/add-inspection"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <i className="bi bi-clipboard2-check text-success" />
          <div className="d-flex justify-content-between align-items-center w-100">
            <span>Add Inspection</span>
            <span className="badge bg-success" style={{ fontSize: "0.65rem" }}>Inspector</span>
          </div>
        </NavLink>

        <NavLink
          to="/roles"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <i className="bi bi-people text-secondary" />
          <div className="d-flex justify-content-between align-items-center w-100">
            <span>Role Management</span>
            <span className="badge bg-danger" style={{ fontSize: "0.65rem" }}>Admin</span>
          </div>
        </NavLink>
      </nav>

      <div className="mt-auto pt-3 border-top border-secondary">
        <NavLink to="/login" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <i className="bi bi-wallet2 text-light" />
          <span>Wallet & Key Setup</span>
        </NavLink>
      </div>
    </aside>
  );
};
