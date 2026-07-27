"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getSession } from "@frontend/lib/session";
import { AddTaskModal } from "@frontend/components/AddTaskModal";
import { DeleteTaskModal } from "@frontend/components/DeleteTaskModal";

type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
};

const STATUS_LABEL: Record<Task["status"], string> = {
  TODO: "A fazer",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluída",
};

export function DashboardView() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadTasks = useCallback((authToken: string) => {
    fetch("/api/tasks", {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setLoadError(null);
        setTasks(data.tasks);
      })
      .catch(() => setLoadError("Não foi possível atualizar a lista de tasks."));
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    fetch("/api/tasks", {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setEmail(session.user.email);
        setToken(session.token);
        setTasks(data.tasks);
      });
  }, [router]);

  function handleTaskCreated() {
    if (token) loadTasks(token);
    setIsModalOpen(false);
  }

  function handleTaskDeleted() {
    if (token) loadTasks(token);
    setTaskToDelete(null);
  }

  function handleLogout() {
    clearSession();
    fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (!email) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Suas tasks
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{email}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
          >
            Nova task
          </button>
          <button
            onClick={handleLogout}
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Sair
          </button>
        </div>
      </div>

      {loadError && <p className="text-sm text-red-500">{loadError}</p>}

      <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
        {tasks === null && (
          <p className="py-8 text-sm text-zinc-400">Carregando...</p>
        )}

        {tasks?.length === 0 && (
          <p className="py-8 text-sm text-zinc-400">Nenhuma task ainda.</p>
        )}

        {tasks?.map((task) => (
          <div key={task.id} className="flex items-center justify-between py-4">
            <span className="text-sm">{task.title}</span>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                {STATUS_LABEL[task.status]}
              </span>
              <button
                onClick={() => setTaskToDelete(task)}
                aria-label={`Remover task ${task.title}`}
                className="text-xs font-medium text-red-500 transition-opacity hover:opacity-70"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && token && (
        <AddTaskModal
          token={token}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {taskToDelete && token && (
        <DeleteTaskModal
          token={token}
          task={taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}
