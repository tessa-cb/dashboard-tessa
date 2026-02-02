"use client";

import { useState } from "react";
import DashboardGrid from "@/components/Dashboard/DashboardGrid";
import { WidgetId } from "@/config/dashboard-config";
import { widgetRegistry } from "@/config/widget-registry";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";

export default function DashboardPage() {
  const { config, addWidget, removeWidget, resetToDefault } =
    useDashboardConfig();

  const [newWidgetId, setNewWidgetId] = useState<WidgetId>("placeholder-one");

  return (
    <main className="min-h-screen p-4 bg-gray-100 font-sans">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Tessa</h1>
          <p className="text-gray-500">Single-pane personal dashboard</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="text-sm border rounded px-2 py-1 bg-white"
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
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-500"
          >
            Add widget
          </button>
          <button
            onClick={resetToDefault}
            className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
            title="Reset dashboard to default layout"
          >
            Reset layout
          </button>
        </div>
      </header>

      <DashboardGrid config={config} onRemoveWidget={removeWidget} />
    </main>
  );
}
