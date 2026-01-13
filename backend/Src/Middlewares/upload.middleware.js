import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import logger from "../../Config/logger.js";

// ------------------ STORAGE ------------------
const storage = multer.diskStorage({
  destination(req, file, cb) {
    let uploadPath;

    if (file.fieldname === "productImage") {
      uploadPath = "image-uploads";
    } else if (file.fieldname === "prodFile") {
      uploadPath = "production-docs";
    } else {
      return cb(new Error("Invalid file field"));
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      logger.info("Created upload directory", { path: uploadPath });
    }

    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${crypto.randomUUID()}${ext}`;

    logger.info("File saved", {
      field: file.fieldname,
      originalName: file.originalname,
      savedAs: filename,
      userId: req.user?.userId,
    });

    cb(null, filename);
  },
});

// ------------------ MULTER INSTANCE ------------------
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter(req, file, cb) {
    // product image (optional)
    if (
      file.fieldname === "productImage" &&
      file.mimetype.startsWith("image/")
    ) {
      return cb(null, true);
    }

    // production pdf (optional)
    if (
      file.fieldname === "prodFile" &&
      file.mimetype === "application/pdf"
    ) {
      return cb(null, true);
    }

    cb(new Error("Invalid file type or field name"));
  },
});

// ------------------ OPTIONAL FILE UPLOAD MIDDLEWARE ------------------
export const uploadFile = (req, res, next) => {

  upload.any()(req, res, (err) => {
    if (err) {
      logger.error("Upload failed", { error: err.message });
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // No file uploaded → perfectly valid
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const protocol = req.get("x-forwarded-proto") || req.protocol;
    const host = req.get("host");

    const file = req.files[0]; 

    if (file.fieldname === "productImage") {
      req.productImageUrl = `${protocol}://${host}/image-uploads/${file.filename}`;
    }

    if (file.fieldname === "prodFile") {
      req.prodFileUrl = `${protocol}://${host}/production-docs/${file.filename}`;
    }

    next();
  });
};
