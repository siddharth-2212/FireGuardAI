import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCard } from "@/components/alerts/AlertCard";
import { useToast } from "@/hooks/use-toast";
import { getAllAlerts, acknowledgeAlert, QUERY_KEYS } from "@/services/api";

const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.05 } },
};

export default function Alerts() {
  const queryClient = useQueryClient();
  const { toast }   = useToast();

  const { data: alerts, isLoading } = useQuery({
    queryKey: QUERY_KEYS.alerts,
    queryFn:  getAllAlerts,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: number) => acknowledgeAlert(alertId),
    onSuccess: () => {
      toast({
        title:       "Alert Acknowledged",
        description: "Incident has been marked as reviewed.",
      });
      // Refresh the list and the dashboard count badge
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading alerts...
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-5xl mx-auto"
    >
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Active Alerts</h1>
        <p className="text-muted-foreground">Incident log and response tracking</p>
      </header>

      <div className="space-y-4">
        {alerts?.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
            isAcknowledging={acknowledgeMutation.isPending}
          />
        ))}

        {alerts?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-card/20 rounded-xl border border-white/5">
            No active alerts. System is clear.
          </div>
        )}
      </div>
    </motion.div>
  );
}
