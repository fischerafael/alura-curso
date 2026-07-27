"use client";

import { useEffect, useState } from "react";

type DeleteTaskModalProps = {
  token: string;
  task: { id: string; title: string };
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteTaskModal({
  token,
  task,
  onClose,
  onDeleted,
}: DeleteTaskModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleConfirm() {
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Não foi possível remover a task.");
        return;
      }

      onDeleted();
    } catch {
      setError("Não foi possível remover a task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 px-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-zinc-200 bg-background p-6 dark:border-zinc-800"
      >
        <h2 className="text-lg font-semibold tracking-tight">
          Remover task
        </h2>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Tem certeza que deseja remover &quot;{task.title}&quot;? Essa
            ação não pode ser desfeita.
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-full bg-red-600 px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {loading ? "Removendo..." : "Remover"}
          </button>
        </div>
      </div>
    </div>
  );
}
