import { Router } from "express";
import { runDetection } from "../controllers/detection.controller.js";

export const detectionRouter = Router();

detectionRouter.post("/", runDetection);
