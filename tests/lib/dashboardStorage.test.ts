// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from "vitest";
import {
  clearDashboardConfig,
  loadDashboardConfig,
  saveDashboardConfig,
} from "@/lib/dashboardStorage";
import { DEFAULT_DASHBOARD_CONFIG } from "@/config/dashboard-config";

describe("dashboardStorage", () => {
  beforeEach(() => {
    window.localStorage.removeItem("dashboard-tessa:config:v1");
  });

  it("saves and loads config", () => {
    saveDashboardConfig(DEFAULT_DASHBOARD_CONFIG);
    const loaded = loadDashboardConfig();
    expect(loaded).toEqual(DEFAULT_DASHBOARD_CONFIG);
  });

  it("clears config", () => {
    saveDashboardConfig(DEFAULT_DASHBOARD_CONFIG);
    clearDashboardConfig();
    const loaded = loadDashboardConfig();
    expect(loaded).toBeNull();
  });
});
