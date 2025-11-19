import axios from "axios";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../Models/users.models.js";

dotenv.config();

// ------------------ LOGIN ------------------
export const handleLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });
    const payload = { username: user.username, id: user._id, team:user.team }
    const token = jwt.sign(payload, process.env.SECRET);
 
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
    });

    res.status(200).json({ 
      message: "Login successful",
      user:payload
     });
  } catch (err) {
    logger.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// ------------------ SIGNUP ------------------
export const handleSignUp = async (req, res) => {
  const { username, password, team } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(409).json({ message: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashed,team });
    await newUser.save();

    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    logger.error("Register Error:", err);
    res.status(500).json({ message: "Error registering user" });
  }
};

// ------------------ LOGOUT ------------------
export const handleLogout = (req, res) => {
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
