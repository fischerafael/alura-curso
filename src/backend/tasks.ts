import { TaskStatus } from "@prisma/client";
import { z } from "zod";
import * as tasksData from "@backend/data/tasks";

export class InvalidStatusError extends Error {}
export class InvalidTitleError extends Error {}
export class TaskNotFoundError extends Error {}

const MAX_TITLE_LENGTH = 200;

const listTasksSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
});

const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(MAX_TITLE_LENGTH),
});

export interface TaskDTO {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

function toTaskDTO(task: {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}): TaskDTO {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export async function listTasks(userId: string, status?: string) {
  const parsed = listTasksSchema.safeParse({ status });

  if (!parsed.success) {
    throw new InvalidStatusError("Status inválido");
  }

  const tasks = await tasksData.findTasksByUser(userId, parsed.data.status);
  const dtos = tasks.map(toTaskDTO);

  return { tasks: dtos, count: dtos.length };
}

export async function createTask(userId: string, title: string) {
  const parsed = createTaskSchema.safeParse({ title });

  if (!parsed.success) {
    throw new InvalidTitleError(
      title?.trim() ? "Título muito longo" : "Título é obrigatório",
    );
  }

  const task = await tasksData.createTask(userId, parsed.data.title);
  return toTaskDTO(task);
}

export async function deleteTask(userId: string, taskId: string) {
  const deleted = await tasksData.deleteTaskByIdAndUser(userId, taskId);

  if (!deleted) {
    throw new TaskNotFoundError("Task não encontrada");
  }
}
