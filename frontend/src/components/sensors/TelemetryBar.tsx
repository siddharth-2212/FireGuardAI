import { Progress } from "@/components/ui/progress";

type TelemetryBarProps = {
  label:        string;
  value:        number;
  displayValue: string;
  /** Normalizes the raw value to a 0–100 progress percentage */
  normalize:    (v: number) => number;
  /** Optional Tailwind class override for the progress bar fill */
  barClass?:    string;
};

/**
 * Single labeled telemetry row: label + current reading + progress bar.
 * The normalize function keeps display logic out of this component —
 * temperature and CO have different max scales so callers decide the mapping.
 */
export function TelemetryBar({ label, value, displayValue, normalize, barClass }: TelemetryBarProps) {
  const progressValue = Math.min(100, Math.max(0, normalize(value)));

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{displayValue}</span>
      </div>
      <Progress value={progressValue} className={`h-1.5 ${barClass ?? ""}`} />
    </div>
  );
}
