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
    console.error("Login Error:", err);
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
    console.error("Register Error:", err);
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
    console.error("Logout Failed:", err);
    res.status(500).json({ message: "Logout failed" });
  }
};

// ------------------ GOOGLE AUTH REDIRECT ------------------
export const handleRedirectionToGoogleAuthServer = (req, res) => {
  const scope = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ].join(" ");

  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=${scope}&access_type=offline&prompt=consent`;

  res.redirect(redirectUrl);
};

// ------------------ GOOGLE AUTH CALLBACK ------------------
export const handleGoogleAuthCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    const userInfo = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // Check if user exists or create new one
    let user = await User.findOne({ email: userInfo.data.email });
    if (!user) {
      user = await User.create({
        username: userInfo.data.name,
        email: userInfo.data.email,
        googleId: userInfo.data.id,
      });
    }

    const token =  jwt.sign({ username: user.username, id: user._id, team:user.team });

    res.cookie("token", token, { httpOnly: true });
    res.redirect(`${process.env.FRONTEND_URL}/index.html`);
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).send("Error during Google authentication");
  }
};
