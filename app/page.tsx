"use client";

import { useState } from "react";
import DashboardGrid from "@/components/Dashboard/DashboardGrid";
import ShortcutsModal from "@/components/Dashboard/ShortcutsModal";
import { WidgetId } from "@/config/dashboard-config";
import { widgetRegistry } from "@/config/widget-registry";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { useDashboardShortcuts } from "@/hooks/useDashboardShortcuts";
import { useUiPreferences } from "@/hooks/useUiPreferences";

export default function DashboardPage() {
  const { config, addWidget, removeWidget, resetToDefault } =
    useDashboardConfig();

  const [newWidgetId, setNewWidgetId] = useState<WidgetId>("placeholder-one");
  const [refreshAllKey, setRefreshAllKey] = useState(0);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const { themeLabel, cycleTheme, densityLabel, toggleDensity } =
    useUiPreferences();

  useDashboardShortcuts({
    onRefreshAll: () => setRefreshAllKey((k) => k + 1),
    onCycleTheme: cycleTheme,
    onToggleDensity: toggleDensity,
    onToggleHelp: () => setShortcutsOpen((v) => !v),
  });

  return (
    <main className="min-h-screen p-4 compact:p-3 font-sans text-foreground">
      <header className="mb-6 compact:mb-4 rounded-2xl border border-border bg-surface/80 p-4 backdrop-blur-sm compact:p-3">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-foreground compact:text-2xl">
              Dashboard Tessa
            </h1>
            <p className="text-sm text-muted-foreground">
              Single-pane personal dashboard
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setRefreshAllKey((k) => k + 1)}
              className="text-sm rounded-md border border-border bg-surface-2 px-3 py-1.5 text-foreground hover:bg-muted compact:px-2 compact:py-1"
              title="Refresh all widgets (R)"
            >
              Refresh all
            </button>
            <button
              onClick={cycleTheme}
              className="text-sm rounded-md border border-border bg-surface-2 px-3 py-1.5 text-foreground hover:bg-muted compact:px-2 compact:py-1"
              title="Cycle theme (D)"
            >
              Theme: <span className="font-semibold">{themeLabel}</span>
            </button>
            <button
              onClick={toggleDensity}
              className="text-sm rounded-md border border-border bg-surface-2 px-3 py-1.5 text-foreground hover:bg-muted compact:px-2 compact:py-1"
              title="Toggle compact mode (C)"
            >
              Density: <span className="font-semibold">{densityLabel}</span>
            </button>
            <button
              onClick={() => setShortcutsOpen(true)}
              className="text-sm rounded-md border border-border bg-surface-2 px-3 py-1.5 text-foreground hover:bg-muted compact:px-2 compact:py-1"
              title="Keyboard shortcuts (?)"
            >
              ?
            </button>

            <div className="mx-1 h-6 w-px bg-border/80" />

            <select
              className="text-sm border border-border rounded-md px-2 py-1.5 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 compact:py-1"
              value={newWidgetId}
              onChange={(e) => setNewWidgetId(e.target.value as WidgetId)}
              title="Choose a widget to add"
            >
              {widgetRegistry.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => addWidget(newWidgetId)}
              className="text-sm rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:brightness-110 compact:px-2 compact:py-1"
            >
              Add widget
            </button>
            <button
              onClick={resetToDefault}
              className="text-sm rounded-md border border-border bg-surface px-3 py-1.5 text-foreground hover:bg-muted compact:px-2 compact:py-1"
              title="Reset dashboard to default layout"
            >
              Reset layout
            </button>
          </div>
        </div>
      </header>

      <DashboardGrid
        config={config}
        onRemoveWidget={removeWidget}
        refreshAllKey={refreshAllKey}
      />

      <ShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </main>
  );
}
