"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DashboardConfig,
  DashboardWidgetInstance,
  DEFAULT_DASHBOARD_CONFIG,
  WidgetId,
} from "@/config/dashboard-config";
import {
  clearDashboardConfig,
  loadDashboardConfig,
  saveDashboardConfig,
} from "@/lib/dashboardStorage";

function makeInstanceId(widgetId: WidgetId) {
  return `${widgetId}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>(DEFAULT_DASHBOARD_CONFIG);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted config on mount
  useEffect(() => {
    const stored = loadDashboardConfig();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfig(stored);
    }
    setHydrated(true);
  }, []);

  // Persist on changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveDashboardConfig(config);
  }, [config, hydrated]);

  const addWidget = useCallback((widgetId: WidgetId) => {
    const inst: DashboardWidgetInstance = {
      instanceId: makeInstanceId(widgetId),
      widgetId,
    };
    setConfig((prev) => ({ ...prev, widgets: [...prev.widgets, inst] }));
  }, []);

  const removeWidget = useCallback((instanceId: string) => {
    setConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.instanceId !== instanceId),
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    clearDashboardConfig();
    setConfig(DEFAULT_DASHBOARD_CONFIG);
  }, []);

  const widgetIds = useMemo<WidgetId[]>(
    () => [
      "mission-control",
      "agenda",
      "focus-timer",
      "todos",
      "placeholder-one",
      "placeholder-two",
    ],
    [],
  );

  return {
    config,
    setConfig,
    hydrated,
    addWidget,
    removeWidget,
    resetToDefault,
    widgetIds,
  };
}
