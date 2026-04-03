import { Activity, Cpu } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

type SensorInputPanelProps = {
  temperature:         number;
  smokeLevel:          number;
  coLevel:             number;
  onTemperatureChange: (value: number) => void;
  onSmokeLevelChange:  (value: number) => void;
  onCoLevelChange:     (value: number) => void;
  onRunInference:      () => void;
  isRunning:           boolean;
};

/**
 * The left panel of the ML demo — slider controls and the trigger button.
 * Max values cover both normal and extreme incident scenarios:
 *   - Temperature: 0–150°C (fires can exceed 100°C in early stages)
 *   - Smoke: 0–100% (percent of sensor saturation)
 *   - CO: 0–1000 ppm (OSHA's short-term exposure limit is 200 ppm)
 */
export function SensorInputPanel({
  temperature,
  smokeLevel,
  coLevel,
  onTemperatureChange,
  onSmokeLevelChange,
  onCoLevelChange,
  onRunInference,
  isRunning,
}: SensorInputPanelProps) {
  return (
    <div className="space-y-8">
      <SliderRow
        label="Temperature (°C)"
        displayValue={`${temperature}°C`}
        displayClass="text-primary"
        sliderValue={temperature}
        onChange={onTemperatureChange}
        max={150}
        step={1}
      />
      <SliderRow
        label="Smoke Particulates (%)"
        displayValue={`${smokeLevel}%`}
        displayClass="text-amber-500"
        sliderValue={smokeLevel}
        onChange={onSmokeLevelChange}
        max={100}
        step={1}
      />
      <SliderRow
        label="CO Level (ppm)"
        displayValue={`${coLevel} ppm`}
        displayClass="text-blue-500"
        sliderValue={coLevel}
        onChange={onCoLevelChange}
        max={1000}
        step={10}
      />

      <Button
        className="w-full h-12 text-base font-semibold"
        onClick={onRunInference}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <Activity className="mr-2 h-5 w-5 animate-pulse" />
            Running Inference...
          </>
        ) : (
          <>
            <Cpu className="mr-2 h-5 w-5" />
            Run Detection
          </>
        )}
      </Button>
    </div>
  );
}

type SliderRowProps = {
  label:        string;
  displayValue: string;
  displayClass: string;
  sliderValue:  number;
  onChange:     (value: number) => void;
  max:          number;
  step:         number;
};

function SliderRow({ label, displayValue, displayClass, sliderValue, onChange, max, step }: SliderRowProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <span className={`font-mono text-sm ${displayClass}`}>{displayValue}</span>
      </div>
      <Slider
        value={[sliderValue]}
        onValueChange={(v) => onChange(v[0])}
        max={max}
        step={step}
      />
    </div>
  );
}
