const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow PDFs, images, docs, text, calibration data
  const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".csv", ".json", ".txt", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("File format not supported for document verification"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter,
});

const computeFileSha256 = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return "0x" + hashSum.digest("hex");
};

const computeBufferSha256 = (buffer) => {
  const hashSum = crypto.createHash("sha256");
  hashSum.update(buffer);
  return "0x" + hashSum.digest("hex");
};

module.exports = {
  upload,
  computeFileSha256,
  computeBufferSha256,
};
