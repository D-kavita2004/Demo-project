import User from "../Models/users.models.js";
import logger from "../../Config/logger.js";
import { shareCredentialEmailConfig } from "../../Config/emailconfig.js";
import bcrypt from "bcryptjs";
    
export const getAllUsers = async(req,res)=>{
  try{
    const users = await User.find(
      {}, 
      { password: 0, __v: 0, createdAt: 0, updatedAt: 0, _id:0 },
    ).lean();
    
    return res.status(200).json({
      success:true,
      data:users,
      message:"Users list fetched successfully",
    });
  }
  catch(err){
    logger.error(err);
    return res.status(500).json({
      success:false,
      message:"Something went wrong could not fetch users",
    });
  }
};

// ------------------ SIGNUP ------------------
export const handleSignUp = async (req, res) => {
  const { username, email, firstName, lastName, password, role, team } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      let message = "User already exists";

      if (existingUser.username === username && existingUser.email === email)
        message = "Username and Email already exist";
      else if (existingUser.username === username)
        message = "Username already exists";
      else if (existingUser.email === email)
        message = "Email already exists";

      return res.status(409).json({ success: false, message });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      firstName,
      lastName,
      role: role || undefined,
      password: hashed,
      team,
    });

    await newUser.save();

    // send email to share credentials
    const emailSent = await shareCredentialEmailConfig(username, email, password);

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: "User registered successfully and credentials sent",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "User registered but credentials email could not be sent",
      });
    }

  } catch (err) {
    logger.error("Register Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error registering user",
    });
  }
};

//Enable or disble the user status
export const changeUserStatus = async (req, res) => {
  try {
    const { username } = req.body;

    // Find the user first
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if(user.role === "admin"){
      return res.status(403).json({
        success: false,
        message: "Admin status cannot be changed",
      });
    }

    // Toggle status
    const newStatus = !user.enabled;

    // Update and return updated user
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { enabled: newStatus },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      newStatus: newStatus,
      message: `User status changed to ${newStatus ? "Enabled" : "Disabled"}`,
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      success: false,
      message: "User status could not be changed",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username } = req.params;

    const updatedUser = await User.findOneAndUpdate(
      { username },
      { $set: req.body },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    logger.err(err);
    return res.status(500).json({ message: "Server error" });
  }
};
