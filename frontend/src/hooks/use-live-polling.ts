import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/services/api";

/**
 * Registers a polling interval that invalidates the three main dashboard
 * queries on each tick. Using invalidateQueries (rather than refetch directly)
 * lets React Query decide whether a background refetch is appropriate —
 * it won't refetch if the window is hidden, for example.
 */
export function useLiveDashboardPolling(intervalMs = 5_000) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const tick = () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardActivity });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sensors });
    };

    const timerId = setInterval(tick, intervalMs);
    return () => clearInterval(timerId);
  }, [queryClient, intervalMs]);
}
