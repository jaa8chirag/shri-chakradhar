import IORedis from "ioredis";

interface KvClient {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
}

let client: KvClient | null | undefined;

function wrap(raw: IORedis): KvClient {
  return {
    async get<T>(key: string) {
      const value = await raw.get(key);
      return value === null ? null : (JSON.parse(value) as T);
    },
    async set(key: string, value: unknown) {
      await raw.set(key, JSON.stringify(value));
    },
  };
}

/**
 * Returns a Redis client if the project is connected to one (via Vercel Marketplace's Redis
 * integration, which injects a standard `REDIS_URL` connection string), or null if not — which
 * is the normal case for local dev. Every write path in this app falls back to the local JSON
 * file store when this is null, so `pnpm dev` needs zero setup; only the deployed Vercel site
 * needs a real store connected, since that's the only place the filesystem is read-only.
 */
export function getRedis(): KvClient | null {
  if (client !== undefined) return client;

  const url = process.env.REDIS_URL;
  client = url ? wrap(new IORedis(url)) : null;
  return client;
}
