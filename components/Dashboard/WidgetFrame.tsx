"use client";

import { useEffect, useMemo, useState } from "react";

export default function WidgetFrame({
  title,
  children,
  onRefresh,
  onRemove,
  isRefreshing = false,
  hasQueuedRefresh = false,
  lastRefreshedAt,
  refreshIntervalsSec = [0, 15, 30, 60],
}: {
  title: string;
  children: React.ReactNode;
  onRefresh: () => void;
  onRemove?: () => void;
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
    <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-3 compact:p-2 border-b border-border flex items-center justify-between bg-surface/70">
        <div className="flex flex-col">
          <div className="font-semibold text-foreground">{title}</div>
          <div className="text-[11px] text-muted-foreground">
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
          {onRemove ? (
            <button
              onClick={onRemove}
              className="text-xs px-2 py-1 rounded-md border border-border bg-surface-2 text-foreground hover:bg-muted"
              title="Remove widget"
            >
              Remove
            </button>
          ) : null}
          <select
            className="text-xs border border-border rounded-md px-2 py-1 bg-surface-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
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
            className="text-xs bg-foreground text-background px-2 py-1 rounded-md hover:brightness-110"
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
