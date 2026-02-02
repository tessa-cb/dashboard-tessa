import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: { agent: true },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, priority, agentId, status } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "medium",
        status: status || "inbox",
        agentId: agentId || null,
      },
      include: { agent: true },
    });

    await logActivity("task_created", `New task: ${task.title}`, {
      taskId: task.id,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
