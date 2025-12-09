import jwt from "jsonwebtoken";
import logger from "../../Config/logger.js";

const verifyToken = (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET);

    // Attach user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default verifyToken;
