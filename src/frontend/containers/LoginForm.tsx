"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@frontend/lib/session";
import { login } from "@frontend/services/auth.service";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await login(email);
      saveSession(session);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-6"
      >
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Só com o seu email, sem senha.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="email"
            required
            autoFocus
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground dark:border-zinc-800"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
