import type { Request, Response } from "express";
import { buildDashboardSummary, fetchRecentActivityFeed } from "../services/dashboard.service.js";
import { formatActivityResponse } from "../utils/format.js";
import { sendInternalError } from "../utils/http.js";

export async function getDashboardSummary(req: Request, res: Response): Promise<void> {
  try {
    const summary = await buildDashboardSummary();
    res.json(summary);
  } catch (err) {
    sendInternalError(req, res, err, "getDashboardSummary failed");
  }
}

export async function getRecentActivity(req: Request, res: Response): Promise<void> {
  try {
    const events = await fetchRecentActivityFeed();
    res.json(events.map(formatActivityResponse));
  } catch (err) {
    sendInternalError(req, res, err, "getRecentActivity failed");
  }
}
