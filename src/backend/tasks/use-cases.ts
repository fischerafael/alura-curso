import * as tasksData from "@backend/data/tasks";
import { listTasksSchema, createTaskSchema } from "./schema";
import { toTaskDTO } from "./dto";

export class InvalidStatusError extends Error {}
export class InvalidTitleError extends Error {}
export class TaskNotFoundError extends Error {}

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
