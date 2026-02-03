import { describe, expect, it, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useMissionControl } from "@/hooks/useMissionControl";

class MockEventSource {
  static instances: MockEventSource[] = [];

  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;

  url: string;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  emitOpen() {
    this.onopen?.();
  }

  emitMessage(data: unknown) {
    const event = { data: JSON.stringify(data) } as MessageEvent;
    this.onmessage?.(event);
  }

  emitError() {
    this.onerror?.();
  }

  close() {}
}

describe("useMissionControl", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    globalThis.EventSource = MockEventSource as unknown as typeof EventSource;

    const fetchMock = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const url = input.toString();
      const method = init?.method ?? "GET";

      if (url.includes("/api/agents") && method === "GET") {
        return { json: async () => [{ id: "a1", name: "Agent" }] } as Response;
      }
      if (url.includes("/api/tasks") && method === "GET") {
        return {
          json: async () => [
            { id: "t1", title: "Task", status: "inbox", priority: "medium" },
          ],
        } as Response;
      }
      return { json: async () => ({ ok: true }) } as Response;
    });

    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it("fetches agents and tasks and connects to stream", async () => {
    const { result } = renderHook(() => useMissionControl());

    await waitFor(() => expect(result.current.tasks.length).toBe(1));
    await waitFor(() => expect(result.current.agents.length).toBe(1));

    const instance = MockEventSource.instances[0];
    expect(instance).toBeTruthy();

    act(() => instance.emitOpen());
    expect(result.current.connected).toBe(true);
  });

  it("handles SSE messages and updates activity", async () => {
    let now = 1000;
    vi.spyOn(Date, "now").mockImplementation(() => now);

    const { result } = renderHook(() => useMissionControl());
    await waitFor(() => expect(result.current.tasks.length).toBe(1));

    const instance = MockEventSource.instances[0];
    now += 2000;

    act(() => instance.emitMessage({ id: "evt1", type: "activity" }));

    await waitFor(() => expect(result.current.activities.length).toBe(1));
    expect(result.current.lastEvent).toEqual({ id: "evt1", type: "activity" });
  });

  it("moveTask updates local state", async () => {
    const { result } = renderHook(() => useMissionControl());
    await waitFor(() => expect(result.current.tasks.length).toBe(1));

    await act(async () => {
      await result.current.moveTask("t1", "done");
    });

    expect(result.current.tasks[0].status).toBe("done");
  });

  it("assignTask and createTask call API", async () => {
    const { result } = renderHook(() => useMissionControl());
    await waitFor(() => expect(result.current.tasks.length).toBe(1));

    await act(async () => {
      await result.current.assignTask("t1", "a1");
      await result.current.createTask("New Task");
    });

    const fetchCalls = (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls;
    const urls = fetchCalls.map((c: [RequestInfo]) => c[0].toString());

    expect(urls.some((u) => u.includes("/api/tasks/t1"))).toBe(true);
    expect(urls.some((u) => u.includes("/api/tasks"))).toBe(true);
  });
});
