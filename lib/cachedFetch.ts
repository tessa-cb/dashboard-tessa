type CacheEntry<T> = {
  value?: T;
  atMs: number;
  inflight?: Promise<T>;
};

const globalForCache = globalThis as unknown as {
  __dashboardFetchCache?: Map<string, CacheEntry<unknown>>;
};

const cache: Map<string, CacheEntry<unknown>> =
  globalForCache.__dashboardFetchCache ?? new Map();

globalForCache.__dashboardFetchCache = cache;

export async function cachedJson<T>(
  key: string,
  fetcher: () => Promise<T>,
  {
    ttlMs = 1500,
    force = false,
  }: {
    ttlMs?: number;
    force?: boolean;
  } = {},
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (!force && existing?.value !== undefined && now - existing.atMs < ttlMs) {
    return existing.value;
  }

  if (!force && existing?.inflight) {
    return existing.inflight;
  }

  const inflight = fetcher().then((value) => {
    cache.set(key, { value, atMs: Date.now() });
    return value;
  });

  cache.set(key, { ...(existing ?? { atMs: 0 }), inflight, atMs: now });

  try {
    return await inflight;
  } finally {
    const cur = cache.get(key) as CacheEntry<T> | undefined;
    if (cur?.inflight === inflight) {
      // clear inflight handle; keep cached value
      cache.set(key, { value: cur.value, atMs: cur.atMs });
    }
  }
}
