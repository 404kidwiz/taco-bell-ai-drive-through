/**
 * Simple in-memory response cache for common queries.
 * TTL: 5 minutes, max 20 entries.
 */

interface CacheEntry {
  response: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const MAX_ENTRIES = 20;
const TTL_MS = 5 * 60 * 1000; // 5 minutes

const COMMON_QUERIES = [
  "what's popular",
  "what do you recommend",
  "what's good",
  "what should i order",
  "best sellers",
  "most popular",
  "what's your favorite",
  "recommend something",
];

export function getCachedResponse(input: string): string | null {
  const key = input.toLowerCase().trim();
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.response;
  }
  if (entry) cache.delete(key);
  return null;
}

export function setCachedResponse(input: string, response: string): void {
  const key = input.toLowerCase().trim();
  // Only cache short, common-looking queries
  if (key.length > 80) return;
  // Evict oldest if full
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { response, expiresAt: Date.now() + TTL_MS });
}

export function isCommonQuery(input: string): boolean {
  const lower = input.toLowerCase().trim();
  return COMMON_QUERIES.some((q) => lower.includes(q) || q.includes(lower));
}
