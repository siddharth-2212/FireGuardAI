import type { Sensor } from "@workspace/api-client-react/src/generated/api.schemas";
import { FIRE_RISK_COLORS } from "@/lib/constants";

type SensorGridProps = {
  sensors: Sensor[];
};

/**
 * Compact sensor summary cards for the dashboard overview.
 * Shows only the most critical telemetry — temperature and fire risk.
 * Full readings live on the Sensors page.
 */
export function SensorGrid({ sensors }: SensorGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {sensors.slice(0, 6).map((sensor) => (
        <SensorGridItem key={sensor.id} sensor={sensor} />
      ))}
    </div>
  );
}

function SensorGridItem({ sensor }: { sensor: Sensor }) {
  const riskColor = FIRE_RISK_COLORS[sensor.fireRisk];

  return (
    <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium text-sm truncate pr-2">{sensor.name}</span>
        <div className={`status-dot ${sensor.status} shrink-0`} />
      </div>
      <p className="text-xs text-muted-foreground mb-4 truncate">{sensor.location}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Temp</span>
        <span className="font-mono">{sensor.temperature}°C</span>
      </div>
      <div className="flex justify-between items-center text-sm mt-1">
        <span className="text-muted-foreground">Risk</span>
        <span className={`text-xs font-semibold uppercase tracking-wider ${riskColor}`}>
          {sensor.fireRisk}
        </span>
      </div>
    </div>
  );
}
