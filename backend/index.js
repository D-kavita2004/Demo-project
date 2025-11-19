import logger from "./Config/logger.js";

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Config/db.js";
import express from "express";
import authRoutes from "./Src/Routes/authentication.routes.js";
import verifyToken from "./Src/Middlewares/verifyToken.middleware.js";
import formRoutes from "./Src/Routes/form.routes.js"
import imageRoutes from "./Src/Routes/imageRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL, // frontend URL
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/auth",authRoutes);
app.use("/form",verifyToken,formRoutes);
app.use("/image",verifyToken, imageRoutes)

app.get("/verify-token",verifyToken,(req,res)=>{
  return res.status(200).send(req.user);
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT,"0.0.0.0", () => {
      logger.info(`Server is running on http://0.0.0.0:${process.env.PORT}`);
    });

    logger.info("Database connected successfully.");
  })
  .catch((err) => {
    logger.error("Failed to connect to DB:", err);
    process.exit(1); // Exit process if DB fails
  });
