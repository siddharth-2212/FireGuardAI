import type { Request, Response } from "express";
import { getAllAlerts, getAlertById, acknowledgeAlertById } from "../services/alert.service.js";
import { formatAlertResponse } from "../utils/format.js";
import { parseIntParam, sendInternalError } from "../utils/http.js";

export async function listAlerts(req: Request, res: Response): Promise<void> {
  try {
    const alerts = await getAllAlerts();
    res.json(alerts.map(formatAlertResponse));
  } catch (err) {
    sendInternalError(req, res, err, "listAlerts failed");
  }
}

export async function acknowledgeAlert(req: Request, res: Response): Promise<void> {
  const alertId = parseIntParam(req.params.id, "alert ID", res);
  if (alertId === null) return;

  try {
    const existing = await getAlertById(alertId);
    if (!existing) {
      res.status(404).json({ error: "Alert not found" });
      return;
    }

    const updated = await acknowledgeAlertById(alertId, existing.message, existing.sensorName);
    res.json(formatAlertResponse(updated));
  } catch (err) {
    sendInternalError(req, res, err, "acknowledgeAlert failed");
  }
}
