import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { events, CHANNELS } from "@/lib/events";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: id },
      include: { agent: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { content, agentId } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: id,
        agentId: agentId || null,
      },
      include: { agent: true },
    });

    // Emit comment event
    events.emit(CHANNELS.COMMENT, {
      type: "comment_created",
      taskId: id,
      comment,
    });

    // Handle Mentions: @Name
    // Simple regex for @Name. Note: Names might have spaces, but let's assume simple names for MVP or handle it on UI side to send canonical names.
    // The prompt says "inserting @AgentName into text".
    // I'll look for @Word
    const mentionRegex = /@(\w+)/g;
    const matches = [...content.matchAll(mentionRegex)];

    if (matches.length > 0) {
      const mentionedNames = [...new Set(matches.map((m) => m[1]))]; // Unique names

      const agents = await prisma.agent.findMany({
        where: {
          name: { in: mentionedNames },
        },
      });

      for (const agent of agents) {
        // Create notification
        const notification = await prisma.notification.create({
          data: {
            type: "mention",
            message: `You were mentioned in task comment`,
            agentId: agent.id,
            taskId: id,
          },
        });

        events.emit(CHANNELS.NOTIFICATION, {
          type: "notification_created",
          agentId: agent.id,
          notification,
        });
      }
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
