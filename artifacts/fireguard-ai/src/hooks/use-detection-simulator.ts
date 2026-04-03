import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRunDetection, getListAlertsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";

// Realistic starting defaults — close to ambient indoor conditions
const DEFAULT_TEMPERATURE = 25;
const DEFAULT_SMOKE       = 0;
const DEFAULT_CO_LEVEL    = 50;

// Sensor ID 1 is the demo sensor used for all playground detections.
// Using a real sensor keeps the activity feed meaningful.
const DEMO_SENSOR_ID = 1;

/**
 * Encapsulates all state and logic for the ML inference demo page.
 * Extracting this keeps the Demo component purely presentational —
 * it just maps slider values to UI elements and calls the handler.
 */
export function useDetectionSimulator() {
  const queryClient = useQueryClient();

  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE);
  const [smokeLevel, setSmokeLevel]   = useState(DEFAULT_SMOKE);
  const [coLevel, setCoLevel]         = useState(DEFAULT_CO_LEVEL);

  const detectionMutation = useRunDetection();

  const runInference = () => {
    detectionMutation.mutate(
      { data: { sensorId: DEMO_SENSOR_ID, temperature, smokeLevel, coLevel } },
      {
        onSuccess: () => {
          // If a fire was detected the service creates an alert — refresh both
          queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        },
      }
    );
  };

  return {
    temperature, setTemperature,
    smokeLevel,  setSmokeLevel,
    coLevel,     setCoLevel,
    runInference,
    detectionResult: detectionMutation.data,
    isRunning:       detectionMutation.isPending,
  };
}
