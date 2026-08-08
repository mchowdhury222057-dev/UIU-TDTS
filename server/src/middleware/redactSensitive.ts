import { NextFunction, Request, Response } from "express";

const SENSITIVE_KEYS = new Set(["passwordHash"]);

function redact(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return value;
  if (seen.has(value as object)) return value;
  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, seen));
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key)) continue;
    result[key] = redact(val, seen);
  }
  return result;
}

// Last line of defense: strips passwordHash from any response body, no matter
// how deeply nested (e.g. project.supervisor, team.members[].user, etc.),
// so a service that forgets to sanitize a relation can never leak a hash.
export function redactSensitiveFields(_req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => originalJson(redact(body, new WeakSet()))) as Response["json"];
  next();
}
