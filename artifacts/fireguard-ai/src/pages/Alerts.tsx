import { motion } from "framer-motion";
import { useListAlerts, useAcknowledgeAlert, getListAlertsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function Alerts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: alerts, isLoading } = useListAlerts();
  const ackAlert = useAcknowledgeAlert();

  const handleAcknowledge = (id: number) => {
    ackAlert.mutate({ id }, {
      onSuccess: () => {
        toast({
          title: "Alert Acknowledged",
          description: "The alert has been marked as acknowledged.",
        });
        queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      }
    });
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Loading Alerts...</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Active Alerts</h1>
          <p className="text-muted-foreground">Incident log and response tracking</p>
        </div>
      </div>

      <div className="space-y-4">
        {alerts?.map((alert) => (
          <motion.div key={alert.id} variants={item}>
            <Card className={`glass-card overflow-hidden transition-all duration-300 ${!alert.acknowledged && alert.severity === 'critical' ? 'border-destructive/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : ''}`}>
              <div className="flex flex-col md:flex-row">
                {/* Status bar left border */}
                <div className={`w-full md:w-1.5 shrink-0 ${
                  alert.severity === 'critical' ? 'bg-destructive' :
                  alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                
                <CardContent className="p-6 flex-1 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`
                        ${alert.severity === 'critical' ? 'border-destructive text-destructive bg-destructive/10' : 
                          alert.severity === 'warning' ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 
                          'border-blue-500 text-blue-500 bg-blue-500/10'}
                      `}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      {alert.acknowledged && (
                        <Badge variant="secondary" className="bg-white/5 border-white/10 text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Acknowledged
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold">{alert.message}</h3>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{alert.sensorName} ({alert.location})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(alert.createdAt), "MMM d, yyyy HH:mm:ss")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-xs border border-white/10">
                          Temp: {alert.temperature}°C
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-xs border border-white/10">
                          ML Conf: {(alert.mlConfidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    <Button 
                      variant={alert.acknowledged ? "secondary" : "default"}
                      className={`w-full md:w-auto transition-all ${!alert.acknowledged && alert.severity === 'critical' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}`}
                      disabled={alert.acknowledged || ackAlert.isPending}
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      {alert.acknowledged ? "Resolved" : "Acknowledge"}
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
        {alerts?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-card/20 rounded-xl border border-white/5">
            No active alerts found. System is clear.
          </div>
        )}
      </div>
    </motion.div>
  );
}
