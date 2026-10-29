const fs = require("fs");
const path = require("path");
const { getContract } = require("../config/blockchain");
const DocumentRecord = require("../models/DocumentRecord");
const { computeFileSha256, computeBufferSha256 } = require("../middleware/upload");

/**
 * Upload a document (calibration sheet, service report, invoice, evidence),
 * compute its SHA-256 hash, store off-chain metadata, and return the hash for on-chain submission.
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file uploaded",
      });
    }

    const { machineId, docType, uploadedBy } = req.body;
    if (!machineId) {
      return res.status(400).json({
        success: false,
        message: "machineId is required",
      });
    }

    // Compute cryptographic SHA-256 hash of file content
    const sha256Hash = computeFileSha256(req.file.path);
    const docId = `DOC-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    const documentRecord = await DocumentRecord.create({
      docId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      filePath: `/uploads/${req.file.filename}`,
      sha256Hash,
      machineId,
      docType: docType || "Maintenance Work Report",
      uploadedBy: uploadedBy ? uploadedBy.toLowerCase() : "",
      verifiedOnChain: false,
    });

    res.status(201).json({
      success: true,
      message: "Document successfully processed and SHA-256 hash generated",
      data: {
        docId: documentRecord.docId,
        originalName: documentRecord.originalName,
        sha256Hash: documentRecord.sha256Hash,
        sizeBytes: documentRecord.sizeBytes,
        fileUrl: `/uploads/${req.file.filename}`,
        machineId,
        docType: documentRecord.docType,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify integrity of a document against on-chain records
 * Can verify either via an uploaded file OR via a provided SHA-256 hash string.
 */
const verifyDocument = async (req, res, next) => {
  try {
    let computedHash = "";
    let originalName = "";
    let fileSize = 0;

    if (req.file) {
      computedHash = computeFileSha256(req.file.path);
      originalName = req.file.originalname;
      fileSize = req.file.size;
    } else if (req.body.hash) {
      computedHash = req.body.hash.trim().toLowerCase();
      if (!computedHash.startsWith("0x")) {
        computedHash = "0x" + computedHash;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please upload a document file or provide a SHA-256 hash string to verify",
      });
    }

    const { machineId } = req.body;
    const contract = getContract();

    if (!contract) {
      return res.status(503).json({
        success: false,
        message: "Blockchain network connection unavailable",
      });
    }

    let verificationStatus = "NO RECORD FOUND";
    let onChainDetails = null;
    let isHashKnownGlobally = false;

    try {
      // 1. Check if hash exists anywhere globally on-chain
      isHashKnownGlobally = await contract.isDocumentHashRegistered(computedHash);

      // 2. If a specific machineId was provided, verify machine-specific association
      if (machineId) {
        const result = await contract.verifyDocumentHash(machineId, computedHash);
        const exists = result[0];
        const recordType = result[1];
        const timestamp = Number(result[2]);
        const submitter = result[3];

        if (exists) {
          verificationStatus = "VERIFIED";
          onChainDetails = {
            machineId,
            recordType,
            timestamp,
            dateFormatted: new Date(timestamp * 1000).toISOString(),
            submitter,
          };
        } else {
          // Check if hash belongs to another machine
          if (isHashKnownGlobally) {
            verificationStatus = "VERIFICATION FAILED";
            onChainDetails = {
              note: "Hash is registered on-chain, but belongs to a different machine or record.",
            };
          } else {
            verificationStatus = "NO RECORD FOUND";
          }
        }
      } else {
        // No machineId specified: global verification
        if (isHashKnownGlobally) {
          verificationStatus = "VERIFIED";
          onChainDetails = {
            note: "Hash matched an authentic immutable entry recorded on the blockchain.",
          };
        } else {
          verificationStatus = "NO RECORD FOUND";
        }
      }
    } catch (blockchainErr) {
      console.warn("Blockchain query error during verification:", blockchainErr.message);
    }

    // Lookup off-chain document record in MongoDB for metadata
    let docRecord = null;
    try {
      docRecord = await DocumentRecord.findOne({ sha256Hash: computedHash });
      if (docRecord && verificationStatus === "VERIFIED") {
        docRecord.verifiedOnChain = true;
        await docRecord.save();
      }
    } catch (e) {
      console.warn("MongoDB document lookup notice:", e.message);
    }

    const explanation =
      "Blockchain verification guarantees that this exact document payload was registered on the tamper-evident ledger and has not been altered since submission. " +
      "Note: Blockchain proves historical authenticity and tamper-detection; it does not independently certify the truthfulness of the original source.";

    res.json({
      success: true,
      status: verificationStatus,
      computedHash,
      fileName: originalName || (docRecord ? docRecord.originalName : "Manual Hash Query"),
      fileSize,
      machineId: machineId || (docRecord ? docRecord.machineId : null),
      onChainDetails,
      offChainRecord: docRecord || null,
      explanation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all uploaded documents
 */
const getDocuments = async (req, res, next) => {
  try {
    const { machineId } = req.query;
    const filter = {};
    if (machineId) filter.machineId = machineId;

    const docs = await DocumentRecord.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  verifyDocument,
  getDocuments,
};
