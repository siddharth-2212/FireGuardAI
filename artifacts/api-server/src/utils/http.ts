import type { Request, Response } from "express";

/**
 * Parses a numeric route param and responds 400 if it can't be parsed.
 * Returns null when invalid — caller should return after checking.
 */
export function parseIntParam(
  paramValue: string,
  paramName: string,
  res: Response
): number | null {
  const parsed = parseInt(paramValue, 10);
  if (isNaN(parsed) || parsed <= 0) {
    res.status(400).json({ error: `Invalid ${paramName}: must be a positive integer` });
    return null;
  }
  return parsed;
}

/**
 * Wraps internal server errors with consistent shape and logging.
 * The label helps identify the failing operation in logs without
 * exposing stack traces to clients.
 */
export function sendInternalError(req: Request, res: Response, err: unknown, label: string): void {
  req.log.error({ err }, label);
  res.status(500).json({ error: "Internal server error" });
}
