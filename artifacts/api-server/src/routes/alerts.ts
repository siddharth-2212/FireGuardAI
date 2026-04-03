import { Router } from "express";
import { db } from "@workspace/db";
import { alertsTable, activityTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/alerts", async (req, res) => {
  try {
    const alerts = await db.select().from(alertsTable).orderBy(desc(alertsTable.createdAt));
    res.json(alerts.map(a => ({
      id: a.id,
      sensorId: a.sensorId,
      sensorName: a.sensorName,
      location: a.location,
      severity: a.severity,
      message: a.message,
      acknowledged: a.acknowledged,
      mlConfidence: a.mlConfidence,
      temperature: a.temperature,
      createdAt: a.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list alerts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/alerts/:id/acknowledge", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid alert ID" });
      return;
    }
    const [existing] = await db.select().from(alertsTable).where(eq(alertsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Alert not found" });
      return;
    }
    const [updated] = await db
      .update(alertsTable)
      .set({ acknowledged: true })
      .where(eq(alertsTable.id, id))
      .returning();

    await db.insert(activityTable).values({
      type: "acknowledgment",
      message: `Alert acknowledged: ${existing.message}`,
      sensorName: existing.sensorName,
      severity: "info",
    });

    res.json({
      id: updated.id,
      sensorId: updated.sensorId,
      sensorName: updated.sensorName,
      location: updated.location,
      severity: updated.severity,
      message: updated.message,
      acknowledged: updated.acknowledged,
      mlConfidence: updated.mlConfidence,
      temperature: updated.temperature,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to acknowledge alert");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
