import type { Request, Response } from "express";
import { getAllSensors, getSensorById } from "../services/sensor.service.js";
import { formatSensorResponse } from "../utils/format.js";
import { parseIntParam, sendInternalError } from "../utils/http.js";

export async function listSensors(req: Request, res: Response): Promise<void> {
  try {
    const sensors = await getAllSensors();
    res.json(sensors.map(formatSensorResponse));
  } catch (err) {
    sendInternalError(req, res, err, "listSensors failed");
  }
}

export async function getSensor(req: Request, res: Response): Promise<void> {
  const sensorId = parseIntParam(req.params.id, "sensor ID", res);
  if (sensorId === null) return;

  try {
    const sensor = await getSensorById(sensorId);
    if (!sensor) {
      res.status(404).json({ error: "Sensor not found" });
      return;
    }
    res.json(formatSensorResponse(sensor));
  } catch (err) {
    sendInternalError(req, res, err, "getSensor failed");
  }
}
