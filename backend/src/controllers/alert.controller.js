import { getAllAlerts, getAlertById, acknowledgeAlertById } from "../services/alert.service.js";
import { formatAlert } from "../utils/format.js";
import { parseIntParam, sendInternalError } from "../utils/http.js";

export async function listAlerts(req, res) {
  try {
    const alerts = await getAllAlerts();
    res.json(alerts.map(formatAlert));
  } catch (err) {
    sendInternalError(res, err, "listAlerts");
  }
}

export async function acknowledgeAlert(req, res) {
  const id = parseIntParam(req.params.id, "alert ID", res);
  if (id === null) return;

  try {
    const existing = await getAlertById(id);
    if (!existing) {
      res.status(404).json({ error: "Alert not found" });
      return;
    }

    const updated = await acknowledgeAlertById(id, existing.message, existing.sensor_name);
    res.json(formatAlert(updated));
  } catch (err) {
    sendInternalError(res, err, "acknowledgeAlert");
  }
}
