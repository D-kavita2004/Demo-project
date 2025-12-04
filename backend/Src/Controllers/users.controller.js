import User from "../Models/users.models.js";
import logger from "../../Config/logger.js";

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