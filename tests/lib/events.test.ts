import { describe, expect, it } from "vitest";
import { events, CHANNELS } from "@/lib/events";

describe("events", () => {
  it("exports shared event emitter and channels", () => {
    expect(events).toBeTruthy();
    expect(CHANNELS.ACTIVITY).toBe("activity");
    expect(CHANNELS.COMMENT).toBe("comment");
    expect(CHANNELS.NOTIFICATION).toBe("notification");
  });
});
