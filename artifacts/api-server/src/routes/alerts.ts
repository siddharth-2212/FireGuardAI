import { Router } from "express";
import { listAlerts, acknowledgeAlert } from "../controllers/alert.controller.js";

const router = Router();

router.get("/alerts",                    listAlerts);
router.post("/alerts/:id/acknowledge",   acknowledgeAlert);

export default router;
