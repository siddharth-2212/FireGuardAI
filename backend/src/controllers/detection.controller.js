import { z } from "zod";
import { runFireDetectionCycle } from "../services/detection.service.js";
import { sendInternalError } from "../utils/http.js";

const DetectionBodySchema = z.object({
  sensorId:    z.number().int().positive(),
  temperature: z.number().min(-50).max(1500),
  smokeLevel:  z.number().min(0).max(100),
  coLevel:     z.number().min(0).max(10000),
});

export async function runDetection(req, res) {
  const parsed = DetectionBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
    return;
  }

  try {
    const result = await runFireDetectionCycle(parsed.data);
    res.json(result);
  } catch (err) {
    sendInternalError(res, err, "runDetection");
  }
}
