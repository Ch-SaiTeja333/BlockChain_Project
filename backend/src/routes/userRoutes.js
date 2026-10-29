const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserByWallet,
  upsertUser,
  getDemoAccounts,
} = require("../controllers/userController");

router.get("/", getUsers);
router.get("/demo-accounts", getDemoAccounts);
router.get("/:walletAddress", getUserByWallet);
router.post("/", upsertUser);

module.exports = router;
