import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function GET() {
  const agents = await prisma.agent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: true,
      _count: {
        select: { notifications: { where: { read: false } } },
      },
    },
  });
  return NextResponse.json(agents);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, avatar } = body;

    const agent = await prisma.agent.create({
      data: {
        name,
        role: role || "Generalist",
        status: "idle",
        avatar,
      },
    });

    await logActivity(
      "agent_created",
      `Agent ${agent.name} joined as ${agent.role}`,
      { agentId: agent.id },
    );

    return NextResponse.json(agent);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 },
    );
  }
}
