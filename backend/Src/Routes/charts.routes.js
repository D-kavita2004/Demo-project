import express from "express";
import { getDepartmentWiseData,getStatusWiseData } from "../Controllers/charts.controller.js";

const router = express.Router();

router.get("/department-wise", getDepartmentWiseData);
router.get("/status-wise",getStatusWiseData);

export default router;