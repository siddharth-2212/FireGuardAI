/**
 * Tailwind text-color classes for each fire risk level.
 * Defined once here so all components use the same visual language —
 * if we ever rebrand "critical" from red to something else, one change covers everything.
 */
export const FIRE_RISK_COLORS: Record<string, string> = {
  low:      "text-emerald-500",
  medium:   "text-amber-500",
  high:     "text-orange-500",
  critical: "text-destructive",
};

/**
 * Tailwind classes for the full risk badge (background + border + text).
 * Used on the Sensors page where we have more space for a full badge.
 */
export const FIRE_RISK_BADGE_CLASSES: Record<string, string> = {
  low:      "bg-emerald-500/10 border-emerald-500/50 text-emerald-500",
  medium:   "bg-amber-500/10 border-amber-500/50 text-amber-500",
  high:     "bg-orange-500/10 border-orange-500/50 text-orange-500",
  critical: "bg-destructive/10 border-destructive/50 text-destructive shadow-[0_0_15px_rgba(239,68,68,0.2)]",
};

/**
 * Tailwind classes for the alert severity left-border stripe.
 */
export const ALERT_SEVERITY_BAR: Record<string, string> = {
  info:     "bg-blue-500",
  warning:  "bg-amber-500",
  critical: "bg-destructive",
};

/**
 * Tailwind classes for alert severity badge (outline variant).
 */
export const ALERT_SEVERITY_BADGE: Record<string, string> = {
  info:     "border-blue-500 text-blue-500 bg-blue-500/10",
  warning:  "border-amber-500 text-amber-500 bg-amber-500/10",
  critical: "border-destructive text-destructive bg-destructive/10",
};
