import logger from "../../Config/logger.js";
import dotenv from "dotenv";

dotenv.config();

// middleware/checkRole.js
export const checkAuthorization = ({ allowedFlags = [], allowedRoles = [] } = {}) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userFlag = req.user.team?.flag;
    const userRole = req.user.role;

    const isFlagAllowed = allowedFlags.includes(userFlag);
    const isRoleAllowed = allowedRoles.includes(userRole);

    if (!isFlagAllowed && !isRoleAllowed) {
      return res.status(403).json({
        error: "Access denied. You are not authorized for this action.",
      });
    }

    next();
  };
};

