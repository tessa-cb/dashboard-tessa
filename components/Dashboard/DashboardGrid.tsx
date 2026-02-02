"use client";

import { useCallback, useState } from "react";
import { DashboardConfig } from "@/config/dashboard-config";
import { widgetRegistry } from "@/config/widget-registry";
import WidgetFrame from "@/components/Dashboard/WidgetFrame";

export default function DashboardGrid({ config }: { config: DashboardConfig }) {
  const [refreshKeys, setRefreshKeys] = useState<Record<string, number>>({});

  const refresh = useCallback((instanceId: string) => {
    setRefreshKeys((prev) => ({
      ...prev,
      [instanceId]: (prev[instanceId] ?? 0) + 1,
    }));
  }, []);

  return (
    <div className="space-y-6">
      {config.widgets.map((w) => {
        const widget = widgetRegistry.find((x) => x.id === w.widgetId);
        if (!widget) return null;

        const Component = widget.component;
        const refreshKey = refreshKeys[w.instanceId] ?? 0;
        const title = w.title ?? widget.title;

        return (
          <WidgetFrame
            key={w.instanceId}
            title={title}
            onRefresh={() => refresh(w.instanceId)}
          >
            <Component refreshKey={refreshKey} />
          </WidgetFrame>
        );
      })}
    </div>
  );
}
