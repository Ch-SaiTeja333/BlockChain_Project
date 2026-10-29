import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BlockchainProvider } from "./context/BlockchainContext";
import { TransactionModalProvider } from "./context/TransactionModalContext";
import { TransactionStatusModal } from "./components/TransactionStatusModal";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";

// Pages
import { DashboardPage } from "./pages/DashboardPage";
import { MachineListingPage } from "./pages/MachineListingPage";
import { MachineDetailsPage } from "./pages/MachineDetailsPage";
import { MachineRegistrationPage } from "./pages/MachineRegistrationPage";
import { AddMaintenancePage } from "./pages/AddMaintenancePage";
import { AddInspectionPage } from "./pages/AddInspectionPage";
import { DocumentVerificationPage } from "./pages/DocumentVerificationPage";
import { RoleManagementPage } from "./pages/RoleManagementPage";
import { TransactionHistoryPage } from "./pages/TransactionHistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";

function App() {
  return (
    <Router>
      <BlockchainProvider>
        <TransactionModalProvider>
          <div className="d-flex flex-column min-vh-100 bg-dark text-light">
            <Navbar />
            <div className="d-flex flex-grow-1">
              <Sidebar />
              <main className="flex-grow-1 p-0 overflow-auto" style={{ maxHeight: "calc(100vh - 65px)" }}>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/machines" element={<MachineListingPage />} />
                  <Route path="/machines/:id" element={<MachineDetailsPage />} />
                  <Route path="/register-machine" element={<MachineRegistrationPage />} />
                  <Route path="/add-maintenance" element={<AddMaintenancePage />} />
                  <Route path="/add-inspection" element={<AddInspectionPage />} />
                  <Route path="/verify" element={<DocumentVerificationPage />} />
                  <Route path="/roles" element={<RoleManagementPage />} />
                  <Route path="/ledger" element={<TransactionHistoryPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  <Route path="*" element={<UnauthorizedPage />} />
                </Routes>
              </main>
            </div>
            {/* Global Transaction Lifecycle Modal */}
            <TransactionStatusModal />
          </div>
        </TransactionModalProvider>
      </BlockchainProvider>
    </Router>
  );
}

export default App;
