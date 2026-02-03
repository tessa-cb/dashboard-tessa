import { describe, expect, it } from "vitest";
import prisma from "@/lib/prisma";
import { POST } from "@/app/api/seed/route";

describe("api/seed", () => {
  it("POST seeds database", async () => {
    const res = await POST();
    expect(res.status).toBe(200);

    const agentCount = await prisma.agent.count();
    const taskCount = await prisma.task.count();
    const activity = await prisma.activity.findFirst({
      where: { type: "system" },
    });

    expect(agentCount).toBeGreaterThan(0);
    expect(taskCount).toBeGreaterThan(0);
    expect(activity).toBeTruthy();
  });
});
