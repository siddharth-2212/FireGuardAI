import { Badge } from "@/components/ui/badge";
import { ALERT_SEVERITY_BADGE } from "@/lib/constants";

type SeverityBadgeProps = {
  severity: string;
};

/**
 * Colored outline badge for alert severity levels.
 * Using a separate component here because the severity coloring
 * logic was duplicated in both the badge and the left border stripe.
 */
export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const colorClass = ALERT_SEVERITY_BADGE[severity] ?? ALERT_SEVERITY_BADGE.info;

  return (
    <Badge variant="outline" className={colorClass}>
      {severity.toUpperCase()}
    </Badge>
  );
}
