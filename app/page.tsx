"use client";

import DashboardGrid from "@/components/Dashboard/DashboardGrid";
import { DEFAULT_DASHBOARD_CONFIG } from "@/config/dashboard-config";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-4 bg-gray-100 font-sans">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Tessa</h1>
        <p className="text-gray-500">Single-pane personal dashboard</p>
      </header>

      <DashboardGrid config={DEFAULT_DASHBOARD_CONFIG} />
    </main>
  );
}
