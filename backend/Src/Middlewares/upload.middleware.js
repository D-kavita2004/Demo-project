import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs";
// import { fileURLToPath } from "url";
import dotenv from "dotenv";
import logger from "../../Config/logger.js";

dotenv.config();
// Get current directory for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

//  Initialize S3 with logging
const s3 =
  process.env.NODE_ENV === "production"
    ? (() => {
      logger.info("Initializing AWS S3 client", {
        region: process.env.AWS_REGION,
        bucket: process.env.S3_BUCKET_NAME,
      });
      return new S3Client({
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        region: process.env.AWS_REGION,
      });
    })()
    : null;

// Disk storage for development
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/";

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      logger.info("Created upload directory", { path: uploadPath });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + ext;
    logger.info("File saved to disk", {
      originalName: file.originalname,
      savedAs: uniqueName,
    });
    cb(null, uniqueName);
  },
});

// S3 storage for production
const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req, file, cb) {
    cb(null, {
      uploadedBy: req.user?.userId || "unknown",
      uploadedAt: new Date().toISOString(),
    });
  },
  key: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const key = `uploads/${Date.now()}${ext}`;

    //  Log S3 upload attempt
    logger.info("Starting S3 upload", {
      originalName: file.originalname,
      key: key,
      bucket: process.env.S3_BUCKET_NAME,
      userId: req.user?.userId,
    });

    cb(null, key);
  },
});

const storage = process.env.NODE_ENV === "production" ? s3Storage : diskStorage;

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      logger.info("File passed validation", {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
      cb(null, true);
    } else {
      logger.warn("Invalid file type attempted for upload", {
        filename: file.originalname,
        mimetype: file.mimetype,
        userId: req.user?.userId,
      });
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

//  Enhanced image upload middleware with logging
export const imageUpload = (req, res) => {
  if (!req.file) {
    logger.warn("Image upload failed - no file provided", {
      userId: req.user?.userId,
    });
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  let fileUrl;

  if (process.env.NODE_ENV === "production") {
    // S3 upload
    fileUrl = req.file.location;

    //  Log successful S3 upload
    logger.info("Image uploaded to S3 successfully", {
      url: fileUrl,
      key: req.file.key,
      bucket: req.file.bucket,
      size: req.file.size,
      mimetype: req.file.mimetype,
      userId: req.user?.userId,
    });
  } else {
    // Local upload
    const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
    const host = req.get("host");
    fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    logger.info("Image uploaded to local disk successfully", {
      url: fileUrl,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      userId: req.user?.userId,
    });
  }

  req.fileUrl = fileUrl;

  return res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    url: fileUrl,
    filename: req.file.filename || req.file.key,
  });
};

//  Error handling middleware for multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error("Multer upload error", {
      error: err.message,
      code: err.code,
      field: err.field,
      userId: req.user?.userId,
    });

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    logger.error("Upload error", {
      error: err.message,
      userId: req.user?.userId,
    });

    return res.status(500).json({
      success: false,
      message: err.message || "File upload failed",
    });
  }

  next();
};