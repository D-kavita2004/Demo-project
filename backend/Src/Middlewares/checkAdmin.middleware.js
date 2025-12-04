import logger from "../../Config/logger.js";
import dotenv from "dotenv";

dotenv.config();

export const checkAdmin = (req, res, next) => {
  try {
    const {role} = req.user;
    // check role
    if (role !== "admin") {
      return res.status(403).json({success:false, message: "Access denied: Only admin can access this feature" });
    }

    next();
  } catch (error) {
    logger.error(error);
    return res.status(401).json({ success:false, message: "Invalid or expired token" });
  }
};
