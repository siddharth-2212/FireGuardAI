import { Router } from "express";
import { runDetection } from "../controllers/detection.controller.js";

const router = Router();

router.post("/detect", runDetection);

export default router;
