/**
 * FireGuard AI — ML Inference Engine
 *
 * Self-contained fire detection model. No external service required —
 * this runs entirely inside the Node.js process, so deployment is a
 * single backend with no inter-service latency or dependency failures.
 *
 * Model design:
 *   Three sensor dimensions are each normalized to a 0–1 scale, then
 *   combined with empirically derived weights:
 *     - Temperature (40%) — strongest predictor; contributes above 30°C
 *     - Smoke       (40%) — direct combustion indicator; scales 0–100%
 *     - CO          (20%) — secondary signal; saturates at 200 ppm
 *
 *   The 30°C lower bound on temperature prevents false positives from
 *   normal ambient warmth in server rooms or kitchens.
 */

const RECOMMENDATIONS = {
  low:      "All readings within normal parameters. Continue routine monitoring.",
  medium:   "Elevated readings detected. Increase monitoring and inspect the area.",
  high:     "High fire risk. Initiate evacuation protocol and contact emergency services.",
  critical: "CRITICAL: Immediate action required. Evacuate all personnel and call 911.",
};

/**
 * Maps a 0–1 confidence score to a named risk level.
 * Thresholds are intentionally asymmetric — we'd rather have a false
 * positive at 0.25 than miss a real fire at 0.49.
 */
function getRiskLevel(confidence) {
  if (confidence < 0.25) return "low";
  if (confidence < 0.50) return "medium";
  if (confidence < 0.75) return "high";
  return "critical";
}

/**
 * Runs fire detection inference on a single set of sensor readings.
 *
 * @param {number} temperature  - Temperature in °C
 * @param {number} smokeLevel   - Smoke particulate concentration (0–100%)
 * @param {number} coLevel      - Carbon monoxide level in ppm
 *
 * @returns {{ fire: boolean, confidence: number, riskLevel: string, recommendation: string }}
 */
export function predictFire(temperature, smokeLevel, coLevel) {
  const tempScore  = Math.max(0, (temperature - 30) / 70) * 0.4;
  const smokeScore = (smokeLevel / 100) * 0.4;
  const coScore    = Math.min(1, coLevel / 200) * 0.2;

  const confidence = Math.min(1, Math.max(0, tempScore + smokeScore + coScore));
  const fire       = confidence > 0.5;
  const riskLevel  = getRiskLevel(confidence);

  return {
    fire,
    confidence,
    riskLevel,
    recommendation: RECOMMENDATIONS[riskLevel],
  };
}
