import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorInputPanel } from "@/components/demo/SensorInputPanel";
import { DetectionResultDisplay } from "@/components/demo/DetectionResultDisplay";
import { useDetectionSimulator } from "@/hooks/use-detection-simulator";

export default function Demo() {
  const {
    temperature, setTemperature,
    smokeLevel,  setSmokeLevel,
    coLevel,     setCoLevel,
    runInference,
    detectionResult,
    isRunning,
  } = useDetectionSimulator();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-1">ML Inference Demo</h1>
        <p className="text-muted-foreground">Interactive fire detection simulator</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Sensor Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <SensorInputPanel
              temperature={temperature}
              smokeLevel={smokeLevel}
              coLevel={coLevel}
              onTemperatureChange={setTemperature}
              onSmokeLevelChange={setSmokeLevel}
              onCoLevelChange={setCoLevel}
              onRunInference={runInference}
              isRunning={isRunning}
            />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <DetectionResultDisplay
            result={detectionResult}
            isRunning={isRunning}
          />
        </Card>
      </div>
    </div>
  );
}
