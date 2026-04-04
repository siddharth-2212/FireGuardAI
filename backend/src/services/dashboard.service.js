/**
 * FireGuard AI — Dashboard Service (Stable Version)
 * 
 * This version removes database dependency for deployment stability.
 * It simulates real sensor + alert data while keeping architecture intact.
 */

/**
 * Derives overall system status from alert and sensor state.
 */
function deriveSystemStatus(criticalAlerts, hasHighRiskSensor) {
  if (criticalAlerts > 3) return "critical";
  if (criticalAlerts > 1) return "danger";
  if (criticalAlerts > 0) return "elevated";
  if (hasHighRiskSensor) return "elevated";
  return "normal";
}

/**
 * Mock sensor dataset (simulating IoT devices)
 */
function getMockSensors() {
  return [
    {
      id: 1,
      name: "Zone A",
      status: "online",
      temperature: 35,
      fire_risk: "low",
      last_reading: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Zone B",
      status: "online",
      temperature: 42,
      fire_risk: "medium",
      last_reading: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Zone C",
      status: "offline",
      temperature: 0,
      fire_risk: "low",
      last_reading: new Date().toISOString(),
    },
    {
      id: 4,
      name: "Zone D",
      status: "online",
      temperature: 55,
      fire_risk: "high",
      last_reading: new Date().toISOString(),
    },
    {
      id: 5,
      name: "Zone E",
      status: "online",
      temperature: 30,
      fire_risk: "low",
      last_reading: new Date().toISOString(),
    },
  ];
}

/**
 * Mock alert dataset
 */
function getMockAlerts() {
  return [
    { id: 1, severity: "critical", acknowledged: false },
    { id: 2, severity: "warning", acknowledged: true },
    { id: 3, severity: "info", acknowledged: true },
  ];
}

/**
 * Aggregates dashboard summary (mock-based)
 */
export async function buildDashboardSummary() {
  const allSensors = getMockSensors();
  const allAlerts = getMockAlerts();

  const totalSensors = allSensors.length;
  const activeSensors = allSensors.filter((s) => s.status === "online").length;

  const avgTemperature =
    totalSensors > 0
      ? allSensors.reduce((sum, s) => sum + Number(s.temperature || 0), 0) / totalSensors
      : 22;

  const criticalAlerts = allAlerts.filter(
    (a) => a.severity === "critical" && !a.acknowledged
  ).length;

  const resolvedAlerts = allAlerts.filter((a) => a.acknowledged).length;

  const hasHighRiskSensor = allSensors.some((s) => s.fire_risk === "high");

  const systemStatus = deriveSystemStatus(criticalAlerts, hasHighRiskSensor);

  const latestSensor = [...allSensors].sort(
    (a, b) =>
      new Date(b.last_reading).getTime() -
      new Date(a.last_reading).getTime()
  )[0];

  return {
    totalSensors,
    activeSensors,
    criticalAlerts,
    resolvedAlerts,
    avgTemperature: Math.round(avgTemperature * 10) / 10,
    systemStatus,
    lastScanTime: latestSensor
      ? new Date(latestSensor.last_reading).toISOString()
      : new Date().toISOString(),
    mlModelAccuracy: 0.947,
  };
}

/**
 * Returns recent activity (mocked)
 */
export async function fetchRecentActivityFeed() {
  return [
    {
      id: 1,
      type: "sensor",
      message: "Zone A temperature stable",
      sensorName: "Zone A",
      severity: "info",
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      type: "alert",
      message: "High temperature detected in Zone D",
      sensorName: "Zone D",
      severity: "warning",
      timestamp: new Date().toISOString(),
    },
  ];
}
