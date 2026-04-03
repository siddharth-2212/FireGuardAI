import { pool } from "../db.js";

/**
 * Derives overall system status from alert and sensor state.
 * Thresholds are conservative — "elevated" kicks in at just one unacknowledged
 * critical alert so operators are never surprised by a hidden incident.
 */
function deriveSystemStatus(criticalAlerts, hasHighRiskSensor) {
  if (criticalAlerts > 3)  return "critical";
  if (criticalAlerts > 1)  return "danger";
  if (criticalAlerts > 0)  return "elevated";
  if (hasHighRiskSensor)   return "elevated";
  return "normal";
}

/**
 * Aggregates sensor and alert data into the dashboard summary.
 * Both queries run in parallel to keep the main dashboard load fast.
 */
export async function buildDashboardSummary() {
  const [sensorsResult, alertsResult] = await Promise.all([
    pool.query("SELECT * FROM sensors"),
    pool.query("SELECT * FROM alerts"),
  ]);

  const allSensors = sensorsResult.rows;
  const allAlerts  = alertsResult.rows;

  const totalSensors  = allSensors.length;
  const activeSensors = allSensors.filter((s) => s.status === "online").length;
  const avgTemperature =
    totalSensors > 0
      ? allSensors.reduce((sum, s) => sum + parseFloat(s.temperature), 0) / totalSensors
      : 22;

  const criticalAlerts    = allAlerts.filter((a) => a.severity === "critical" && !a.acknowledged).length;
  const resolvedAlerts    = allAlerts.filter((a) => a.acknowledged).length;
  const hasHighRiskSensor = allSensors.some((s) => s.fire_risk === "high");
  const systemStatus      = deriveSystemStatus(criticalAlerts, hasHighRiskSensor);

  // Most-recently-read sensor determines the last scan time shown in the UI
  const latestSensor = [...allSensors].sort(
    (a, b) => new Date(b.last_reading).getTime() - new Date(a.last_reading).getTime()
  )[0];

  return {
    totalSensors,
    activeSensors,
    criticalAlerts,
    resolvedAlerts,
    avgTemperature: Math.round(avgTemperature * 10) / 10,
    systemStatus,
    lastScanTime:   latestSensor ? new Date(latestSensor.last_reading).toISOString() : new Date().toISOString(),
    // Hardcoded until model versioning and eval metrics are wired in
    mlModelAccuracy: 0.947,
  };
}

/**
 * Returns the 20 most recent activity events, newest first.
 * Capped at 20 — the feed is a glance surface, not a full audit log.
 */
export async function fetchRecentActivityFeed() {
  const result = await pool.query(
    "SELECT * FROM activity ORDER BY timestamp DESC LIMIT 20"
  );
  return result.rows;
}
