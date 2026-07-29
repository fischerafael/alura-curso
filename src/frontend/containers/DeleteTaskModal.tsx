"use client";

import { useState } from "react";
import { deleteTask } from "@frontend/services/tasks.service";
import { Modal } from "@frontend/components/Modal";

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

  async function handleConfirm() {
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      await deleteTask(token, task.id);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível remover a task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex w-full flex-col gap-6 rounded-2xl border border-zinc-200 bg-background p-6 dark:border-zinc-800">
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
    </Modal>
  );
}
