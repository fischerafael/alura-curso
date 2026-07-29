import { http } from "@frontend/services/http";
import type { Session } from "@frontend/lib/session";

export function login(email: string) {
  return http.post<Session>("/api/auth/login", { email });
}

export function logout() {
  return http.post<{ ok: boolean }>("/api/auth/logout");
}
