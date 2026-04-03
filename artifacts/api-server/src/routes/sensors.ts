import { Router } from "express";
import { listSensors, getSensor } from "../controllers/sensor.controller.js";

const router = Router();

router.get("/sensors",     listSensors);
router.get("/sensors/:id", getSensor);

export default router;
