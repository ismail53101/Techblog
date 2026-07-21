/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * This is sufficient for a single instance and for development. For a
 * multi-instance serverless deployment (e.g. Vercel) you should back this with
 * a shared store such as Upstash Redis (@upstash/ratelimit). The call sites
 * won't change — only this module's internals.
 */

type Entry = { count: number; expires: number };

const store = new Map<string, Entry>();

// Occasionally purge expired entries so the map doesn't grow unbounded.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, entry] of store) {
    if (entry.expires < now) store.delete(key);
  }
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const entry = store.get(key);
  if (!entry || entry.expires < now) {
    store.set(key, { count: 1, expires: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return { success: entry.count <= limit, limit, remaining, reset: entry.expires };
}

/** Best-effort client IP extraction from request headers. */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("x-real-ip") || "127.0.0.1";
}
