-- FireGuard AI — Database Setup
-- Run this once in your Render or Neon SQL console before starting the backend.

-- Enums
CREATE TYPE activity_type     AS ENUM ('detection', 'sensor_update', 'alert', 'acknowledgment', 'system');
CREATE TYPE activity_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE alert_severity    AS ENUM ('info', 'warning', 'critical');
CREATE TYPE sensor_status     AS ENUM ('online', 'offline', 'warning', 'critical');
CREATE TYPE fire_risk         AS ENUM ('low', 'medium', 'high', 'critical');

-- Sensors table
CREATE TABLE sensors (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  location     TEXT NOT NULL,
  status       sensor_status NOT NULL DEFAULT 'online',
  temperature  REAL NOT NULL DEFAULT 22,
  humidity     REAL NOT NULL DEFAULT 50,
  smoke_level  REAL NOT NULL DEFAULT 0,
  co_level     REAL NOT NULL DEFAULT 0,
  last_reading TIMESTAMP NOT NULL DEFAULT NOW(),
  fire_risk    fire_risk NOT NULL DEFAULT 'low'
);

-- Alerts table
CREATE TABLE alerts (
  id           SERIAL PRIMARY KEY,
  sensor_id    INTEGER NOT NULL,
  sensor_name  TEXT NOT NULL,
  location     TEXT NOT NULL,
  severity     alert_severity NOT NULL DEFAULT 'info',
  message      TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  ml_confidence REAL NOT NULL DEFAULT 0,
  temperature  REAL NOT NULL DEFAULT 22,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Activity feed table
CREATE TABLE activity (
  id          SERIAL PRIMARY KEY,
  type        activity_type NOT NULL,
  message     TEXT NOT NULL,
  sensor_name TEXT NOT NULL,
  severity    activity_severity NOT NULL DEFAULT 'info',
  timestamp   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed: 4 demo sensors so the dashboard isn't empty on first load
INSERT INTO sensors (name, location, status, temperature, humidity, smoke_level, co_level, fire_risk) VALUES
  ('Server Room A',   'Building 1 - Floor 3',   'online',   24.5, 42.0, 1.2,  35.0, 'low'),
  ('Warehouse Zone B','Building 2 - Ground',     'warning',  38.2, 55.0, 18.5, 85.0, 'medium'),
  ('Kitchen Area',    'Building 1 - Floor 1',    'online',   29.1, 61.0, 5.0,  40.0, 'low'),
  ('Electrical Vault','Building 3 - Basement',   'critical', 62.4, 30.0, 45.0, 180.0,'critical');

-- Seed: 1 unacknowledged alert so the alerts page has something to show
INSERT INTO alerts (sensor_id, sensor_name, location, severity, message, acknowledged, ml_confidence, temperature) VALUES
  (4, 'Electrical Vault', 'Building 3 - Basement', 'critical',
   'CRITICAL: Immediate action required. Evacuate all personnel and call 911 immediately.',
   FALSE, 0.94, 62.4);

-- Seed: a couple of activity events
INSERT INTO activity (type, message, sensor_name, severity) VALUES
  ('detection',     'ML detection: critical risk (94% confidence)', 'Electrical Vault', 'critical'),
  ('detection',     'ML detection: medium risk (52% confidence)',   'Warehouse Zone B', 'warning'),
  ('system',        'Sensor network scan complete',                 'System',           'info');
