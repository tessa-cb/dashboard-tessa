"use client";

import { DashboardConfig } from "@/config/dashboard-config";
import { widgetRegistry } from "@/config/widget-registry";

export default function DashboardGrid({ config }: { config: DashboardConfig }) {
  return (
    <div className="space-y-6">
      {config.widgets.map((w) => {
        const widget = widgetRegistry.find((x) => x.id === w.widgetId);
        if (!widget) return null;

        const Component = widget.component;
        return (
          <div key={w.instanceId}>
            <Component />
          </div>
        );
      })}
    </div>
  );
}
