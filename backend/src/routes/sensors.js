import { Router } from "express";
import { listSensors, getSensor } from "../controllers/sensor.controller.js";

export const sensorRouter = Router();

sensorRouter.get("/",    listSensors);
sensorRouter.get("/:id", getSensor);
