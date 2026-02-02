import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: { agent: true },
    });

    if (!task)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, agentId, priority, title } = body;

    // Get old task for diffing logic if needed, or just update
    const oldTask = await prisma.task.findUnique({ where: { id } });
    if (!oldTask)
      return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const task = await prisma.task.update({
      where: { id },
      data: {
        status,
        agentId,
        priority,
        title,
      },
      include: { agent: true },
    });

    if (status && status !== oldTask.status) {
      await logActivity(
        "task_status",
        `Task "${task.title}" moved to ${status}`,
        { taskId: id, oldStatus: oldTask.status, newStatus: status },
      );
    }

    if (agentId && agentId !== oldTask.agentId) {
      const agent = task.agent;
      await logActivity(
        "task_assigned",
        `Task "${task.title}" assigned to ${agent?.name || "Unknown"}`,
        { taskId: id, agentId },
      );

      // Update agent status if they get a task?
      if (status === "in_progress") {
        await prisma.agent.update({
          where: { id: agentId },
          data: { status: "working" },
        });
        // Emit agent update via activity or separate channel?
        // For now, logActivity emits 'activity' event, but maybe we need specific 'update' events for frontend state sync.
        // Simpler: frontend re-fetches or we emit a generic "data_change" event.
        await logActivity("agent_status", `${agent?.name} is now working`, {
          agentId,
        });
      }
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.task.delete({ where: { id } });
    await logActivity("task_deleted", `Task ${id} deleted`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
