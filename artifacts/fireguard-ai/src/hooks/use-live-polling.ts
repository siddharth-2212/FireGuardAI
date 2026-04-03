import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardSummaryQueryKey,
  getGetRecentActivityQueryKey,
  getListSensorsQueryKey,
} from "@workspace/api-client-react";

/**
 * Registers a polling interval that invalidates the three main dashboard
 * queries on each tick. Calling invalidateQueries (rather than refetch)
 * lets React Query decide whether a background refetch is appropriate —
 * e.g. it won't refetch if the window is hidden.
 *
 * Returns a cleanup function so the interval is torn down on unmount.
 */
export function useLiveDashboardPolling(intervalMs = 5000) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const tick = () => {
      queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListSensorsQueryKey() });
    };

    const timerId = setInterval(tick, intervalMs);
    return () => clearInterval(timerId);
  }, [queryClient, intervalMs]);
}
