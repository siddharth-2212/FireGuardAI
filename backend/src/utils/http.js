/**
 * Parses a numeric route param and responds 400 if parsing fails.
 * Returns null on failure — callers should return immediately after the null check.
 */
export function parseIntParam(paramValue, paramName, res) {
  const parsed = parseInt(paramValue, 10);
  if (isNaN(parsed) || parsed <= 0) {
    res.status(400).json({ error: `Invalid ${paramName}: must be a positive integer` });
    return null;
  }
  return parsed;
}

/**
 * Logs the error and sends a generic 500 so stack traces never reach clients.
 * The label surfaces in logs so you can identify which handler failed without
 * needing the full stack.
 */
export function sendInternalError(res, err, label) {
  console.error(`[${label}]`, err);
  res.status(500).json({ error: "Internal server error" });
}
