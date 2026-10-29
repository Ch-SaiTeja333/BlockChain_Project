import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBlockchain, DEMO_ACCOUNTS } from "../context/BlockchainContext";
import { useTransactionModal } from "../context/TransactionModalContext";
import { HashBadge } from "../components/HashBadge";

export const RoleManagementPage = () => {
  const { contract, roles, account, refreshRoles } = useBlockchain();
  const { showTxPending, showTxSuccess, showTxError } = useTransactionModal();

  const [targetAddress, setTargetAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState("ENGINEER");
  const [isProcessing, setIsProcessing] = useState(false);
  const [usersList, setUsersList] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success) {
        setUsersList(json.data);
      }
    } catch (err) {
      console.warn("Failed fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGrantRole = async (e) => {
    e.preventDefault();

    if (!contract) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!targetAddress || !targetAddress.startsWith("0x")) {
      alert("Please provide a valid Ethereum wallet address (0x...).");
      return;
    }

    try {
      setIsProcessing(true);
      showTxPending(null, `Authorizing ${selectedRole} on Smart Contract...`);

      let tx;
      if (selectedRole === "ENGINEER") {
        tx = await contract.authorizeEngineer(targetAddress.trim());
      } else if (selectedRole === "INSPECTOR") {
        tx = await contract.authorizeInspector(targetAddress.trim());
      } else if (selectedRole === "OPERATOR") {
        tx = await contract.authorizeOperator(targetAddress.trim());
      }

      showTxPending(tx.hash, "Mining Role Authorization Block...");

      const receipt = await tx.wait();

      showTxSuccess({
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        title: "Role Granted On-Chain!",
        message: `Address ${targetAddress} has been successfully granted ${selectedRole} permissions in OpenZeppelin AccessControl.`,
      });

      setTargetAddress("");
      refreshRoles();
      fetchUsers();
    } catch (err) {
      console.error("Role grant error:", err);
      showTxError({ error: err, title: "Role Authorization Failed" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevokeRole = async (address, roleToRevoke) => {
    if (!contract) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!window.confirm(`Are you sure you want to revoke ${roleToRevoke} authorization for ${address}?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      showTxPending(null, `Revoking ${roleToRevoke} Role on Smart Contract...`);

      let tx;
      if (roleToRevoke.includes("Engineer")) {
        tx = await contract.revokeEngineerAuthorization(address);
      } else if (roleToRevoke.includes("Inspector")) {
        tx = await contract.revokeInspectorAuthorization(address);
      } else if (roleToRevoke.includes("Operator")) {
        tx = await contract.revokeOperatorAuthorization(address);
      }

      showTxPending(tx.hash, "Mining Role Revocation Block...");

      const receipt = await tx.wait();

      showTxSuccess({
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        title: "Role Revoked On-Chain!",
        message: `Permissions for address ${address} have been permanently revoked on the smart contract.`,
      });

      refreshRoles();
      fetchUsers();
    } catch (err) {
      console.error("Role revoke error:", err);
      showTxError({ error: err, title: "Role Revocation Failed" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="industrial-heading fw-bold text-light mb-1">
                Role-Based Access Control (RBAC) Management
              </h2>
              <p className="text-muted small mb-0">
                Manage on-chain cryptographic authorizations for Engineers, Inspectors, and Operators via OpenZeppelin AccessControl.
              </p>
            </div>
          </div>

          {!roles.isAdmin && (
            <div className="alert alert-warning border-warning d-flex align-items-center justify-content-between mb-4">
              <div>
                <i className="bi bi-shield-exclamation me-2 fs-5" />
                <strong>Administrator Access Required:</strong> Only the deployer or admin wallet can authorize or revoke roles on-chain.
                Your current role is: <strong>{roles.roleLabel}</strong>.
              </div>
              <Link to="/login" className="btn btn-sm btn-dark">
                Switch to Admin Wallet
              </Link>
            </div>
          )}

          {/* Role Assignment Form Card */}
          <div className="card-industrial mb-4 p-4">
            <h5 className="industrial-heading text-light mb-3">
              <i className="bi bi-person-plus text-primary me-2" />
              Authorize New Personnel Address On-Chain
            </h5>

            <form onSubmit={handleGrantRole}>
              <div className="row g-3 align-items-end">
                <div className="col-12 col-md-6">
                  <label className="form-label">Personnel Ethereum Wallet Address (0x...)</label>
                  <input
                    type="text"
                    className="form-control mono text-info"
                    placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                    value={targetAddress}
                    onChange={(e) => setTargetAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-md-3">
                  <label className="form-label">Role to Grant</label>
                  <select
                    className="form-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="ENGINEER">Maintenance Engineer</option>
                    <option value="INSPECTOR">Certified Inspector</option>
                    <option value="OPERATOR">Factory Operator</option>
                  </select>
                </div>

                <div className="col-12 col-md-3">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={isProcessing || !roles.isAdmin}
                  >
                    <i className="bi bi-shield-check me-2" />
                    {isProcessing ? "Signing..." : "Grant Role On-Chain"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Active Authorized Roles Table */}
          <div className="card-industrial mb-4">
            <div className="card-header-industrial d-flex justify-content-between align-items-center">
              <span>Authorized System Personnel Directory</span>
              <span className="badge bg-secondary mono">Smart Contract Mappings</span>
            </div>

            <div className="table-responsive">
              <table className="table table-dark table-hover mb-0 align-middle">
                <thead className="table-secondary text-uppercase small text-muted">
                  <tr>
                    <th scope="col" className="ps-3">Name & Email</th>
                    <th scope="col">Role Assignment</th>
                    <th scope="col">Department</th>
                    <th scope="col">Wallet Address</th>
                    <th scope="col" className="pe-3 text-end">Access Control Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.walletAddress}>
                      <td className="ps-3">
                        <div className="text-light fw-bold">{u.fullName}</div>
                        <div className="text-muted small">{u.email}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === "Administrator"
                              ? "bg-danger"
                              : u.role === "Maintenance Engineer"
                              ? "bg-primary"
                              : u.role === "Inspector"
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="text-light small">{u.department}</td>
                      <td>
                        <HashBadge hash={u.walletAddress} length={8} />
                      </td>
                      <td className="pe-3 text-end">
                        {u.role !== "Administrator" ? (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRevokeRole(u.walletAddress, u.role)}
                            disabled={!roles.isAdmin || isProcessing}
                            title="Revoke Role On-Chain"
                          >
                            <i className="bi bi-person-x me-1" /> Revoke
                          </button>
                        ) : (
                          <span className="badge bg-dark text-muted mono">Super Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
