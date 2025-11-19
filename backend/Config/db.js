import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async()=>{
  try{
    mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`).then(()=>{
      logger.info("DB connection successful");
    });
  }
  catch(error){
    logger.error("DB connection failed");
    logger.error(error);
  }
};
export default connectDB;
