import { describe, expect, it } from "vitest";
import prisma from "@/lib/prisma";
import { GET as GET_TASKS, POST as POST_TASK } from "@/app/api/tasks/route";
import {
  GET as GET_TASK,
  PATCH as PATCH_TASK,
  DELETE as DELETE_TASK,
} from "@/app/api/tasks/[id]/route";
import { jsonRequest } from "../helpers/http";
import { createAgent, createTask } from "../helpers/db";

describe("api/tasks", () => {
  it("GET lists tasks", async () => {
    const task = await createTask({ title: "List me" });

    const res = await GET_TASKS();
    const data = (await res.json()) as Array<{ id: string }>;

    expect(res.status).toBe(200);
    expect(data.map((t) => t.id)).toContain(task.id);
  });

  it("POST creates task with defaults and logs activity", async () => {
    const res = await POST_TASK(
      jsonRequest("http://localhost/api/tasks", "POST", { title: "New" }),
    );
    const task = (await res.json()) as { id: string; status: string; priority: string };

    expect(res.status).toBe(200);
    expect(task.status).toBe("inbox");
    expect(task.priority).toBe("medium");

    const activity = await prisma.activity.findFirst({
      where: { type: "task_created" },
    });
    expect(activity).toBeTruthy();
  });

  it("GET by id returns 404 when missing", async () => {
    const res = await GET_TASK(
      new Request("http://localhost/api/tasks/missing"),
      { params: Promise.resolve({ id: "missing" }) },
    );

    expect(res.status).toBe(404);
  });

  it("PATCH updates status, assigns agent, and logs activity", async () => {
    const agent = await createAgent({ name: "Coder" });
    const task = await createTask({ title: "Patch me" });

    const res = await PATCH_TASK(
      jsonRequest(`http://localhost/api/tasks/${task.id}`, "PATCH", {
        status: "in_progress",
        agentId: agent.id,
      }),
      { params: Promise.resolve({ id: task.id }) },
    );

    expect(res.status).toBe(200);

    const updated = await prisma.task.findUnique({ where: { id: task.id } });
    expect(updated?.status).toBe("in_progress");
    expect(updated?.agentId).toBe(agent.id);

    const statusLog = await prisma.activity.findFirst({
      where: { type: "task_status" },
    });
    const assignedLog = await prisma.activity.findFirst({
      where: { type: "task_assigned" },
    });
    const agentLog = await prisma.activity.findFirst({
      where: { type: "agent_status" },
    });

    expect(statusLog).toBeTruthy();
    expect(assignedLog).toBeTruthy();
    expect(agentLog).toBeTruthy();

    const updatedAgent = await prisma.agent.findUnique({
      where: { id: agent.id },
    });
    expect(updatedAgent?.status).toBe("working");
  });

  it("DELETE removes task and logs activity", async () => {
    const task = await createTask();

    const res = await DELETE_TASK(
      new Request(`http://localhost/api/tasks/${task.id}`, { method: "DELETE" }),
      { params: Promise.resolve({ id: task.id }) },
    );

    expect(res.status).toBe(200);

    const deleted = await prisma.task.findUnique({ where: { id: task.id } });
    expect(deleted).toBeNull();

    const activity = await prisma.activity.findFirst({
      where: { type: "task_deleted" },
    });
    expect(activity).toBeTruthy();
  });
});
