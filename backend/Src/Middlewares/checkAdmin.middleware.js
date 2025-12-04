import jwt from "jsonwebtoken";
import logger from "../../Config/logger.js";
import dotenv from "dotenv";

dotenv.config();

export const checkAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.token; 
    if (!token) {
      return res.status(401).json({success:false, message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET);

    // attach the user to req
    req.user = decoded;

    // check role
    if (decoded.role !== "admin") {
      return res.status(403).json({success:false, message: "Access denied: Only admin can access this feature" });
    }

    next();
  } catch (error) {
    logger.error(error);
    return res.status(401).json({ success:false, message: "Invalid or expired token" });
  }
};
