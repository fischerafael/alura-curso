import { TaskStatus } from "@prisma/client";
import { z } from "zod";

export const MAX_TITLE_LENGTH = 200;

export const listTasksSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
});

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(MAX_TITLE_LENGTH),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});
