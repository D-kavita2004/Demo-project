import express from "express";
import { getDepartmentWiseData,getFullStatusWiseData,getStatusWiseData } from "../Controllers/charts.controller.js";

const router = express.Router();

router.get("/department-wise", getDepartmentWiseData);
router.get("/status-wise",getStatusWiseData);
router.get("/",getFullStatusWiseData);

export default router;