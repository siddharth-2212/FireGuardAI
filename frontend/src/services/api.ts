/**
 * Typed fetch client for the FireGuard AI backend.
 *
 * All API types are defined here alongside their fetch functions
 * so there's a single file to update when the API contract changes.
 * In a larger codebase this could be generated from the OpenAPI spec,
 * but a hand-written client is simpler for a standalone deployment.
 */

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Sensor {
  id:          number;
  name:        string;
  location:    string;
  status:      "online" | "offline" | "warning" | "critical";
  temperature: number;
  humidity:    number;
  smokeLevel:  number;
  coLevel:     number;
  lastReading: string;
  fireRisk:    "low" | "medium" | "high" | "critical";
}

export interface Alert {
  id:           number;
  sensorId:     number;
  sensorName:   string;
  location:     string;
  severity:     "info" | "warning" | "critical";
  message:      string;
  acknowledged: boolean;
  mlConfidence: number;
  temperature:  number;
  createdAt:    string;
}

export interface ActivityEvent {
  id:         number;
  type:       string;
  message:    string;
  sensorName: string;
  severity:   "info" | "warning" | "critical";
  timestamp:  string;
}

export interface DashboardSummary {
  totalSensors:    number;
  activeSensors:   number;
  criticalAlerts:  number;
  resolvedAlerts:  number;
  avgTemperature:  number;
  systemStatus:    "normal" | "elevated" | "danger" | "critical";
  lastScanTime:    string;
  mlModelAccuracy: number;
}

export interface DetectionInput {
  sensorId:    number;
  temperature: number;
  smokeLevel:  number;
  coLevel:     number;
}

export interface DetectionResult {
  sensorId:       number;
  fire:           boolean;
  confidence:     number;
  riskLevel:      "low" | "medium" | "high" | "critical";
  recommendation: string;
  timestamp:      string;
}

// ─── Query keys — stable references so hooks can invalidate the right caches ─

export const QUERY_KEYS = {
  sensors:           ["sensors"]           as const,
  alerts:            ["alerts"]            as const,
  dashboardSummary:  ["dashboard", "summary"]  as const,
  dashboardActivity: ["dashboard", "activity"] as const,
};

// ─── Fetch functions ──────────────────────────────────────────────────────────

export const getAllSensors      = () => request<Sensor[]>("/sensors");
export const getDashboardSummary = () => request<DashboardSummary>("/dashboard/summary");
export const getRecentActivity  = () => request<ActivityEvent[]>("/dashboard/activity");
export const getAllAlerts        = () => request<Alert[]>("/alerts");

export const acknowledgeAlert = (id: number) =>
  request<Alert>(`/alerts/${id}/acknowledge`, { method: "POST" });

export const runDetection = (body: DetectionInput) =>
  request<DetectionResult>("/detect", {
    method: "POST",
    body:   JSON.stringify(body),
  });
