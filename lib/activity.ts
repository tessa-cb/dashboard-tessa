import prisma from "./prisma";
import { events, CHANNELS } from "./events";

export async function logActivity(
  type: string,
  message: string,
  metadata?: unknown,
) {
  try {
    const activity = await prisma.activity.create({
      data: {
        type,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    events.emit(CHANNELS.ACTIVITY, activity);
    return activity;
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
