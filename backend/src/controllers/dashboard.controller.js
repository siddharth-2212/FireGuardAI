import { buildDashboardSummary, fetchRecentActivityFeed } from "../services/dashboard.service.js";
import { formatActivity } from "../utils/format.js";
import { sendInternalError } from "../utils/http.js";

export async function getDashboardSummary(req, res) {
  try {
    const summary = await buildDashboardSummary();
    res.json(summary);
  } catch (err) {
    sendInternalError(res, err, "getDashboardSummary");
  }
}

export async function getRecentActivity(req, res) {
  try {
    const events = await fetchRecentActivityFeed();
    res.json(events.map(formatActivity));
  } catch (err) {
    sendInternalError(res, err, "getRecentActivity");
  }
}
