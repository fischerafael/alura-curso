export type Session = { token: string; user: { id: string; email: string } };

const KEY = "session";

export function saveSession(session: Session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
