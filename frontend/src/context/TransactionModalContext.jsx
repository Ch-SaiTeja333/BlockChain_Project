import React, { createContext, useContext, useState } from "react";

const TransactionModalContext = createContext(null);

export const TransactionModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "idle", // 'pending' | 'confirmed' | 'failed'
    title: "",
    txHash: "",
    blockNumber: null,
    message: "",
    errorMessage: "",
  });

  const showTxPending = (txHash, title = "Submitting to Blockchain Ledger...") => {
    setModalState({
      isOpen: true,
      status: "pending",
      title,
      txHash: txHash || "Awaiting signature from wallet...",
      blockNumber: null,
      message: "Waiting for block confirmation on Ethereum network. Do not close this window.",
      errorMessage: "",
    });
  };

  const showTxSuccess = ({ txHash, blockNumber, title = "Transaction Confirmed!", message = "Record permanently committed to append-only blockchain ledger." }) => {
    setModalState({
      isOpen: true,
      status: "confirmed",
      title,
      txHash,
      blockNumber,
      message,
      errorMessage: "",
    });
  };

  const showTxError = ({ error, title = "Transaction Failed" }) => {
    let cleanMsg = error?.reason || error?.message || "User rejected or execution reverted";
    if (cleanMsg.includes("user rejected action")) {
      cleanMsg = "Transaction signature was cancelled by the user in MetaMask.";
    } else if (cleanMsg.includes("AccessControl")) {
      cleanMsg = "Smart Contract Access Denied: Your wallet address lacks the required role for this operation.";
    }

    setModalState({
      isOpen: true,
      status: "failed",
      title,
      txHash: "",
      blockNumber: null,
      message: "The smart contract rejected the transaction or an error occurred.",
      errorMessage: cleanMsg,
    });
  };

  const closeTxModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <TransactionModalContext.Provider
      value={{
        modalState,
        showTxPending,
        showTxSuccess,
        showTxError,
        closeTxModal,
      }}
    >
      {children}
    </TransactionModalContext.Provider>
  );
};

export const useTransactionModal = () => {
  const context = useContext(TransactionModalContext);
  if (!context) {
    throw new Error("useTransactionModal must be used within a TransactionModalProvider");
  }
  return context;
};
