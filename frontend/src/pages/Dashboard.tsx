import { Bell, Activity, Cpu, Flame, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { SensorGrid } from "@/components/dashboard/SensorGrid";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import {
  getAllSensors,
  getDashboardSummary,
  getRecentActivity,
  QUERY_KEYS,
} from "@/services/api";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function Dashboard() {
  // 🔥 API calls (future IoT will hit these)
  const { data: summary } = useQuery({
    queryKey: QUERY_KEYS.dashboardSummary,
    queryFn: getDashboardSummary,
  });

  const { data: activity } = useQuery({
    queryKey: QUERY_KEYS.dashboardActivity,
    queryFn: getRecentActivity,
  });

  const { data: sensors } = useQuery({
    queryKey: QUERY_KEYS.sensors,
    queryFn: getAllSensors,
  });

  // 🧠 SMART FALLBACK (important for now)
  const safeSummary = summary ?? {
    totalSensors: 5,
    activeSensors: 4,
    criticalAlerts: 1,
    resolvedAlerts: 2,
    avgTemperature: 32.4,
    systemStatus: "normal",
    lastScanTime: new Date().toISOString(),
    mlModelAccuracy: 0.947,
  };

  const safeSensors = sensors ?? [
    {
      id: 1,
      name: "Zone A",
      location: "Warehouse",
      status: "online",
      temperature: 30,
      humidity: 40,
      smokeLevel: 10,
      coLevel: 5,
      lastReading: new Date().toISOString(),
      fireRisk: "low",
    },
    {
      id: 2,
      name: "Zone D",
      location: "Factory",
      status: "warning",
      temperature: 45,
      humidity: 60,
      smokeLevel: 70,
      coLevel: 120,
      lastReading: new Date().toISOString(),
      fireRisk: "high",
    },
  ];

  const safeActivity = activity ?? [
    {
      id: 1,
      type: "info",
      message: "Zone A temperature stable",
      sensorName: "Zone A",
      severity: "info",
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      type: "warning",
      message: "High temperature detected in Zone D",
      sensorName: "Zone D",
      severity: "warning",
      timestamp: new Date().toISOString(),
    },
  ];

  const hasCriticalAlerts = safeSummary.criticalAlerts > 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-bold mb-1">System Overview</h1>
        <p className="text-muted-foreground">
          Real-time monitoring and threat detection
        </p>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Active Sensors"
          value={`${safeSummary.activeSensors} / ${safeSummary.totalSensors}`}
          icon={<Cpu className="h-4 w-4 text-primary" />}
        />

        <StatCard
          label="Critical Alerts"
          value={
            <span className={hasCriticalAlerts ? "text-destructive" : ""}>
              {safeSummary.criticalAlerts}
            </span>
          }
          icon={<Bell className="h-4 w-4 text-muted-foreground" />}
        />

        <StatCard
          label="Avg Temperature"
          value={`${safeSummary.avgTemperature.toFixed(1)}°C`}
          icon={<Flame className="h-4 w-4 text-orange-500" />}
        />

        <StatCard
          label="ML Accuracy"
          value={`${(safeSummary.mlModelAccuracy * 100).toFixed(1)}%`}
          icon={<Activity className="h-4 w-4 text-green-500" />}
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SENSOR GRID */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Grid</CardTitle>
            </CardHeader>
            <CardContent>
              <SensorGrid sensors={safeSensors} />
            </CardContent>
          </Card>
        </div>

        {/* ACTIVITY */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed events={safeActivity} />
            </CardContent>
          </Card>
        </div>

      </div>
    </motion.div>
  );
}
