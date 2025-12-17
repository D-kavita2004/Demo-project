import mongoose from "mongoose";
import dotenv from "dotenv";
import Supplier from "../Models/suppliers.models.js";
import logger from "../../Config/logger.js";

dotenv.config();

async function createQA() {
  try {
    const conn = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);

    /* Check if admin exists */
    const qa_team_exists = await Supplier.exists({ flag: "QA" });
    if (qa_team_exists) {
      logger.info("QA already exists");
      await mongoose.disconnect();
      process.exit(0);
    }
    else{
      const qa_team = await Supplier.create({ supplierName: "Quality", flag: "QA" });
      logger.info("QA Supplier created successfully");
    }

    await mongoose.disconnect(); // <-- disconnect after everything
    process.exit(0);

  } catch (error) {
    logger.error("Failed to create admin", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createQA();
