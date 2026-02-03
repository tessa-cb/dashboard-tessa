import { describe, expect, it, vi } from "vitest";
import prisma from "@/lib/prisma";
import { GET, POST } from "@/app/api/tasks/[id]/comments/route";
import { events, CHANNELS } from "@/lib/events";
import { createAgent, createTask } from "../helpers/db";
import { jsonRequest } from "../helpers/http";

describe("api/tasks/[id]/comments", () => {
  it("GET returns comments in ascending order", async () => {
    const task = await createTask();
    await prisma.comment.create({
      data: { taskId: task.id, content: "First" },
    });
    await prisma.comment.create({
      data: { taskId: task.id, content: "Second" },
    });

    const res = await GET(
      new Request(`http://localhost/api/tasks/${task.id}/comments`),
      { params: Promise.resolve({ id: task.id }) },
    );

    const comments = (await res.json()) as Array<{ content: string }>;
    expect(res.status).toBe(200);
    expect(comments[0].content).toBe("First");
    expect(comments[1].content).toBe("Second");
  });

  it("POST validates content", async () => {
    const task = await createTask();

    const res = await POST(
      jsonRequest(`http://localhost/api/tasks/${task.id}/comments`, "POST", {
        content: "",
      }),
      { params: Promise.resolve({ id: task.id }) },
    );

    expect(res.status).toBe(400);
  });

  it("POST creates comment and notifications for mentions", async () => {
    const task = await createTask();
    const agent = await createAgent({ name: "Alice" });

    const emitSpy = vi.spyOn(events, "emit");

    const res = await POST(
      jsonRequest(`http://localhost/api/tasks/${task.id}/comments`, "POST", {
        content: "Ping @Alice",
      }),
      { params: Promise.resolve({ id: task.id }) },
    );

    const comment = (await res.json()) as { id: string };
    expect(res.status).toBe(200);
    expect(comment.id).toBeTruthy();

    const notifications = await prisma.notification.findMany({
      where: { agentId: agent.id },
    });
    expect(notifications.length).toBe(1);

    expect(emitSpy).toHaveBeenCalledWith(
      CHANNELS.COMMENT,
      expect.objectContaining({ type: "comment_created" }),
    );
    expect(emitSpy).toHaveBeenCalledWith(
      CHANNELS.NOTIFICATION,
      expect.objectContaining({ type: "notification_created" }),
    );
  });
});
