import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sessionKey } = body;

    const agent = await prisma.agent.update({
      where: { id },
      data: { sessionKey },
    });

    return NextResponse.json(agent);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 },
    );
  }
}
