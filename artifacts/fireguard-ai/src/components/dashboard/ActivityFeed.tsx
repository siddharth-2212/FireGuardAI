import { format } from "date-fns";
import type { ActivityEvent } from "@workspace/api-client-react/src/generated/api.schemas";

type ActivityFeedProps = {
  events: ActivityEvent[];
};

const SEVERITY_DOT_CLASSES: Record<string, string> = {
  critical: "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.8)]",
  warning:  "bg-amber-500",
  info:     "bg-blue-500",
};

/**
 * Scrollable activity feed for recent detection events, acknowledgments,
 * and system status updates. Each entry is intentionally minimal —
 * operators scan this quickly, they don't read it.
 */
export function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No recent activity. System monitoring is active.
      </p>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto max-h-[420px] pr-1">
      {events.map((event) => (
        <FeedItem key={event.id} event={event} />
      ))}
    </div>
  );
}

function FeedItem({ event }: { event: ActivityEvent }) {
  const dotClass = SEVERITY_DOT_CLASSES[event.severity] ?? SEVERITY_DOT_CLASSES.info;

  return (
    <div className="flex gap-3 items-start">
      <div className="mt-1.5 shrink-0">
        <div className={`w-2 h-2 rounded-full ${dotClass}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug">{event.message}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {event.sensorName} &bull; {format(new Date(event.timestamp), "HH:mm:ss")}
        </p>
      </div>
    </div>
  );
}
