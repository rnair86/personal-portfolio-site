// In-memory, per-IP sliding-window rate limiter for /api/chat.
//
// Defaults: 10 requests per 30 minutes per IP. Override with environment
// variables (restart required):
//   CHAT_RATE_LIMIT            max requests per window (positive integer)
//   CHAT_RATE_WINDOW_MINUTES   window length in minutes (positive number)
//
// State lives in this server process only. It resets when the container
// restarts or scales to zero, and it is not shared between replicas (the
// Azure app runs with --max-replicas 1).

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MINUTES = 30;
const MAX_TRACKED_IPS = 10_000;

function positiveNumber(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const limit = Math.floor(positiveNumber(process.env.CHAT_RATE_LIMIT, DEFAULT_LIMIT));
const windowMinutes = positiveNumber(
  process.env.CHAT_RATE_WINDOW_MINUTES,
  DEFAULT_WINDOW_MINUTES,
);
const windowMs = windowMinutes * 60_000;

// IP -> timestamps (ms) of requests inside the current window.
const hits = new Map<string, number[]>();

export const rateLimitConfig = { limit, windowMinutes } as const;

/**
 * Best-effort client IP. Azure Container Apps' ingress appends the real client
 * address to the end of x-forwarded-for, so the last entry is the one a caller
 * cannot spoof. The port suffix (e.g. "1.2.3.4:5678") is stripped.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const last = forwarded?.split(",").pop()?.trim();
  if (!last) return "unknown";
  if (last.startsWith("[")) return last.slice(1, last.indexOf("]")); // [ipv6]:port
  return /^\d+\.\d+\.\d+\.\d+:\d+$/.test(last) ? last.split(":")[0] : last;
}

function prune(now: number) {
  for (const [ip, times] of hits) {
    if (times[times.length - 1] <= now - windowMs) hits.delete(ip);
  }
  // Still too large (many distinct recent IPs): drop the oldest entries.
  for (const ip of hits.keys()) {
    if (hits.size <= MAX_TRACKED_IPS) break;
    hits.delete(ip);
  }
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/** Records a request for this IP and says whether it is within the limit. */
export function checkRateLimit(ip: string, now = Date.now()): RateLimitResult {
  if (hits.size >= MAX_TRACKED_IPS) prune(now);

  const recent = (hits.get(ip) ?? []).filter((t) => t > now - windowMs);

  if (recent.length >= limit) {
    hits.set(ip, recent);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)),
    };
  }

  recent.push(now);
  hits.set(ip, recent);
  return { allowed: true };
}
