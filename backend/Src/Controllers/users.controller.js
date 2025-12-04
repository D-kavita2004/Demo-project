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