import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import readline from "readline";

import User from "../Models/users.models.js";
import Supplier from "../Models/suppliers.models.js";
import logger from "../../Config/logger.js";

dotenv.config();

/* -----------------------------
   CLI Interface
----------------------------- */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

const askRequired = async (question) => {
  let value;
  do {
    value = (await ask(question)).trim();
    if (!value) {
      logger.error("!!! This field is required. Please enter a value.");
    }
  } while (!value);
  return value;
};

/* -----------------------------
   Create Admin
----------------------------- */
async function createAdmin() {
  try {
    await mongoose.connect(
      `${process.env.MONGO_URI}/${process.env.DB_NAME}`,
    );

    logger.info("Connected to MongoDB");

    /* Ensure IT supplier exists */
    let itSupplier = await Supplier.findOne({ supplierName: "it" });
    if (!itSupplier) {
      itSupplier = await Supplier.create({
        supplierName: "it",
        flag: "IT",
      });
      logger.info("IT supplier created");
    }

    /* Take admin details */
    const username = await askRequired("Username: ");
    const firstName = await askRequired("First Name: ");
    const lastName = await askRequired("Last Name: ");
    const email = await askRequired("Email: ");
    const password = await askRequired("Password: ");

    /* Check duplicates */
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      logger.warn("User with same username or email already exists");
      process.exit(0);
    }

    /* Hash password */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* Create admin */
    const adminUser = await User.create({
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "admin",
      team: itSupplier._id,
    });

    logger.info("Admin created successfully");
    logger.info({
      id: adminUser._id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
    });

    await mongoose.disconnect();
    rl.close();
    process.exit(0);
  } catch (error) {
    logger.error("Failed to create admin", error);
    await mongoose.disconnect();
    rl.close();
    process.exit(1);
  }
}

createAdmin();
