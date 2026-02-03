import { describe, expect, it, vi, beforeEach } from "vitest";
import { cachedJson } from "@/lib/cachedFetch";

describe("cachedJson", () => {
  beforeEach(() => {
    const cache = (globalThis as unknown as { __dashboardFetchCache?: Map<string, unknown> })
      .__dashboardFetchCache;
    cache?.clear();
  });

  it("returns cached value within ttl", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ ok: true });

    const first = await cachedJson("k", fetcher, { ttlMs: 1000 });
    const second = await cachedJson("k", fetcher, { ttlMs: 1000 });

    expect(first).toEqual({ ok: true });
    expect(second).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("dedupes inflight requests", async () => {
    let resolve: (value: { ok: boolean }) => void;
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise<{ ok: boolean }>((res) => {
          resolve = res;
        }),
    );

    const p1 = cachedJson("k", fetcher, { ttlMs: 1000 });
    const p2 = cachedJson("k", fetcher, { ttlMs: 1000 });

    resolve!({ ok: true });

    const [v1, v2] = await Promise.all([p1, p2]);

    expect(v1).toEqual({ ok: true });
    expect(v2).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("force bypasses cache", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false });

    const first = await cachedJson("k", fetcher, { ttlMs: 1000 });
    const second = await cachedJson("k", fetcher, { ttlMs: 1000, force: true });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
