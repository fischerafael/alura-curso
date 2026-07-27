import { TaskStatus } from "@prisma/client";
import { prisma } from "@backend/lib/db";

export class InvalidStatusError extends Error {}
export class InvalidTitleError extends Error {}
export class TaskNotFoundError extends Error {}

const VALID_STATUSES = Object.values(TaskStatus);
const MAX_TITLE_LENGTH = 200;

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

export async function createTask(userId: string, title: string) {
  const trimmedTitle = title?.trim();

  if (!trimmedTitle) {
    throw new InvalidTitleError("Título é obrigatório");
  }

  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    throw new InvalidTitleError("Título muito longo");
  }

  return prisma.task.create({
    data: { title: trimmedTitle, userId },
  });
}

export async function deleteTask(userId: string, taskId: string) {
  const result = await prisma.task.deleteMany({
    where: { id: taskId, userId },
  });

  if (result.count === 0) {
    throw new TaskNotFoundError("Task não encontrada");
  }
}
