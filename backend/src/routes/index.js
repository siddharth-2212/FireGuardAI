import { Router } from "express";
import { sensorRouter }    from "./sensors.js";
import { alertRouter }     from "./alerts.js";
import { detectionRouter } from "./detection.js";
import { dashboardRouter } from "./dashboard.js";

export const router = Router();

router.get("/status", (_req, res) => {
  res.json({ status: "ok", service: "fireguard-ai-api", timestamp: new Date().toISOString() });
});

router.use("/sensor",    sensorRouter);
router.use("/sensors",   sensorRouter);
router.use("/alerts",    alertRouter);
router.use("/detect",    detectionRouter);
router.use("/dashboard", dashboardRouter);
