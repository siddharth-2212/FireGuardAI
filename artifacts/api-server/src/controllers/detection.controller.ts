import type { Request, Response } from "express";
import { RunDetectionBody } from "@workspace/api-zod";
import { runFireDetectionCycle } from "../services/detection.service.js";
import { sendInternalError } from "../utils/http.js";

export async function runDetection(req: Request, res: Response): Promise<void> {
  const parsed = RunDetectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
    return;
  }

  try {
    const result = await runFireDetectionCycle(parsed.data);
    res.json(result);
  } catch (err) {
    sendInternalError(req, res, err, "runDetection failed");
  }
}
