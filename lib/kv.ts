import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

/**
 * Returns an Upstash Redis client if the project is connected to one (via Vercel Marketplace
 * or a direct Upstash account), or null if not — which is the normal case for local dev.
 * Every write path in this app falls back to the local JSON file store when this is null, so
 * `pnpm dev` needs zero setup; only the deployed Vercel site needs a real store connected,
 * since that's the only place the filesystem is read-only.
 */
export function getRedis(): Redis | null {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  client = url && token ? new Redis({ url, token }) : null;
  return client;
}
