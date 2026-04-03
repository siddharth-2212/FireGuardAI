import { getAllSensors, getSensorById } from "../services/sensor.service.js";
import { formatSensor } from "../utils/format.js";
import { parseIntParam, sendInternalError } from "../utils/http.js";

export async function listSensors(req, res) {
  try {
    const sensors = await getAllSensors();
    res.json(sensors.map(formatSensor));
  } catch (err) {
    sendInternalError(res, err, "listSensors");
  }
}

export async function getSensor(req, res) {
  const id = parseIntParam(req.params.id, "sensor ID", res);
  if (id === null) return;

  try {
    const sensor = await getSensorById(id);
    if (!sensor) {
      res.status(404).json({ error: "Sensor not found" });
      return;
    }
    res.json(formatSensor(sensor));
  } catch (err) {
    sendInternalError(res, err, "getSensor");
  }
}
