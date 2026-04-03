import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle, Flame } from "lucide-react";
import { type DetectionResult } from "@/services/api";

type DetectionResultDisplayProps = {
  result:    DetectionResult | undefined;
  isRunning: boolean;
};

/**
 * Animated result panel for the ML demo.
 *
 * Three visual states:
 *   1. Empty — awaiting first inference
 *   2. Running — mutation in-flight (handled by parent hiding this)
 *   3. Result — fire or clear verdict with confidence meter
 *
 * The glow ring uses a blur overlay behind the circle rather than
 * box-shadow, which renders more consistently across browsers.
 */
export function DetectionResultDisplay({ result, isRunning }: DetectionResultDisplayProps) {
  const showResult = result && !isRunning;

  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
      {!showResult && (
        <div className="text-center text-muted-foreground p-8">
          <Activity className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm">Adjust the sensor parameters and run inference to see the ML prediction.</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {showResult && (
          <motion.div
            key={`result-${result.timestamp}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full p-8 flex flex-col items-center"
          >
            <ConfidenceMeter fire={result.fire} confidence={result.confidence} />

            <div className={`w-full p-4 rounded-xl border text-center mt-6 transition-colors
              ${result.fire
                ? "bg-destructive/10 border-destructive/30"
                : "bg-emerald-500/10 border-emerald-500/30"
              }`}
            >
              <h3 className={`text-xl font-bold mb-1 ${result.fire ? "text-destructive" : "text-emerald-500"}`}>
                {result.fire ? "FIRE DETECTED" : "CLEAR"}
              </h3>
              <p className="font-medium text-sm mb-2">
                Risk Level: {result.riskLevel.toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">{result.recommendation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type ConfidenceMeterProps = {
  fire:       boolean;
  confidence: number;
};

function ConfidenceMeter({ fire, confidence }: ConfidenceMeterProps) {
  const accentClass = fire ? "border-destructive text-destructive" : "border-emerald-500 text-emerald-500";
  const glowClass   = fire ? "bg-destructive" : "bg-emerald-500";

  return (
    <div className="relative mb-2">
      <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 ${glowClass}`} />
      <div className={`relative w-44 h-44 rounded-full flex flex-col items-center justify-center border-4 bg-card/80 backdrop-blur-sm z-10 ${accentClass}`}>
        {fire ? (
          <Flame className="w-14 h-14 mb-1 animate-pulse" />
        ) : (
          <CheckCircle className="w-14 h-14 mb-1" />
        )}
        <span className="text-2xl font-bold">{(confidence * 100).toFixed(1)}%</span>
        <span className="text-xs uppercase tracking-wider font-semibold opacity-70">Confidence</span>
      </div>
    </div>
  );
}
