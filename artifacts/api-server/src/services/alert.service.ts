import { db, alertsTable, activityTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

/**
 * Returns all alerts sorted newest-first.
 * Most users land on the alert page to see the latest incident,
 * so descending order avoids immediate scrolling.
 */
export async function getAllAlerts() {
  return db.select().from(alertsTable).orderBy(desc(alertsTable.createdAt));
}

/**
 * Finds a single alert by ID. Returns undefined when not found.
 */
export async function getAlertById(id: number) {
  const [alert] = await db
    .select()
    .from(alertsTable)
    .where(eq(alertsTable.id, id));
  return alert;
}

/**
 * Creates a new alert record and a corresponding activity log entry.
 * Keeping these together ensures the activity feed always reflects
 * alert creation — they're semantically the same event.
 */
export async function createFireAlert(payload: {
  sensorId: number;
  sensorName: string;
  location: string;
  severity: "info" | "warning" | "critical";
  message: string;
  mlConfidence: number;
  temperature: number;
}) {
  const [inserted] = await db.insert(alertsTable).values({
    sensorId: payload.sensorId,
    sensorName: payload.sensorName,
    location: payload.location,
    severity: payload.severity,
    message: payload.message,
    acknowledged: false,
    mlConfidence: payload.mlConfidence,
    temperature: payload.temperature,
  }).returning();

  return inserted;
}

/**
 * Marks an alert as acknowledged and appends an acknowledgment event
 * to the activity feed. Returns the updated alert row.
 */
export async function acknowledgeAlertById(id: number, originalMessage: string, sensorName: string) {
  const [updated] = await db
    .update(alertsTable)
    .set({ acknowledged: true })
    .where(eq(alertsTable.id, id))
    .returning();

  // Record the acknowledgment — operators need an audit trail
  await db.insert(activityTable).values({
    type: "acknowledgment",
    message: `Alert acknowledged: ${originalMessage}`,
    sensorName,
    severity: "info",
  });

  return updated;
}
