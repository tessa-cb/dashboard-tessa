import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  const unreadOnly = searchParams.get("unread") === "true";

  try {
    const whereClause: any = {};
    if (agentId) whereClause.agentId = agentId;
    if (unreadOnly) whereClause.read = false;

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body; // Array of IDs to mark read

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: "ids array required" },
        { status: 400 },
      );
    }

    await prisma.notification.updateMany({
      where: { id: { in: ids } },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 },
    );
  }
}
