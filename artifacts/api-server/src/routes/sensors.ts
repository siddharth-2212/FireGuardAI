import { Router } from "express";
import { db } from "@workspace/db";
import { sensorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/sensors", async (req, res) => {
  try {
    const sensors = await db.select().from(sensorsTable).orderBy(sensorsTable.id);
    res.json(sensors.map(s => ({
      id: s.id,
      name: s.name,
      location: s.location,
      status: s.status,
      temperature: s.temperature,
      humidity: s.humidity,
      smokeLevel: s.smokeLevel,
      coLevel: s.coLevel,
      lastReading: s.lastReading.toISOString(),
      fireRisk: s.fireRisk,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list sensors");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sensors/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid sensor ID" });
      return;
    }
    const [sensor] = await db.select().from(sensorsTable).where(eq(sensorsTable.id, id));
    if (!sensor) {
      res.status(404).json({ error: "Sensor not found" });
      return;
    }
    res.json({
      id: sensor.id,
      name: sensor.name,
      location: sensor.location,
      status: sensor.status,
      temperature: sensor.temperature,
      humidity: sensor.humidity,
      smokeLevel: sensor.smokeLevel,
      coLevel: sensor.coLevel,
      lastReading: sensor.lastReading.toISOString(),
      fireRisk: sensor.fireRisk,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get sensor");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
