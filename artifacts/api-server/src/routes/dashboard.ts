import { Router } from "express";
import { getDashboardSummary, getRecentActivity } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/dashboard/summary",  getDashboardSummary);
router.get("/dashboard/activity", getRecentActivity);

export default router;
