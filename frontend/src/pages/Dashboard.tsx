import { Bell, Activity, Cpu, Flame, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { SensorGrid } from "@/components/dashboard/SensorGrid";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useLiveDashboardPolling } from "@/hooks/use-live-polling";
import {
  getAllSensors,
  getDashboardSummary,
  getRecentActivity,
  QUERY_KEYS,
} from "@/services/api";

const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function Dashboard() {
  // Invalidates sensor + activity + summary queries every 5s in the background
  useLiveDashboardPolling();

  const { data: summary,  isLoading: loadingSummary  } = useQuery({ queryKey: QUERY_KEYS.dashboardSummary,  queryFn: getDashboardSummary });
  const { data: activity, isLoading: loadingActivity } = useQuery({ queryKey: QUERY_KEYS.dashboardActivity, queryFn: getRecentActivity });
  const { data: sensors,  isLoading: loadingSensors  } = useQuery({ queryKey: QUERY_KEYS.sensors,           queryFn: getAllSensors });

  if (loadingSummary || loadingActivity || loadingSensors) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Initializing systems...
      </div>
    );
  }

  const hasCriticalAlerts = (summary?.criticalAlerts ?? 0) > 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-1">System Overview</h1>
        <p className="text-muted-foreground">Real-time monitoring and threat detection</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Active Sensors"
          value={`${summary?.activeSensors} / ${summary?.totalSensors}`}
          icon={<Cpu className="h-4 w-4 text-primary" />}
          subtext={
            <span className="flex items-center gap-1">
              <span className="status-dot online w-1.5 h-1.5" />
              Online
            </span>
          }
        />
        <StatCard
          label="Critical Alerts"
          value={
            <span className={hasCriticalAlerts ? "text-destructive" : undefined}>
              {summary?.criticalAlerts}
            </span>
          }
          icon={<Bell className={`h-4 w-4 ${hasCriticalAlerts ? "text-destructive animate-bounce" : "text-muted-foreground"}`} />}
          subtext="Requires immediate attention"
          urgent={hasCriticalAlerts}
        />
        <StatCard
          label="Avg Temperature"
          value={`${summary?.avgTemperature.toFixed(1)}°C`}
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          subtext="Across all zones"
        />
        <StatCard
          label="ML Accuracy"
          value={`${((summary?.mlModelAccuracy ?? 0) * 100).toFixed(1)}%`}
          icon={<Activity className="h-4 w-4 text-emerald-500" />}
          subtext={
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Model healthy
            </span>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="col-span-2"
        >
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg">Sensor Grid</CardTitle>
            </CardHeader>
            <CardContent>
              <SensorGrid sensors={sensors ?? []} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className="col-span-1"
        >
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed events={activity ?? []} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
