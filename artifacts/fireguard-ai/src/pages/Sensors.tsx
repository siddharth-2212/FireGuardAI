import { motion } from "framer-motion";
import { useListSensors } from "@workspace/api-client-react";
import { SensorCard } from "@/components/sensors/SensorCard";

const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.05 } },
};

export default function Sensors() {
  const { data: sensors, isLoading } = useListSensors();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Scanning sensor network...
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Sensor Network</h1>
        <p className="text-muted-foreground">Live telemetry across all deployed units</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sensors?.map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>
    </motion.div>
  );
}
