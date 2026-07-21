import Link from "next/link";

export function LandingHero() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="flex max-w-xl flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Organize suas tasks.
          <br />
          Sem ruído.
        </h1>
        <p className="max-w-md text-lg text-zinc-500 dark:text-zinc-400">
          Um jeito simples de acompanhar o que precisa ser feito, o que está
          em andamento e o que já terminou.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}
