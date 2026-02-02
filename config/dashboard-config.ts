export type WidgetId = "mission-control" | "placeholder-one" | "placeholder-two";

export interface DashboardWidgetInstance {
  instanceId: string;
  widgetId: WidgetId;
  title?: string;
  settings?: Record<string, unknown>;
}

export interface DashboardConfig {
  widgets: DashboardWidgetInstance[];
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  widgets: [
    {
      instanceId: "mission-control-1",
      widgetId: "mission-control",
      title: "Mission Control",
    },
  ],
};
