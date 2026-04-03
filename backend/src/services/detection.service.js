import { pool } from "../db.js";
import { getSensorById, updateSensorTelemetry } from "./sensor.service.js";
import { createFireAlert } from "./alert.service.js";

/**
 * Simulated ML inference model.
 *
 * Scores three telemetry dimensions using empirically weighted coefficients:
 *   - Temperature contributes above 30°C (normalized to a 70° headroom)
 *   - Smoke particulates scale linearly 0–100%
 *   - CO levels saturate at 200 ppm (most dangerous concentration range)
 *
 * In production this would POST to the /ml-service /predict endpoint.
 * Weights (0.4 / 0.4 / 0.2) match historical data where temp + smoke
 * were the strongest predictors.
 */
function runMlInference(temperature, smokeLevel, coLevel) {
  const tempScore  = Math.max(0, (temperature - 30) / 70) * 0.4;
  const smokeScore = (smokeLevel / 100) * 0.4;
  const coScore    = Math.min(1, coLevel / 200) * 0.2;

  const confidence = Math.min(1, Math.max(0, tempScore + smokeScore + coScore));
  const fire       = confidence > 0.5;

  let riskLevel;
  let recommendation;

  if (confidence < 0.25) {
    riskLevel      = "low";
    recommendation = "All readings within normal parameters. Continue routine monitoring.";
  } else if (confidence < 0.5) {
    riskLevel      = "medium";
    recommendation = "Elevated readings detected. Increase monitoring and inspect the area.";
  } else if (confidence < 0.75) {
    riskLevel      = "high";
    recommendation = "High fire risk. Initiate evacuation protocol and contact emergency services.";
  } else {
    riskLevel      = "critical";
    recommendation = "CRITICAL: Immediate action required. Evacuate all personnel and call 911.";
  }

  return { fire, confidence, riskLevel, recommendation };
}

/**
 * Orchestrates a full detection cycle:
 * 1. Runs ML inference on the provided telemetry
 * 2. Logs the event to the activity feed regardless of outcome
 * 3. If fire is detected, creates an alert and updates the sensor state
 *
 * This is the only place that transitions sensors to warning/critical status.
 */
export async function runFireDetectionCycle({ sensorId, temperature, smokeLevel, coLevel }) {
  const prediction = runMlInference(temperature, smokeLevel, coLevel);
  const detectedAt = new Date();

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
