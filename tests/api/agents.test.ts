import { describe, expect, it } from "vitest";
import prisma from "@/lib/prisma";
import { GET, POST } from "@/app/api/agents/route";
import { jsonRequest } from "../helpers/http";
import { createAgent, createNotification } from "../helpers/db";

describe("api/agents", () => {
  it("GET returns agents with unread notification counts", async () => {
    const agent = await createAgent({ name: "Alpha" });
    await createNotification({ agentId: agent.id, read: false });

    const res = await GET();
    const data = (await res.json()) as Array<{ id: string; _count?: { notifications: number } }>;

    expect(res.status).toBe(200);
    expect(data.length).toBe(1);
    expect(data[0].id).toBe(agent.id);
    expect(data[0]._count?.notifications).toBe(1);
  });

  it("POST creates agent and logs activity", async () => {
    const res = await POST(
      jsonRequest("http://localhost/api/agents", "POST", {
        name: "Tessa",
      }),
    );

    const agent = (await res.json()) as { id: string; name: string; role: string; status: string };

    expect(res.status).toBe(200);
    expect(agent.name).toBe("Tessa");
    expect(agent.role).toBe("Generalist");
    expect(agent.status).toBe("idle");

    const activity = await prisma.activity.findFirst({
      where: { type: "agent_created" },
    });
    expect(activity).toBeTruthy();
  });
});
