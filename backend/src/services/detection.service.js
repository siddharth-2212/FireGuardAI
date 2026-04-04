import { pool } from "../db.js";
import { predictFire } from "./ml.service.js";
import { getSensorById, updateSensorTelemetry } from "./sensor.service.js";
import { createFireAlert } from "./alert.service.js";

/**
 * Orchestrates a full detection cycle:
 *   1. Runs ML inference via the embedded predictFire model
 *   2. Logs the event to the activity feed regardless of outcome
 *   3. If fire is detected, creates an alert and updates the sensor state
 *
 * This is the only place that transitions sensors to warning/critical status —
 * keeping that logic here prevents scattered state changes across the codebase.
 */
export async function runFireDetectionCycle({ sensorId, temperature, smokeLevel, coLevel }) {
  const prediction = predictFire(temperature, smokeLevel, coLevel);
  const detectedAt = new Date();

  // Map risk level → activity severity (not a 1:1 relationship — "high" risk
  // logs as "warning" because critical is reserved for truly urgent events)
  const activitySeverity =
    prediction.riskLevel === "critical" ? "critical"
    : prediction.riskLevel === "high"   ? "warning"
    : "info";

  await pool.query(
    `INSERT INTO activity (type, message, sensor_name, severity)
     VALUES ('detection', $1, $2, $3)`,
    [
      `ML detection: ${prediction.riskLevel} risk (${Math.round(prediction.confidence * 100)}% confidence)`,
      `Sensor #${sensorId}`,
      activitySeverity,
    ]
  );

  if (prediction.fire) {
    const sensor     = await getSensorById(sensorId);
    const sensorName = sensor?.name     ?? `Sensor #${sensorId}`;
    const location   = sensor?.location ?? "Unknown";

    await createFireAlert({
      sensorId,
      sensorName,
      location,
      severity:     prediction.riskLevel === "critical" ? "critical" : "warning",
      message:      prediction.recommendation,
      mlConfidence: prediction.confidence,
      temperature,
    });

    if (sensor) {
      await updateSensorTelemetry(sensorId, {
        fireRisk:    prediction.riskLevel,
        status:      prediction.riskLevel === "critical" ? "critical" : "warning",
        temperature,
        smokeLevel,
        coLevel,
        lastReading: detectedAt,
      });
    }
  }

  return {
    sensorId,
    ...prediction,
    timestamp: detectedAt.toISOString(),
  };
}
