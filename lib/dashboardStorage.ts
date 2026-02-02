import { DashboardConfig } from "@/config/dashboard-config";

const STORAGE_KEY = "dashboard-tessa:config:v1";

export function loadDashboardConfig(): DashboardConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DashboardConfig;
    if (!parsed || !Array.isArray(parsed.widgets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDashboardConfig(config: DashboardConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearDashboardConfig(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
