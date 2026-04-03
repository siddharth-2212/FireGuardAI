import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  useGetDashboardSummary, 
  getGetDashboardSummaryQueryKey,
  useGetRecentActivity,
  getGetRecentActivityQueryKey,
  useListSensors,
  getListSensorsQueryKey
} from "@workspace/api-client-react";
import { ActivityEvent, DashboardSummary, Sensor } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle2, Cpu, Flame, Activity } from "lucide-react";
import { format } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity();
  const { data: sensors, isLoading: loadingSensors } = useListSensors();

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListSensorsQueryKey() });
    }, 5000);
    return () => clearInterval(interval);
  }, [queryClient]);

  if (loadingSummary || loadingActivity || loadingSensors) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Initializing Systems...</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">System Overview</h1>
        <p className="text-muted-foreground">Real-time monitoring and threat detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item}>
          <Card className="glass-card h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Sensors</CardTitle>
              <Cpu className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.activeSensors} / {summary?.totalSensors}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="status-dot online w-1.5 h-1.5" /> Online
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card h-full relative overflow-hidden">
            {summary?.criticalAlerts ? (
              <div className="absolute inset-0 bg-destructive/10 animate-pulse pointer-events-none" />
            ) : null}
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Alerts</CardTitle>
              <Bell className={`h-4 w-4 ${summary?.criticalAlerts ? 'text-destructive animate-bounce' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${summary?.criticalAlerts ? 'text-destructive' : ''}`}>
                {summary?.criticalAlerts}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Temperature</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.avgTemperature.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground mt-1">Across all zones</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">ML Accuracy</CardTitle>
              <Activity className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{(summary?.mlModelAccuracy! * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Model healthy
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="col-span-2">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg">Sensor Grid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sensors?.slice(0, 6).map(sensor => (
                  <div key={sensor.id} className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm">{sensor.name}</div>
                      <div className={`status-dot ${sensor.status}`} />
                    </div>
                    <div className="text-xs text-muted-foreground mb-4">{sensor.location}</div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Temp</span>
                      <span className="font-mono">{sensor.temperature}°C</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-muted-foreground">Risk</span>
                      <span className={`text-xs font-semibold uppercase tracking-wider
                        ${sensor.fireRisk === 'critical' ? 'text-destructive' : 
                          sensor.fireRisk === 'high' ? 'text-orange-500' :
                          sensor.fireRisk === 'medium' ? 'text-amber-500' : 'text-emerald-500'}
                      `}>
                        {sensor.fireRisk}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-1">
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity?.map(event => (
                  <div key={event.id} className="flex gap-3 items-start">
                    <div className="mt-1">
                      {event.severity === 'critical' ? (
                        <div className="w-2 h-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      ) : event.severity === 'warning' ? (
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.sensorName} • {format(new Date(event.timestamp), "HH:mm:ss")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
