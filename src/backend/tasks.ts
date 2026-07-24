import { TaskStatus } from "@prisma/client";
import { prisma } from "@backend/lib/db";

export class InvalidStatusError extends Error {}

const VALID_STATUSES = Object.values(TaskStatus);

export async function listTasks(userId: string, status?: string) {
  if (status !== undefined && !VALID_STATUSES.includes(status as TaskStatus)) {
    throw new InvalidStatusError("Status inválido");
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      ...(status !== undefined ? { status: status as TaskStatus } : {}),
    },
  });

  return { tasks, count: tasks.length };
}
