import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "../Models/users.models.js";
import Supplier from "../Models/suppliers.models.js";
import logger from "../../Config/logger.js";

dotenv.config();

async function createAdmin() {
  try {
    const conn = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);

    /* Check if admin exists */
    const adminExists = await User.exists({ role: "admin" });
    if (adminExists) {
      logger.info("Admin already exists");
      await mongoose.disconnect();
      process.exit(0);
    }

    /* Ensure IT supplier exists */
    let itSupplier = await Supplier.findOne({ supplierName: "it" });
    if (!itSupplier) {
      itSupplier = await Supplier.create({ supplierName: "it" });
      logger.info("IT supplier created");
    }

    /* Create admin */
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const adminUser = await User.create({
      username: "dkavita",
      firstName: "D",
      lastName: "Kavita",
      email: "dkavita@smartcodersconsulting.com",
      password: hashedPassword,
      role: "admin",
      team: itSupplier._id,
    });

    logger.info("Admin created successfully", adminUser);

    await mongoose.disconnect(); // <-- disconnect after everything
    process.exit(0);

  } catch (error) {
    logger.error("Failed to create admin", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();
