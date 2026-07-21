"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getSession } from "@frontend/lib/session";

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
  const [tasks, setTasks] = useState<Task[] | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setEmail(session.user.email);

    fetch("/api/tasks", {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks));
  }, [router]);

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
        <button
          onClick={handleLogout}
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          Sair
        </button>
      </div>

      <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
        {tasks === null && (
          <p className="py-8 text-sm text-zinc-400">Carregando...</p>
        )}

        {tasks?.length === 0 && (
          <p className="py-8 text-sm text-zinc-400">
            Nenhuma task ainda. Isso chega na próxima aula.
          </p>
        )}

        {tasks?.map((task) => (
          <div key={task.id} className="flex items-center justify-between py-4">
            <span className="text-sm">{task.title}</span>
            <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              {STATUS_LABEL[task.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
