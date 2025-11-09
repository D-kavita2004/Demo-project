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
app.use("/auth",authRoutes);
app.use("/form",formRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK" });
});
app.get("/verify-token",verifyToken,(req,res)=>{
  return res.status(200).send(req.user);
});

app.use("/image", imageRoutes)

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });

    console.log("Database connected successfully.");
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err);
    process.exit(1); // Exit process if DB fails
  });
