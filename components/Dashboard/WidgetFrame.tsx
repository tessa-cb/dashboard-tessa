"use client";

import { useEffect, useMemo, useState } from "react";

export default function WidgetFrame({
  title,
  children,
  onRefresh,
  isRefreshing = false,
  hasQueuedRefresh = false,
  lastRefreshedAt,
  refreshIntervalsSec = [0, 15, 30, 60],
}: {
  title: string;
  children: React.ReactNode;
  onRefresh: () => void;
  isRefreshing?: boolean;
  hasQueuedRefresh?: boolean;
  lastRefreshedAt?: number;
  refreshIntervalsSec?: number[];
}) {
  const [intervalSec, setIntervalSec] = useState<number>(0);

  const intervalMs = useMemo(
    () => (intervalSec > 0 ? intervalSec * 1000 : null),
    [intervalSec],
  );

  useEffect(() => {
    if (!intervalMs) return;
    const id = window.setInterval(onRefresh, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, onRefresh]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex flex-col">
          <div className="font-bold text-gray-900">{title}</div>
          <div className="text-[11px] text-gray-500">
            {isRefreshing
              ? hasQueuedRefresh
                ? "Refreshing… (1 queued)"
                : "Refreshing…"
              : lastRefreshedAt
                ? `Last refreshed: ${new Date(lastRefreshedAt).toLocaleTimeString()}`
                : ""}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="text-xs border rounded px-2 py-1 bg-white"
            value={String(intervalSec)}
            onChange={(e) => setIntervalSec(Number(e.target.value))}
            title="Auto refresh"
          >
            {refreshIntervalsSec.map((s) => (
              <option key={s} value={String(s)}>
                {s === 0 ? "Auto: off" : `Auto: ${s}s`}
              </option>
            ))}
          </select>

          <button
            onClick={onRefresh}
            className="text-xs bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-700"
            title={
              isRefreshing
                ? "Refresh in progress; another refresh will be queued"
                : "Refresh"
            }
          >
            {isRefreshing ? "Refresh (queue)" : "Refresh"}
          </button>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
