import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import logger from "../../Config/logger.js";

// ------------------ STORAGE ------------------
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = "uploads";

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      logger.info("Created upload directory", { path: uploadPath });
    }

    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${crypto.randomUUID()}${ext}`;

    logger.info("File saved", {
      originalName: file.originalname,
      savedAs: filename,
      userId: req.user?.userId,
    });

    cb(null, filename);
  },
});

// ------------------ MULTER INSTANCE ------------------
export const upload = multer({
  storage, 
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// ------------------ SINGLE UPLOAD MIDDLEWARE ------------------
export const uploadImage = (req, res, next) => {
  upload.single("productImage")(req, res, (err) => {
    if (err) {
      logger.error("Upload failed", {
        error: err.message,
        userId: req.user?.userId,
      });

      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const protocol = req.get("x-forwarded-proto") || req.protocol;
    const host = req.get("host");

    req.fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    logger.info("Upload successful", {
      path: req.file.path,
      size: req.file.size,
      userId: req.user?.userId,
    });

    next();
  });
};
