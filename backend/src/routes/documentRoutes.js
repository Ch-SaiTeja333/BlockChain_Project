const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/upload");
const {
  uploadDocument,
  verifyDocument,
  getDocuments,
} = require("../controllers/documentController");

router.post("/upload", upload.single("document"), uploadDocument);
router.post("/verify", upload.single("document"), verifyDocument);
router.get("/", getDocuments);

module.exports = router;
