import { TaskStatus } from "@prisma/client";
import { prisma } from "@backend/lib/db";

export function findTasksByUser(userId: string, status?: TaskStatus) {
  return prisma.task.findMany({
    where: {
      userId,
      ...(status !== undefined ? { status } : {}),
    },
  });
}

export function createTask(userId: string, title: string) {
  return prisma.task.create({
    data: { title, userId },
  });
}

export async function deleteTaskByIdAndUser(userId: string, taskId: string) {
  const result = await prisma.task.deleteMany({
    where: { id: taskId, userId },
  });

  return result.count > 0;
}
