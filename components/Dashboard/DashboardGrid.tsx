"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardConfig } from "@/config/dashboard-config";
import { widgetRegistry } from "@/config/widget-registry";
import WidgetFrame from "@/components/Dashboard/WidgetFrame";

export default function DashboardGrid({
  config,
  onRemoveWidget,
  refreshAllKey,
}: {
  config: DashboardConfig;
  onRemoveWidget?: (instanceId: string) => void;
  refreshAllKey?: number;
}) {
  const [refreshKeys, setRefreshKeys] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});
  const [queued, setQueued] = useState<Record<string, boolean>>({});
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Record<string, number>>(
    {},
  );

  // Track the refreshKey that is currently "in-flight" for each instance.
  const inFlightKeyRef = useRef<Record<string, number>>({});
  const refreshingRef = useRef<Record<string, boolean>>({});

  const refresh = useCallback((instanceId: string) => {
    const isRefreshing = refreshingRef.current[instanceId] ?? false;
    if (isRefreshing) {
      // Queue another refresh (but don't bump refreshKey yet)
      setQueued((prev) => ({ ...prev, [instanceId]: true }));
      return;
    }

    refreshingRef.current[instanceId] = true;
    setRefreshing((prev) => ({ ...prev, [instanceId]: true }));

    setRefreshKeys((prev) => {
      const nextKey = (prev[instanceId] ?? 0) + 1;
      inFlightKeyRef.current[instanceId] = nextKey;
      return { ...prev, [instanceId]: nextKey };
    });
  }, []);

  const onRefreshed = useCallback(
    (instanceId: string, key: number) => {
      if (inFlightKeyRef.current[instanceId] !== key) return;

      setLastRefreshedAt((prev) => ({ ...prev, [instanceId]: Date.now() }));
      refreshingRef.current[instanceId] = false;
      setRefreshing((prev) => ({ ...prev, [instanceId]: false }));

      // If a refresh was queued while we were busy, run it now.
      const shouldRunAgain = queued[instanceId] ?? false;
      if (shouldRunAgain) {
        setQueued((prev) => ({ ...prev, [instanceId]: false }));
        // Trigger the next refresh in the queue.
        // (This will bump refreshKey only after the current one finished.)
        refresh(instanceId);
      }
    },
    [queued, refresh],
  );

  useEffect(() => {
    if (refreshAllKey === undefined) return;
    for (const w of config.widgets) {
      refresh(w.instanceId);
    }
    // We intentionally refresh only when `refreshAllKey` changes, not on config edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshAllKey]);

  return (
    <div className="space-y-6 compact:space-y-4">
      {config.widgets.map((w) => {
        const widget = widgetRegistry.find((x) => x.id === w.widgetId);
        if (!widget) return null;

        const Component = widget.component;
        const refreshKey = refreshKeys[w.instanceId] ?? 0;
        const title = w.title ?? widget.title;

        const isRefreshing = refreshing[w.instanceId] ?? false;
        const hasQueuedRefresh = queued[w.instanceId] ?? false;
        const last = lastRefreshedAt[w.instanceId];

        return (
          <WidgetFrame
            key={w.instanceId}
            title={title}
            onRefresh={() => refresh(w.instanceId)}
            onRemove={
              onRemoveWidget
                ? () => onRemoveWidget(w.instanceId)
                : undefined
            }
            isRefreshing={isRefreshing}
            hasQueuedRefresh={hasQueuedRefresh}
            lastRefreshedAt={last}
          >
            <Component
              refreshKey={refreshKey}
              onRefreshed={(k) => onRefreshed(w.instanceId, k)}
            />
          </WidgetFrame>
        );
      })}
    </div>
  );
}
