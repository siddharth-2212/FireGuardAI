import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TelemetryBar } from "./TelemetryBar";
import { FIRE_RISK_BADGE_CLASSES } from "@/lib/constants";
import type { Sensor } from "@workspace/api-client-react/src/generated/api.schemas";

type SensorCardProps = {
  sensor: Sensor;
};

/**
 * Full telemetry card for the Sensors page.
 * Shows all four readings with visual progress bars so operators
 * can spot anomalies without reading exact numbers.
 */
export function SensorCard({ sensor }: SensorCardProps) {
  const riskBadgeClass = FIRE_RISK_BADGE_CLASSES[sensor.fireRisk] ?? FIRE_RISK_BADGE_CLASSES.low;

  return (
    <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
      <Card className="glass-card h-full group hover:border-primary/30 transition-colors">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="min-w-0 pr-3">
              <CardTitle className="text-lg truncate">{sensor.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{sensor.location}</p>
            </div>
            <div className={`status-dot ${sensor.status} shrink-0 mt-1`} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className={`w-full py-2 px-3 rounded-md border text-center font-semibold text-sm tracking-wider uppercase transition-colors ${riskBadgeClass}`}>
            Risk: {sensor.fireRisk}
          </div>

          <div className="space-y-4">
            <TelemetryBar
              label="Temperature"
              value={sensor.temperature}
              displayValue={`${sensor.temperature.toFixed(1)}°C`}
              normalize={(v) => (v / 100) * 100}
            />
            <TelemetryBar
              label="Smoke Particulates"
              value={sensor.smokeLevel}
              displayValue={`${sensor.smokeLevel.toFixed(1)}%`}
              normalize={(v) => v}
              barClass="[&>div]:bg-amber-500"
            />
            <TelemetryBar
              label="CO Level"
              value={sensor.coLevel}
              displayValue={`${sensor.coLevel.toFixed(0)} ppm`}
              normalize={(v) => (v / 500) * 100}
              barClass="[&>div]:bg-blue-500"
            />
            <TelemetryBar
              label="Humidity"
              value={sensor.humidity}
              displayValue={`${sensor.humidity.toFixed(1)}%`}
              normalize={(v) => v}
              barClass="[&>div]:bg-emerald-500"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
