import { describe, expect, it, vi } from "vitest";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { events, CHANNELS } from "@/lib/events";

describe("logActivity", () => {
  it("creates activity and emits event", async () => {
    const emitSpy = vi.spyOn(events, "emit");

    const activity = await logActivity("log", "Test", { foo: "bar" });

    expect(activity).toBeTruthy();
    expect(activity?.type).toBe("log");

    const db = await prisma.activity.findUnique({
      where: { id: activity?.id ?? "" },
    });
    expect(db).toBeTruthy();

    expect(emitSpy).toHaveBeenCalledWith(
      CHANNELS.ACTIVITY,
      expect.objectContaining({ id: activity?.id }),
    );
  });
});
