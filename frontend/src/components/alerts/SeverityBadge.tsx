import { Badge } from "@/components/ui/badge";
import { ALERT_SEVERITY_BADGE } from "@/lib/constants";

type SeverityBadgeProps = {
  severity: string;
};

/**
 * Colored outline badge for alert severity levels.
 * Separate component because the severity coloring logic was duplicated
 * in both the badge and the left border stripe — pulled into one place.
 */
export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const colorClass = ALERT_SEVERITY_BADGE[severity] ?? ALERT_SEVERITY_BADGE.info;
  return (
    <Badge variant="outline" className={colorClass}>
      {severity.toUpperCase()}
    </Badge>
  );
}
