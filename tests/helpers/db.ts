import prisma from "@/lib/prisma";

export async function resetDb() {
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.agent.deleteMany();
}

export async function createAgent(data?: {
  name?: string;
  role?: string;
  status?: string;
  sessionKey?: string | null;
}) {
  return prisma.agent.create({
    data: {
      name: data?.name ?? "Agent One",
      role: data?.role ?? "Generalist",
      status: data?.status ?? "idle",
      sessionKey: data?.sessionKey ?? null,
    },
  });
}

export async function createTask(data?: {
  title?: string;
  status?: string;
  priority?: string;
  agentId?: string | null;
}) {
  return prisma.task.create({
    data: {
      title: data?.title ?? "Test Task",
      status: data?.status ?? "inbox",
      priority: data?.priority ?? "medium",
      agentId: data?.agentId ?? null,
    },
  });
}

export async function createComment(data: {
  taskId: string;
  agentId?: string | null;
  content?: string;
}) {
  return prisma.comment.create({
    data: {
      taskId: data.taskId,
      agentId: data.agentId ?? null,
      content: data.content ?? "Hello",
    },
  });
}

export async function createNotification(data: {
  agentId: string;
  taskId?: string | null;
  read?: boolean;
}) {
  return prisma.notification.create({
    data: {
      type: "mention",
      message: "You were mentioned",
      agentId: data.agentId,
      taskId: data.taskId ?? null,
      read: data.read ?? false,
    },
  });
}
