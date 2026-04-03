import { motion } from "framer-motion";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "./SeverityBadge";
import { ALERT_SEVERITY_BAR } from "@/lib/constants";
import { type Alert } from "@/services/api";

type AlertCardProps = {
  alert:            Alert;
  onAcknowledge:    (alertId: number) => void;
  isAcknowledging:  boolean;
};

const cardEntrance = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0 },
};

/**
 * Alert incident card with severity stripe, metadata row, and acknowledge action.
 *
 * The critical card gets a soft destructive shadow — intentionally subtle
 * so it draws the eye without looking like a generic error state.
 */
export function AlertCard({ alert, onAcknowledge, isAcknowledging }: AlertCardProps) {
  const isCriticalAndActive = !alert.acknowledged && alert.severity === "critical";
  const leftBorderClass     = ALERT_SEVERITY_BAR[alert.severity] ?? ALERT_SEVERITY_BAR.info;

  return (
    <motion.div variants={cardEntrance}>
      <Card
        className={`glass-card overflow-hidden transition-all duration-300
          ${isCriticalAndActive ? "border-destructive/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]" : ""}`}
      >
        <div className="flex flex-col md:flex-row">
          <div className={`w-full md:w-1.5 shrink-0 ${leftBorderClass}`} />

          <CardContent className="p-6 flex-1 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <SeverityBadge severity={alert.severity} />
                {alert.acknowledged && (
                  <Badge
                    variant="secondary"
                    className="bg-white/5 border-white/10 text-muted-foreground flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Acknowledged
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-semibold leading-snug">{alert.message}</h3>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {alert.sensorName} &mdash; {alert.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 shrink-0" />
                  {format(new Date(alert.createdAt), "MMM d, yyyy HH:mm")}
                </span>
                <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-xs border border-white/10">
                  {alert.temperature}°C
                </span>
                <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-xs border border-white/10">
                  ML {(alert.mlConfidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <Button
                variant={alert.acknowledged ? "secondary" : "default"}
                className={`w-full md:w-auto transition-all
                  ${isCriticalAndActive ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}`}
                disabled={alert.acknowledged || isAcknowledging}
                onClick={() => onAcknowledge(alert.id)}
              >
                {alert.acknowledged ? "Resolved" : "Acknowledge"}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
