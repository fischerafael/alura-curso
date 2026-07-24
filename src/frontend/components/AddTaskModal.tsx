"use client";

import { useEffect, useState } from "react";

type AddTaskModalProps = {
  token: string;
  onClose: () => void;
  onCreated: () => void;
};

export function AddTaskModal({ token, onClose, onCreated }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Não foi possível criar a task.");
        return;
      }

      onCreated();
    } catch {
      setError("Não foi possível criar a task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 px-6"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-zinc-200 bg-background p-6 dark:border-zinc-800"
      >
        <h2 className="text-lg font-semibold tracking-tight">Nova task</h2>

        <div className="flex flex-col gap-2">
          <input
            type="text"
            required
            autoFocus
            maxLength={200}
            placeholder="Título da task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground dark:border-zinc-800"
          />
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
            type="submit"
            disabled={loading}
            className="rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {loading ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </form>
    </div>
  );
}
