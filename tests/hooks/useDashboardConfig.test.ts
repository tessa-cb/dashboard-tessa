import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDashboardConfig } from "@/hooks/useDashboardConfig";
import { DEFAULT_DASHBOARD_CONFIG } from "@/config/dashboard-config";

describe("useDashboardConfig", () => {
  beforeEach(() => {
    window.localStorage.removeItem("dashboard-tessa:config:v1");
  });

  it("hydrates from localStorage", async () => {
    const stored = {
      widgets: [{ instanceId: "x", widgetId: "agenda" }],
    };
    window.localStorage.setItem(
      "dashboard-tessa:config:v1",
      JSON.stringify(stored),
    );

    const { result } = renderHook(() => useDashboardConfig());

    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.config).toEqual(stored);
  });

  it("adds and removes widgets", async () => {
    const { result } = renderHook(() => useDashboardConfig());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.addWidget("todos"));
    expect(result.current.config.widgets.some((w) => w.widgetId === "todos")).toBe(true);

    const toRemove = result.current.config.widgets[0]?.instanceId;
    act(() => result.current.removeWidget(toRemove));
    expect(result.current.config.widgets.some((w) => w.instanceId === toRemove)).toBe(false);
  });

  it("resets to default", async () => {
    const { result } = renderHook(() => useDashboardConfig());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.addWidget("todos"));
    act(() => result.current.resetToDefault());

    expect(result.current.config).toEqual(DEFAULT_DASHBOARD_CONFIG);
  });
});
