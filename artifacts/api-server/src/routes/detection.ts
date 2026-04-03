import { Router } from "express";
import { db } from "@workspace/db";
import { alertsTable, activityTable, sensorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RunDetectionBody } from "@workspace/api-zod";

const router = Router();

function calculateFireRisk(temperature: number, smokeLevel: number, coLevel: number): {
  fire: boolean;
  confidence: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendation: string;
} {
  // ML simulation: weighted scoring
  let score = 0;
  score += Math.max(0, (temperature - 30) / 70) * 0.4;
  score += (smokeLevel / 100) * 0.4;
  score += Math.min(1, coLevel / 200) * 0.2;

  const confidence = Math.min(1, Math.max(0, score));
  const fire = confidence > 0.5;

  let riskLevel: "low" | "medium" | "high" | "critical";
  let recommendation: string;

  if (confidence < 0.25) {
    riskLevel = "low";
    recommendation = "All readings are within normal parameters. Continue routine monitoring.";
  } else if (confidence < 0.5) {
    riskLevel = "medium";
    recommendation = "Elevated readings detected. Increase monitoring frequency and inspect area.";
  } else if (confidence < 0.75) {
    riskLevel = "high";
    recommendation = "High fire risk detected. Initiate evacuation protocol and contact emergency services.";
  } else {
    riskLevel = "critical";
    recommendation = "CRITICAL: Immediate action required. Evacuate all personnel and call 911 immediately.";
  }

  return { fire, confidence, riskLevel, recommendation };
}

router.post("/detect", async (req, res) => {
  try {
    const parsed = RunDetectionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { sensorId, temperature, smokeLevel, coLevel } = parsed.data;
    const result = calculateFireRisk(temperature, smokeLevel, coLevel);
    const timestamp = new Date();

    // Log activity
    await db.insert(activityTable).values({
      type: "detection",
      message: `ML detection: ${result.riskLevel} risk (${Math.round(result.confidence * 100)}% confidence)`,
      sensorName: `Sensor #${sensorId}`,
      severity: result.riskLevel === "critical" ? "critical" : result.riskLevel === "high" ? "warning" : "info",
    });

    // Create alert if fire detected
    if (result.fire) {
      const [sensor] = await db.select().from(sensorsTable).where(eq(sensorsTable.id, sensorId));
      const sensorName = sensor?.name ?? `Sensor #${sensorId}`;
      const location = sensor?.location ?? "Unknown";

      await db.insert(alertsTable).values({
        sensorId,
        sensorName,
        location,
        severity: result.riskLevel === "critical" ? "critical" : "warning",
        message: result.recommendation,
        acknowledged: false,
        mlConfidence: result.confidence,
        temperature,
      });

      // Update sensor fire risk
      if (sensor) {
        await db
          .update(sensorsTable)
          .set({
            fireRisk: result.riskLevel,
            status: result.riskLevel === "critical" ? "critical" : "warning",
            temperature,
            smokeLevel,
            coLevel,
            lastReading: timestamp,
          })
          .where(eq(sensorsTable.id, sensorId));
      }
    }

    res.json({
      sensorId,
      fire: result.fire,
      confidence: result.confidence,
      riskLevel: result.riskLevel,
      recommendation: result.recommendation,
      timestamp: timestamp.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to run detection");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
