const User = require("../models/User");
const { getContractData } = require("../config/blockchain");

const defaultUsers = [
  {
    walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase(),
    fullName: "Chief Engineer Marcus Vance",
    email: "marcus.vance@industry-mesh.io",
    role: "Administrator",
    department: "System Administration & Engineering Oversight",
    phone: "+1 (555) 019-2831",
  },
  {
    walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8".toLowerCase(),
    fullName: "Elena Rostova (Lead Technician)",
    email: "elena.rostova@maintenance-division.org",
    role: "Maintenance Engineer",
    department: "Machinery Diagnostics & Overhaul",
    phone: "+1 (555) 014-9923",
  },
  {
    walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC".toLowerCase(),
    fullName: "David Chen (ISO Certified Inspector)",
    email: "david.chen@industrial-safety-standards.org",
    role: "Inspector",
    department: "Quality Assurance & Compliance",
    phone: "+1 (555) 018-7744",
  },
  {
    walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906".toLowerCase(),
    fullName: "Sarah Jenkins (Plant Supervisor)",
    email: "sarah.jenkins@factory-floor-ops.net",
    role: "Factory Operator",
    department: "Detroit Facility Production Bay 4",
    phone: "+1 (555) 012-3456",
  },
];

const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    let users = await User.find(filter).sort({ createdAt: -1 });

    // If database is empty, return default demo users
    if (users.length === 0) {
      users = defaultUsers;
    }

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getUserByWallet = async (req, res, next) => {
  try {
    const walletAddress = req.params.walletAddress.toLowerCase();
    let user = await User.findOne({ walletAddress });

    if (!user) {
      const match = defaultUsers.find((u) => u.walletAddress === walletAddress);
      if (match) {
        user = match;
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user profile found for this wallet address",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const upsertUser = async (req, res, next) => {
  try {
    const { walletAddress, fullName, email, role, department, phone } = req.body;

    if (!walletAddress || !fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Wallet address, full name, and email are required",
      });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      {
        walletAddress: walletAddress.toLowerCase(),
        fullName,
        email: email.toLowerCase(),
        role: role || "Factory Operator",
        department: department || "Operations",
        phone: phone || "",
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getDemoAccounts = (req, res) => {
  const contractData = getContractData();
  res.json({
    success: true,
    data: {
      contractAddress: contractData ? contractData.address : null,
      accounts: defaultUsers,
    },
  });
};

module.exports = {
  getUsers,
  getUserByWallet,
  upsertUser,
  getDemoAccounts,
  defaultUsers,
};
