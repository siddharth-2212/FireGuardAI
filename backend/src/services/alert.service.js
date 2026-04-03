import { pool } from "../db.js";

/**
 * Returns all alerts newest-first.
 * Most operators open the alert page looking for the latest incident.
 */
export async function getAllAlerts() {
  const result = await pool.query("SELECT * FROM alerts ORDER BY created_at DESC");
  return result.rows;
}

/**
 * Fetches a single alert by ID, or undefined if not found.
 */
export async function getAlertById(id) {
  const result = await pool.query("SELECT * FROM alerts WHERE id = $1", [id]);
  return result.rows[0];
}

/**
 * Creates an alert record. Called by the detection cycle when fire is confirmed.
 */
export async function createFireAlert(payload) {
  const result = await pool.query(
    `INSERT INTO alerts
       (sensor_id, sensor_name, location, severity, message, acknowledged, ml_confidence, temperature)
     VALUES ($1, $2, $3, $4, $5, false, $6, $7)
     RETURNING *`,
    [
      payload.sensorId,
      payload.sensorName,
      payload.location,
      payload.severity,
      payload.message,
      payload.mlConfidence,
      payload.temperature,
    ]
  );
  return result.rows[0];
}

/**
 * Marks an alert acknowledged and appends an acknowledgment entry to the activity feed.
 * Both writes happen in a single transaction — the activity feed should never fall out
 * of sync with the alert state.
 */
export async function acknowledgeAlertById(id, originalMessage, sensorName) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const alertResult = await client.query(
      "UPDATE alerts SET acknowledged = true WHERE id = $1 RETURNING *",
      [id]
    );

    await client.query(
      `INSERT INTO activity (type, message, sensor_name, severity)
       VALUES ('acknowledgment', $1, $2, 'info')`,
      [`Alert acknowledged: ${originalMessage}`, sensorName]
    );

    await client.query("COMMIT");
    return alertResult.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
