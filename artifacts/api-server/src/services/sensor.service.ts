import { db, sensorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * Fetches all sensors ordered by their ID.
 * The ID ordering keeps the sensor grid stable across refreshes —
 * a sort-by-name would cause layout shifts whenever names change.
 */
export async function getAllSensors() {
  return db.select().from(sensorsTable).orderBy(sensorsTable.id);
}

/**
 * Fetches a single sensor by its primary key.
 * Returns undefined when the ID doesn't exist rather than throwing,
 * so callers can decide on the appropriate HTTP response.
 */
export async function getSensorById(id: number) {
  const [sensor] = await db
    .select()
    .from(sensorsTable)
    .where(eq(sensorsTable.id, id));
  return sensor;
}

/**
 * Applies a partial telemetry update to a sensor row.
 * Used by the detection pipeline after a positive fire event
 * to keep the sensor's live state consistent with the ML result.
 */
export async function updateSensorTelemetry(
  sensorId: number,
  patch: {
    fireRisk: "low" | "medium" | "high" | "critical";
    status: "online" | "offline" | "warning" | "critical";
    temperature: number;
    smokeLevel: number;
    coLevel: number;
    lastReading: Date;
  }
) {
  await db
    .update(sensorsTable)
    .set(patch)
    .where(eq(sensorsTable.id, sensorId));
}
