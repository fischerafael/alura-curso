export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
      Feito com amor por @fischerafael - {year}
    </footer>
  );
}
