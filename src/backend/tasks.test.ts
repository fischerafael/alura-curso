import { describe, expect, it, vi, beforeEach } from "vitest";
import { deleteTask, TaskNotFoundError } from "@backend/tasks";
import { prisma } from "@backend/lib/db";

vi.mock("@backend/lib/db", () => ({
  prisma: {
    task: {
      deleteMany: vi.fn(),
    },
  },
}));

describe("deleteTask", () => {
  beforeEach(() => {
    vi.mocked(prisma.task.deleteMany).mockReset();
  });

  it("resolves without error when the task belongs to the user", async () => {
    vi.mocked(prisma.task.deleteMany).mockResolvedValue({ count: 1 });

    await expect(deleteTask("user-1", "task-1")).resolves.toBeUndefined();
    expect(prisma.task.deleteMany).toHaveBeenCalledWith({
      where: { id: "task-1", userId: "user-1" },
    });
  });

  it("throws TaskNotFoundError when the task does not exist or belongs to another user", async () => {
    vi.mocked(prisma.task.deleteMany).mockResolvedValue({ count: 0 });

    await expect(deleteTask("user-1", "task-1")).rejects.toThrow(
      TaskNotFoundError,
    );
  });
});
