import jwt from "jsonwebtoken";
import logger from "../../Config/logger.js";
import User from "../Models/users.models.js"; 
const verifyToken = async(req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET);

    const user = await User.findOne({ username: decoded.username }).populate("team");

    if (!user || !user.enabled) {
      return res.status(302).json({ message: "User not found" });
    }
    if (!user.enabled) {
      return res.status(302).json({ message: "User is disabled." });
    }
    if (user.role !== decoded.role) {
      return res.status(302).json({ message: "User role has been changed. Please Login Again" });
    }
    if (user.team.supplierCode !== decoded.team.supplierCode) {
      return res.status(302).json({ message: "Your Team has been changed. Please Login Again" });
    }

    // Attach user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Token verification failed:", error.message);
    return res.status(302).json({ message: "Session expired. Please login again !" });
  }
};

export default verifyToken;



//   "username": "dkavita",
//   "enabled": true,
//   "role": "admin",
//   "team": {
//     "supplierName": "it",
//     "flag": "IT",
//     "supplierCode": "SUP-aea03418-38b3-4435-86ee-73de23758ee2"
//   },
