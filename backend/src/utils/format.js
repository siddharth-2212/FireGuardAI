/**
 * Serializes a sensors table row (snake_case PG columns) into the API response shape.
 * Centralizing this conversion means adding a new column only requires one change.
 */
export function formatSensor(row) {
  return {
    id:          row.id,
    name:        row.name,
    location:    row.location,
    status:      row.status,
    temperature: parseFloat(row.temperature),
    humidity:    parseFloat(row.humidity),
    smokeLevel:  parseFloat(row.smoke_level),
    coLevel:     parseFloat(row.co_level),
    lastReading: new Date(row.last_reading).toISOString(),
    fireRisk:    row.fire_risk,
  };
}

/**
 * Serializes an alerts row into the API response shape.
 */
export function formatAlert(row) {
  return {
    id:           row.id,
    sensorId:     row.sensor_id,
    sensorName:   row.sensor_name,
    location:     row.location,
    severity:     row.severity,
    message:      row.message,
    acknowledged: row.acknowledged,
    mlConfidence: parseFloat(row.ml_confidence),
    temperature:  parseFloat(row.temperature),
    createdAt:    new Date(row.created_at).toISOString(),
  };
}

/**
 * Serializes an activity row into the API response shape.
 */
export function formatActivity(row) {
  return {
    id:         row.id,
    type:       row.type,
    message:    row.message,
    sensorName: row.sensor_name,
    severity:   row.severity,
    timestamp:  new Date(row.timestamp).toISOString(),
  };
}
