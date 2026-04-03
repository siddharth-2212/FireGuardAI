import { pool } from "../db.js";

/**
 * Returns all sensors ordered by ID.
 * Stable ordering prevents layout shifts in the sensor grid when names change.
 */
export async function getAllSensors() {
  const result = await pool.query("SELECT * FROM sensors ORDER BY id");
  return result.rows;
}

/**
 * Fetches a single sensor by primary key.
 * Returns undefined when no row matches so the controller can send a proper 404.
 */
export async function getSensorById(id) {
  const result = await pool.query("SELECT * FROM sensors WHERE id = $1", [id]);
  return result.rows[0];
}

/**
 * Applies a partial telemetry update to a sensor after a fire detection cycle.
 * Only the detection service should call this — keep status transitions in one place.
 */
export async function updateSensorTelemetry(sensorId, patch) {
  await pool.query(
    `UPDATE sensors
       SET fire_risk    = $1,
           status       = $2,
           temperature  = $3,
           smoke_level  = $4,
           co_level     = $5,
           last_reading = $6
     WHERE id = $7`,
    [
      patch.fireRisk,
      patch.status,
      patch.temperature,
      patch.smokeLevel,
      patch.coLevel,
      patch.lastReading,
      sensorId,
    ]
  );
}
