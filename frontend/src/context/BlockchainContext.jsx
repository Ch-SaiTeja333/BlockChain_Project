import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import contractData from "../contracts/contractData.json";

const BlockchainContext = createContext(null);

const HARDHAT_CHAIN_ID = 31337;
const HARDHAT_RPC = "http://127.0.0.1:8545";

// Role Keccak-256 Hashes matching Solidity contract
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const MAINTENANCE_ENGINEER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MAINTENANCE_ENGINEER_ROLE"));
const INSPECTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("INSPECTOR_ROLE"));
const FACTORY_OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("FACTORY_OPERATOR_ROLE"));

// Known sample accounts from Hardhat for effortless demoing
export const DEMO_ACCOUNTS = [
  {
    role: "Administrator",
    name: "Chief Engineer Marcus Vance",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    description: "Full administrative control: register machines, authorize/revoke roles.",
    badgeClass: "badge bg-danger",
  },
  {
    role: "Maintenance Engineer",
    name: "Elena Rostova (Lead Technician)",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    description: "Authorized to record maintenance activities, parts replaced, and upload documents.",
    badgeClass: "badge bg-primary",
  },
  {
    role: "Inspector",
    name: "David Chen (ISO Certified Inspector)",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111afa1a4b94908f83103eb2f954b10e0e641730e014f7200a1cb93d85f3",
    description: "Authorized to submit PASSED/FAILED inspections and compliance evidence.",
    badgeClass: "badge bg-success",
  },
  {
    role: "Factory Operator",
    name: "Sarah Jenkins (Plant Supervisor)",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    description: "Monitor machine operational status, request maintenance work orders.",
    badgeClass: "badge bg-warning text-dark",
  },
];

