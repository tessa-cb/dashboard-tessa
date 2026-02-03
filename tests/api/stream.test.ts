import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/stream/route";

function decodeChunk(value: Uint8Array | undefined) {
  if (!value) return "";
  return new TextDecoder().decode(value);
}

describe("api/stream", () => {
  it("GET returns SSE response with connected message", async () => {
    const controller = new AbortController();
    const res = await GET(
      new Request("http://localhost/api/stream", { signal: controller.signal }),
    );

    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(res.headers.get("Cache-Control")).toContain("no-cache");

    const reader = res.body?.getReader();
    const first = await reader?.read();
    const text = decodeChunk(first?.value);

    expect(text).toContain("\"type\":\"connected\"");

    controller.abort();
    await reader?.cancel();
  });
});
