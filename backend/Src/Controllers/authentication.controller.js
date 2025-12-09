import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../Models/users.models.js";
import logger from "../../Config/logger.js";
import { forgetPasswordEmailConfig} from "../../Config/emailconfig.js";

dotenv.config();

// ------------------ LOGIN ------------------
export const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if(!user.enabled){
      return res.status(403).json({ message: "User is disabled" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid Password" });

    const { password: _, _id, ...userPayload } = user.toObject(); 
    const token = jwt.sign(userPayload, process.env.SECRET);
 
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
    });

    res.status(200).json({ 
      message: "Login successful",
      user:userPayload,
    });
  } catch (err) {
    logger.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// ------------------ LOGOUT ------------------
export const handleLogout = (req, res) => {
  logger.info("logout api called");
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    logger.error("Logout Failed:", err);
    res.status(500).json({ message: "Logout failed" });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "Cannot find user with this email",
      });
    }

    const token = jwt.sign(
      { userId: userData._id },
      process.env.RESET_PASSWORD_TOKEN,
      { expiresIn: process.env.RESET_LINK_EXPIRY },
    );

    const sent = await forgetPasswordEmailConfig(email, token);

    if (sent) {
      return res.status(200).json({
        success: true,
        message: "Reset Link Sent",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Could not send email",
      });
    }

  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const jwtToken = req.params.token;
    const { updatedPassword } = req.body;

    // Validate input
    if (!jwtToken || !updatedPassword) {
      return res.status(404).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(jwtToken, process.env.RESET_PASSWORD_TOKEN);
    } catch (err) {
      logger.error(err);
      return res.status(401).json({
        success: false,
        message: "Reset link has expired or is invalid",
      });
    }

    const userId = decoded.userId;

    // Find User
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const hashed = await bcrypt.hash(updatedPassword, 10);

    user.password = hashed;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    next(error);
  }
};