export const BlockchainProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [readOnlyContract, setReadOnlyContract] = useState(null);
  const [balance, setBalance] = useState("0.0");
  const [chainId, setChainId] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [roles, setRoles] = useState({
    isAdmin: false,
    isEngineer: false,
    isInspector: false,
    isOperator: false,
    roleLabel: "Guest / Auditor",
  });

  // 1. Initialize Read-Only Provider & Contract
  const initReadOnly = useCallback(() => {
    try {
      const readRpc = new ethers.JsonRpcProvider(HARDHAT_RPC);
      if (contractData && contractData.address && contractData.abi) {
        const c = new ethers.Contract(contractData.address, contractData.abi, readRpc);
        setReadOnlyContract(c);
        return c;
      }
    } catch (err) {
      console.warn("Read-only contract init warning:", err.message);
    }
    return null;
  }, []);

  // 2. Fetch roles on-chain for given address
  const fetchRolesForAddress = useCallback(
    async (targetAddress, targetContract) => {
      const c = targetContract || readOnlyContract;
      if (!c || !targetAddress) return;

      try {
        const [isAdmin, isEngineer, isInspector, isOperator] = await Promise.all([
          c.hasRole(DEFAULT_ADMIN_ROLE, targetAddress).catch(() => false),
          c.hasRole(MAINTENANCE_ENGINEER_ROLE, targetAddress).catch(() => false),
          c.hasRole(INSPECTOR_ROLE, targetAddress).catch(() => false),
          c.hasRole(FACTORY_OPERATOR_ROLE, targetAddress).catch(() => false),
        ]);

        let roleLabel = "Guest / Auditor";
        if (isAdmin) roleLabel = "Administrator";
        else if (isEngineer) roleLabel = "Maintenance Engineer";
        else if (isInspector) roleLabel = "Inspector";
        else if (isOperator) roleLabel = "Factory Operator";

        setRoles({
          isAdmin,
          isEngineer,
          isInspector,
          isOperator,
          roleLabel,
        });
      } catch (err) {
        console.warn("Error querying roles on-chain:", err.message);
      }
    },
    [readOnlyContract]
  );

  // 3. Connect Wallet (MetaMask)
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install MetaMask to interact with the blockchain.");
      return;
    }

    try {
      setIsConnecting(true);
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        const userAddress = accounts[0];
        setAccount(userAddress);

        const currentSigner = await browserProvider.getSigner();
        setSigner(currentSigner);

        const network = await browserProvider.getNetwork();
        const currentChainId = Number(network.chainId);
        setChainId(currentChainId);
        setIsCorrectNetwork(currentChainId === HARDHAT_CHAIN_ID);

        // Fetch balance
        const bal = await browserProvider.getBalance(userAddress);
        setBalance(Number(ethers.formatEther(bal)).toFixed(4));

        // Connect contract to signer
        if (contractData && contractData.address && contractData.abi) {
          const connectedContract = new ethers.Contract(
            contractData.address,
            contractData.abi,
            currentSigner
          );
          setContract(connectedContract);
          await fetchRolesForAddress(userAddress, connectedContract);
        }
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch network to Hardhat Localhost
  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7A69" }], // 31337 in hex
      });
    } catch (switchError) {
      // Chain not added yet, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x7A69",
                chainName: "Hardhat Localhost 8545",
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: [HARDHAT_RPC],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Hardhat network:", addError);
        }
      }
    }
  };

  // Helper for demo simulation (allows student demoing 4 roles directly in browser)
  const setDemoRoleAccount = async (demoAccount) => {
    try {
      const readRpc = new ethers.JsonRpcProvider(HARDHAT_RPC);
      const demoWallet = new ethers.Wallet(demoAccount.privateKey, readRpc);
      setAccount(demoWallet.address);
      setSigner(demoWallet);

      const bal = await readRpc.getBalance(demoWallet.address);
      setBalance(Number(ethers.formatEther(bal)).toFixed(4));

      if (contractData && contractData.address && contractData.abi) {
        const connectedContract = new ethers.Contract(
          contractData.address,
          contractData.abi,
          demoWallet
        );
        setContract(connectedContract);
        await fetchRolesForAddress(demoWallet.address, connectedContract);
      }
      setIsCorrectNetwork(true);
    } catch (err) {
      console.error("Failed switching to demo account:", err);
    }
  };

  // Initial load
  useEffect(() => {
    const rContract = initReadOnly();

    // Check if MetaMask is already connected
    if (window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      browserProvider.listAccounts().then(async (accounts) => {
        if (accounts.length > 0) {
          const userAddress = accounts[0].address;
          setAccount(userAddress);
          const currentSigner = await browserProvider.getSigner();
          setSigner(currentSigner);

          const network = await browserProvider.getNetwork();
          const currentChainId = Number(network.chainId);
          setChainId(currentChainId);
          setIsCorrectNetwork(currentChainId === HARDHAT_CHAIN_ID);

          const bal = await browserProvider.getBalance(userAddress);
          setBalance(Number(ethers.formatEther(bal)).toFixed(4));

          if (contractData && contractData.address && contractData.abi) {
            const connectedContract = new ethers.Contract(
              contractData.address,
              contractData.abi,
              currentSigner
            );
            setContract(connectedContract);
            fetchRolesForAddress(userAddress, connectedContract);
          }
        }
      });

      // Listen for account changes
      const handleAccountsChanged = (accs) => {
        if (accs.length > 0) {
          connectWallet();
        } else {
          setAccount("");
          setSigner(null);
          setContract(null);
          setRoles({
            isAdmin: false,
            isEngineer: false,
            isInspector: false,
            isOperator: false,
            roleLabel: "Guest / Auditor",
          });
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [initReadOnly, fetchRolesForAddress]);

  return (
    <BlockchainContext.Provider
      value={{
        account,
        provider,
        signer,
        contract,
        readOnlyContract,
        balance,
        chainId,
        isCorrectNetwork,
        isConnecting,
        roles,
        contractAddress: contractData?.address || "",
        connectWallet,
        switchNetwork,
        setDemoRoleAccount,
        refreshRoles: () => fetchRolesForAddress(account, contract || readOnlyContract),
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
};
