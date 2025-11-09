import express from "express";
import { imageUpload, upload } from "../Middlewares/upload.js";
const imageRoutes = express.Router();

imageRoutes.post("/productImage", upload.single("productImage"), imageUpload);




export default imageRoutes;