import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runDetection, QUERY_KEYS, type DetectionResult } from "@/services/api";

// Realistic starting defaults — close to ambient indoor conditions
const DEFAULT_TEMPERATURE = 25;
const DEFAULT_SMOKE       = 0;
const DEFAULT_CO_LEVEL    = 50;

// Sensor ID 1 is the demo sensor used for all playground detections.
// Using a real sensor keeps the activity feed meaningful.
const DEMO_SENSOR_ID = 1;

/**
 * Encapsulates all state and mutation logic for the ML inference demo page.
 * Extracting this keeps the Demo component purely presentational —
 * it just maps slider values to UI elements and calls the handler.
 */
export function useDetectionSimulator() {
  const queryClient = useQueryClient();

  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE);
  const [smokeLevel,  setSmokeLevel]  = useState(DEFAULT_SMOKE);
  const [coLevel,     setCoLevel]     = useState(DEFAULT_CO_LEVEL);

  const detectionMutation = useMutation({
    mutationFn: (input: { temperature: number; smokeLevel: number; coLevel: number }) =>
      runDetection({ sensorId: DEMO_SENSOR_ID, ...input }),
    onSuccess: () => {
      // If a fire was detected the service creates an alert — refresh both
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
    },
  });

  const runInference = () => {
    detectionMutation.mutate({ temperature, smokeLevel, coLevel });
  };

  return {
    temperature, setTemperature,
    smokeLevel,  setSmokeLevel,
    coLevel,     setCoLevel,
    runInference,
    detectionResult: detectionMutation.data as DetectionResult | undefined,
    isRunning:       detectionMutation.isPending,
  };
}
