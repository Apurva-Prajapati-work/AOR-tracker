const KEY = "aortrack_session_email";

export function readSessionEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(KEY);
}

export function writeSessionEmail(email: string): void {
  sessionStorage.setItem(KEY, email.trim().toLowerCase());
}

export function clearSessionEmail(): void {
  sessionStorage.removeItem(KEY);
}
