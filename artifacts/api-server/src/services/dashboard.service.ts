import { db, sensorsTable, alertsTable, activityTable } from "@workspace/db";
import { desc } from "drizzle-orm";

type SystemStatus = "normal" | "elevated" | "danger" | "critical";

/**
 * Derives the overall system status from sensor and alert state.
 *
 * Thresholds were discussed with the product team and intentionally
 * conservative — "elevated" kicks in at just one unacknowledged critical
 * alert so operators are never surprised by a hidden incident.
 */
function deriveSystemStatus(criticalAlerts: number, hasHighRiskSensor: boolean): SystemStatus {
  if (criticalAlerts > 3)     return "critical";
  if (criticalAlerts > 1)     return "danger";
  if (criticalAlerts > 0)     return "elevated";
  if (hasHighRiskSensor)      return "elevated";
  return "normal";
}

/**
 * Aggregates sensor, alert, and activity data into the dashboard summary.
 * All DB reads happen in parallel to keep latency low on the main dashboard load.
 */
export async function buildDashboardSummary() {
  // Fetch in parallel — these three queries are independent
  const [allSensors, allAlerts] = await Promise.all([
    db.select().from(sensorsTable),
    db.select().from(alertsTable),
  ]);

  const totalSensors   = allSensors.length;
  const activeSensors  = allSensors.filter(s => s.status === "online").length;
  const avgTemperature = totalSensors > 0
    ? allSensors.reduce((sum, s) => sum + s.temperature, 0) / totalSensors
    : 22;

  const criticalAlerts  = allAlerts.filter(a => a.severity === "critical" && !a.acknowledged).length;
  const resolvedAlerts  = allAlerts.filter(a => a.acknowledged).length;
  const hasHighRiskSensor = allSensors.some(s => s.fireRisk === "high");
  const systemStatus    = deriveSystemStatus(criticalAlerts, hasHighRiskSensor);

  // Most-recently-read sensor tells us when the last scan happened
  const latestSensor = [...allSensors].sort(
    (a, b) => new Date(b.lastReading).getTime() - new Date(a.lastReading).getTime()
  )[0];

  return {
    totalSensors,
    activeSensors,
    criticalAlerts,
    resolvedAlerts,
    avgTemperature: Math.round(avgTemperature * 10) / 10,
    systemStatus,
    lastScanTime:   latestSensor ? latestSensor.lastReading.toISOString() : new Date().toISOString(),
    // Hardcoded until we wire in real model versioning/eval metrics
    mlModelAccuracy: 0.947,
  };
}

/**
 * Returns the 20 most recent activity events, newest first.
 * Capped at 20 — the feed is a glance surface, not a log viewer.
 */
export async function fetchRecentActivityFeed() {
  return db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.timestamp))
    .limit(20);
}
