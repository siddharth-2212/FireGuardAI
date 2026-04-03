import type { Sensor, Alert, Activity } from "@workspace/db";

/**
 * Serializes a Sensor row into the API response shape.
 * Centralizing this avoids the subtle bug where a new field gets added
 * to the DB schema but forgotten in one of three separate route handlers.
 */
export function formatSensorResponse(row: Sensor) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    status: row.status,
    temperature: row.temperature,
    humidity: row.humidity,
    smokeLevel: row.smokeLevel,
    coLevel: row.coLevel,
    lastReading: row.lastReading.toISOString(),
    fireRisk: row.fireRisk,
  };
}

/**
 * Serializes an Alert row into the API response shape.
 */
export function formatAlertResponse(row: Alert) {
  return {
    id: row.id,
    sensorId: row.sensorId,
    sensorName: row.sensorName,
    location: row.location,
    severity: row.severity,
    message: row.message,
    acknowledged: row.acknowledged,
    mlConfidence: row.mlConfidence,
    temperature: row.temperature,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Serializes an Activity row into the API response shape.
 */
export function formatActivityResponse(row: Activity) {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    sensorName: row.sensorName,
    severity: row.severity,
    timestamp: row.timestamp.toISOString(),
  };
}
