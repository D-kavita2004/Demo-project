import User from "../Models/users.models.js";
import logger from "../../Config/logger.js";
import { shareCredentialEmailConfig } from "../../Config/emailconfig.js";
import bcrypt from "bcryptjs";
import Supplier from "../Models/suppliers.models.js";

export const getAllUsers = async(req,res)=>{
  try{
    const users = await User.find()
      .select("-password -__v -createdAt -updatedAt")
      .populate("team")
      .lean();

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
    // Check if username or email already exists
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

    // Check if team exists
    const teamExists = await Supplier.exists({ _id: team });
    if (!teamExists) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found, please register supplier first",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in one step
    const newUser = await User.create({
      username,
      email,
      firstName,
      lastName,
      role: role || undefined,
      password: hashedPassword,
      team,
    });

    // Populate team and sanitize user
    await newUser.populate("team");
    const { password: pwd, __v, createdAt, updatedAt, ...userObj } = newUser.toObject();

    logger.info("User registered successfully", userObj);

    // Send credentials email
    const emailSent = await shareCredentialEmailConfig(username, email, password);

    // Respond
    return res.status(201).json({
      success: true,
      message: emailSent
        ? "User registered successfully and credentials sent"
        : "User registered successfully but credentials email could not be sent",
      data: userObj,
    });

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
    const { firstName, lastName, email, team } = req.body;

    /* Check if team (Supplier) exists */
    if (team) {
      const teamExists = await Supplier.exists({ _id: team });
      if (!teamExists) {
        return res.status(404).json({
          message: "Supplier not found. Please register supplier first",
        });
      }
    }

    /* Check if email already exists (but not for same user) */
    if (email) {
      const emailExists = await User.findOne({
        email,
        username: { $ne: username }, // exclude current user
      });

      if (emailExists) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }

    /* Update user */
    const updatedUser = await User.findOneAndUpdate(
      { username },
      {
        $set: {
          firstName,
          lastName,
          email,
          team,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("team"); 

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

