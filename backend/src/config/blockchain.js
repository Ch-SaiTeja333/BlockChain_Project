const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

let contract = null;
let provider = null;
let contractData = null;

const initBlockchain = () => {
  try {
    const contractDataPath = path.join(__dirname, "../contracts/contractData.json");
    if (!fs.existsSync(contractDataPath)) {
      console.warn("⚠️ contractData.json not yet available. Run Hardhat deployment first.");
      return null;
    }

    contractData = JSON.parse(fs.readFileSync(contractDataPath, "utf8"));
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
    provider = new ethers.JsonRpcProvider(rpcUrl);

    if (contractData.address && contractData.abi) {
      contract = new ethers.Contract(contractData.address, contractData.abi, provider);
      console.log(` Connected to smart contract at: ${contractData.address}`);
    }

    return { contract, provider, contractData };
  } catch (err) {
    console.warn("⚠️ Blockchain provider initialization note:", err.message);
    return null;
  }
};

const getContract = () => {
  if (!contract) {
    initBlockchain();
  }
  return contract;
};

const getProvider = () => {
  if (!provider) {
    initBlockchain();
  }
  return provider;
};

const getContractData = () => {
  if (!contractData) {
    initBlockchain();
  }
  return contractData;
};

module.exports = {
  initBlockchain,
  getContract,
  getProvider,
  getContractData,
};
