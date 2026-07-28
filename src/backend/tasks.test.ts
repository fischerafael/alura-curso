import { describe, expect, it, vi, beforeEach } from "vitest";
import { deleteTask, TaskNotFoundError } from "@backend/tasks";
import * as tasksData from "@backend/data/tasks";

vi.mock("@backend/data/tasks", () => ({
  deleteTaskByIdAndUser: vi.fn(),
}));

describe("deleteTask", () => {
  beforeEach(() => {
    vi.mocked(tasksData.deleteTaskByIdAndUser).mockReset();
  });

  it("resolves without error when the task belongs to the user", async () => {
    vi.mocked(tasksData.deleteTaskByIdAndUser).mockResolvedValue(true);

    await expect(deleteTask("user-1", "task-1")).resolves.toBeUndefined();
    expect(tasksData.deleteTaskByIdAndUser).toHaveBeenCalledWith(
      "user-1",
      "task-1",
    );
  });

  it("throws TaskNotFoundError when the task does not exist or belongs to another user", async () => {
    vi.mocked(tasksData.deleteTaskByIdAndUser).mockResolvedValue(false);

    await expect(deleteTask("user-1", "task-1")).rejects.toThrow(
      TaskNotFoundError,
    );
  });
});
