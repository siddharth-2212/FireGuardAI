import { Router } from "express";
import { listAlerts, acknowledgeAlert } from "../controllers/alert.controller.js";

export const alertRouter = Router();

alertRouter.get("/",                    listAlerts);
alertRouter.post("/:id/acknowledge",    acknowledgeAlert);
