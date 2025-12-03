import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../Models/users.models.js";
import logger from "../../Config/logger.js";
import nodemailer from "nodemailer";

dotenv.config();

// ------------------ LOGIN ------------------
export const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });

    if (!user)
      return res.status(404).json({ message: "User not found" });

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

// ------------------ SIGNUP ------------------
export const handleSignUp = async (req, res) => {
  logger.info("hitting signup api");
  const { username, email, firstName, lastName, password, role, team } = req.body;

  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      // Determine which field is duplicate
      let message = "User already exists";
      if (existingUser.username === username && existingUser.email === email) {
        message = "Username and Email already exist";
      } else if (existingUser.username === username) {
        message = "Username already exists";
      } else if (existingUser.email === email) {
        message = "Email already exists";
      }

      return res.status(409).json({ success: false, message });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, firstName, lastName, role: role || undefined, password: hashed,team });
    await newUser.save();

    res.status(200).json({success:true , message: "User registered successfully" });

  } catch (err) {
    logger.error("Register Error:", err);
    res.status(500).json({success: false, message: "Error registering user" });
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

export const forgotPassword = async(req,res,next)=>{
  try{
    const {email} = req.body;

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      return res.status(400).json({
        success:false,
        message:"Email is not valid",
      });                   
    }

    const userData = await User.findOne({username:email});
    logger.info(userData);
    if(userData){
      const token = jwt.sign({userId:userData._id},process.env.RESET_PASSWORD_TOKEN,{expiresIn:process.env.RESET_LINK_EXPIRY});

      //Email server configuration
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.APP_EMAIL,
          pass: process.env.PASSWORD_APP_EMAIL,
        },
      });
      const mailOptions = {
        from:process.env.APP_EMAIL,
        to:email,
        subject:"Reset password link",
        html:`<h1>RESET PASSWORD LINK</h1>
                        <p>Please click on the below link to reset your password</p>
                        <p><a href="${process.env.FRONTEND_URL}/reset-password/${token}">Click Here to Change Password</a></p>
                        <p>The link will expire in 10 minutes.</p>
                        <p>If you didn't request a password reset, please ignore this email.</p>`,
                        
      };

      await transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
          return res.status(500).json({ success:false,message:"Could not send email"});
        }
        return res.status(200).json({success:true,message:"Reset Link Sent"});
      });
    }
    else{
      return res.status(404).json({
        success:false,
        message:"Cannot find user with this email",
      });
    }
  }
  catch(error){
    next(error);
  }
};

export const resetPassword = async(req,res,next)=>{
  try{
    const {jwtToken,updatedPassword} = req.body;
    let id;

    const decodedData = jwt.verify(jwtToken,process.env.RESET_PASSWORD_TOKEN);

    if(decodedData){
      id = decodedData.userId;

      const salt = await bcrypt.genSalt(10);
      const hashedpassword = await bcrypt.hash(updatedPassword,salt);

      const user = await User.findOneAndUpdate({_id:id},{password:hashedpassword});
      if(!user){
        return res.status(404).json({
          success:false,
          message:"Colud not found the user",
        });
      }
      return res.status(200).json({
        success:true,
        message:"Password updated successfully",
      });
    }
    else{
      return res.status(401).json({
        success:false,
        message:"Link has been expired",
      });
    }
  }
  catch(error){
    next(error);
  }
};