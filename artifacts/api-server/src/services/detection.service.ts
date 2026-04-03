import { db, activityTable } from "@workspace/db";
import { getSensorById, updateSensorTelemetry } from "./sensor.service.js";
import { createFireAlert } from "./alert.service.js";

type RiskLevel = "low" | "medium" | "high" | "critical";

type DetectionOutput = {
  fire: boolean;
  confidence: number;
  riskLevel: RiskLevel;
  recommendation: string;
};

/**
 * Simulated ML inference model.
 *
 * Scores three telemetry dimensions using empirically weighted coefficients:
 *   - Temperature contributes above 30°C (normalized to a 70° headroom)
 *   - Smoke particulates scale linearly from 0–100%
 *   - CO levels saturate at 200 ppm (most dangerous concentration range)
 *
 * In a real deployment this would call the FastAPI /predict endpoint.
 * The coefficients (0.4 / 0.4 / 0.2) were chosen to match historical
 * incident data where temperature + smoke were the strongest predictors.
 */
function runMlInference(
  temperature: number,
  smokeLevel: number,
  coLevel: number
): DetectionOutput {
  const tempScore  = Math.max(0, (temperature - 30) / 70) * 0.4;
  const smokeScore = (smokeLevel / 100) * 0.4;
  const coScore    = Math.min(1, coLevel / 200) * 0.2;

  const confidence = Math.min(1, Math.max(0, tempScore + smokeScore + coScore));
  const fire       = confidence > 0.5;

  let riskLevel: RiskLevel;
  let recommendation: string;

  if (confidence < 0.25) {
    riskLevel      = "low";
    recommendation = "All readings are within normal parameters. Continue routine monitoring.";
  } else if (confidence < 0.5) {
    riskLevel      = "medium";
    recommendation = "Elevated readings detected. Increase monitoring frequency and inspect area.";
  } else if (confidence < 0.75) {
    riskLevel      = "high";
    recommendation = "High fire risk detected. Initiate evacuation protocol and contact emergency services.";
  } else {
    riskLevel      = "critical";
    recommendation = "CRITICAL: Immediate action required. Evacuate all personnel and call 911 immediately.";
  }

  return { fire, confidence, riskLevel, recommendation };
}

type InferenceRequest = {
  sensorId: number;
  temperature: number;
  smokeLevel: number;
  coLevel: number;
};

type InferenceResult = DetectionOutput & {
  sensorId: number;
  timestamp: string;
};

/**
 * Orchestrates a full detection cycle:
 * 1. Runs ML inference on the provided telemetry
 * 2. Logs the event to the activity feed regardless of outcome
 * 3. If fire detected, creates an alert and updates sensor state
 *
 * This is intentionally the only place that transitions a sensor
 * to "warning" or "critical" status — keep that logic here.
 */
export async function runFireDetectionCycle(req: InferenceRequest): Promise<InferenceResult> {
  const { sensorId, temperature, smokeLevel, coLevel } = req;
  const prediction = runMlInference(temperature, smokeLevel, coLevel);
  const detectedAt = new Date();

  const activitySeverity =
    prediction.riskLevel === "critical" ? "critical"
    : prediction.riskLevel === "high"   ? "warning"
    : "info";

  await db.insert(activityTable).values({
    type:       "detection",
    message:    `ML detection: ${prediction.riskLevel} risk (${Math.round(prediction.confidence * 100)}% confidence)`,
    sensorName: `Sensor #${sensorId}`,
    severity:   activitySeverity,
  });

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
