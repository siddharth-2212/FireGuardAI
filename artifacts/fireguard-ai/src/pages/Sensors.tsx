import { motion } from "framer-motion";
import { useListSensors } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

export default function Sensors() {
  const { data: sensors, isLoading } = useListSensors();

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Scanning Sensor Network...</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Sensor Network</h1>
        <p className="text-muted-foreground">Live telemetry across all deployed units</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sensors?.map((sensor) => (
          <motion.div key={sensor.id} variants={item}>
            <Card className="glass-card h-full group hover:border-primary/30 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{sensor.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{sensor.location}</p>
                  </div>
                  <div className={`status-dot ${sensor.status}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Risk Level Badge */}
                <div className={`w-full py-2 px-3 rounded-md border text-center font-semibold text-sm tracking-wider uppercase transition-colors
                  ${sensor.fireRisk === 'critical' ? 'bg-destructive/10 border-destructive/50 text-destructive shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 
                    sensor.fireRisk === 'high' ? 'bg-orange-500/10 border-orange-500/50 text-orange-500' :
                    sensor.fireRisk === 'medium' ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 
                    'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'}`}
                >
                  Risk: {sensor.fireRisk}
                </div>

                <div className="space-y-4">
                  {/* Temperature */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Temperature</span>
                      <span className="font-mono">{sensor.temperature.toFixed(1)}°C</span>
                    </div>
                    <Progress value={Math.min((sensor.temperature / 100) * 100, 100)} className="h-1.5" />
                  </div>

                  {/* Smoke */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Smoke Particulates</span>
                      <span className="font-mono">{sensor.smokeLevel.toFixed(1)}%</span>
                    </div>
                    <Progress value={sensor.smokeLevel} className="h-1.5 [&>div]:bg-amber-500" />
                  </div>

                  {/* CO Level */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CO Level</span>
                      <span className="font-mono">{sensor.coLevel.toFixed(0)} ppm</span>
                    </div>
                    <Progress value={Math.min((sensor.coLevel / 500) * 100, 100)} className="h-1.5 [&>div]:bg-blue-500" />
                  </div>
                  
                  {/* Humidity */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Humidity</span>
                      <span className="font-mono">{sensor.humidity.toFixed(1)}%</span>
                    </div>
                    <Progress value={sensor.humidity} className="h-1.5 [&>div]:bg-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
