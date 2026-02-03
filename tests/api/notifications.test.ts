import { describe, expect, it } from "vitest";
import { GET, PATCH } from "@/app/api/notifications/route";
import prisma from "@/lib/prisma";
import { createAgent, createNotification } from "../helpers/db";
import { jsonRequest } from "../helpers/http";

function withQuery(url: string, params: Record<string, string>) {
  const u = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    u.searchParams.set(key, value);
  }
  return u.toString();
}

describe("api/notifications", () => {
  it("GET filters by agentId and unread", async () => {
    const agent = await createAgent();
    await createNotification({ agentId: agent.id, read: false });
    await createNotification({ agentId: agent.id, read: true });

    const res = await GET(
      new Request(
        withQuery("http://localhost/api/notifications", {
          agentId: agent.id,
          unread: "true",
        }),
      ),
    );

    const data = (await res.json()) as Array<{ read: boolean }>;
    expect(res.status).toBe(200);
    expect(data.length).toBe(1);
    expect(data[0].read).toBe(false);
  });

  it("PATCH validates ids", async () => {
    const res = await PATCH(
      jsonRequest("http://localhost/api/notifications", "PATCH", {}),
    );

    expect(res.status).toBe(400);
  });

  it("PATCH marks notifications read", async () => {
    const agent = await createAgent();
    const notification = await createNotification({ agentId: agent.id, read: false });

    const res = await PATCH(
      jsonRequest("http://localhost/api/notifications", "PATCH", {
        ids: [notification.id],
      }),
    );

    expect(res.status).toBe(200);
    const updated = await prisma.notification.findUnique({
      where: { id: notification.id },
    });
    expect(updated?.read).toBe(true);
  });
});
