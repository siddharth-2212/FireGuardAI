import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRunDetection } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Activity, Flame, ShieldAlert, CheckCircle } from "lucide-react";

export default function Demo() {
  const [temperature, setTemperature] = useState(25);
  const [smoke, setSmoke] = useState(0);
  const [coLevel, setCoLevel] = useState(50);

  const detectMutation = useRunDetection();

  const handleRunInference = () => {
    detectMutation.mutate({
      data: {
        sensorId: 1, // Dummy ID for demo
        temperature,
        smokeLevel: smoke,
        coLevel
      }
    });
  };

  const result = detectMutation.data;
  const isPending = detectMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">ML Inference Demo</h1>
        <p className="text-muted-foreground">Interactive fire detection simulator</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Sensor Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Temperature (°C)</Label>
                <span className="font-mono text-primary">{temperature}°C</span>
              </div>
              <Slider 
                value={[temperature]} 
                onValueChange={(v) => setTemperature(v[0])} 
                max={150} 
                step={1}
                className="[&_.relative]:bg-primary"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Smoke Particulates (%)</Label>
                <span className="font-mono text-amber-500">{smoke}%</span>
              </div>
              <Slider 
                value={[smoke]} 
                onValueChange={(v) => setSmoke(v[0])} 
                max={100} 
                step={1} 
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>CO Level (ppm)</Label>
                <span className="font-mono text-blue-500">{coLevel} ppm</span>
              </div>
              <Slider 
                value={[coLevel]} 
                onValueChange={(v) => setCoLevel(v[0])} 
                max={1000} 
                step={10} 
              />
            </div>

            <Button 
              className="w-full h-12 text-lg font-semibold" 
              onClick={handleRunInference}
              disabled={isPending}
            >
              {isPending ? (
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
          </CardContent>
        </Card>

        <Card className="glass-card relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
          {/* Default State */}
          {!result && !isPending && (
            <div className="text-center text-muted-foreground p-8">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Adjust parameters and run inference to see ML model prediction.</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {result && !isPending && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full p-8 flex flex-col items-center"
              >
                <div className="relative mb-8">
                  {/* Outer glow ring */}
                  <div className={`absolute inset-0 rounded-full blur-2xl opacity-50 ${result.fire ? 'bg-destructive' : 'bg-emerald-500'}`} />
                  
                  {/* Center circle */}
                  <div className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center border-4 bg-card/80 backdrop-blur-sm z-10
                    ${result.fire ? 'border-destructive text-destructive' : 'border-emerald-500 text-emerald-500'}`}
                  >
                    {result.fire ? (
                      <Flame className="w-16 h-16 mb-2 animate-pulse" />
                    ) : (
                      <CheckCircle className="w-16 h-16 mb-2" />
                    )}
                    <span className="text-3xl font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                    <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Confidence</span>
                  </div>
                </div>

                <div className={`w-full p-4 rounded-xl border text-center ${
                  result.fire ? 'bg-destructive/10 border-destructive/30' : 'bg-emerald-500/10 border-emerald-500/30'
                }`}>
                  <h3 className={`text-xl font-bold mb-2 ${result.fire ? 'text-destructive' : 'text-emerald-500'}`}>
                    {result.fire ? 'FIRE DETECTED' : 'CLEAR'}
                  </h3>
                  <p className="text-foreground font-medium mb-1">Risk Level: {result.riskLevel.toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

// Add Cpu icon to imports at the top
import { Cpu } from "lucide-react";
