import type { Task, TaskStatus } from "@frontend/services/tasks.service";
import { TaskStatusSelect } from "@frontend/components/TaskStatusSelect";

type TaskListProps = {
  tasks: Task[];
  updatingTaskId: string | null;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDeleteRequest: (task: Task) => void;
};

export function TaskList({
  tasks,
  updatingTaskId,
  onStatusChange,
  onDeleteRequest,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="py-8 text-sm text-zinc-400">Nenhuma task ainda.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between py-4">
          <span className="text-sm">{task.title}</span>
          <div className="flex items-center gap-3">
            <TaskStatusSelect
              status={task.status}
              taskTitle={task.title}
              isUpdating={updatingTaskId === task.id}
              onChange={(status) => onStatusChange(task.id, status)}
            />
            <button
              onClick={() => onDeleteRequest(task)}
              disabled={updatingTaskId === task.id}
              aria-label={`Remover task ${task.title}`}
              className="text-xs font-medium text-red-500 transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
