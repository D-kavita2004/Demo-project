import mongoose from "mongoose";

const connectDB = async()=>{
      try{
            mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`).then(()=>{
                  console.log("DB connection successful");
            })
      }
      catch(error){
            console.log("DB connection failed");
            console.log(error);
      }
}
export default connectDB;
