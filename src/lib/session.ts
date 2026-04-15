import type { PlayerSession } from "@/types/game";

const KEY = "kahutam_session";

export function saveSession(session: PlayerSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function loadSession(): PlayerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PlayerSession) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
