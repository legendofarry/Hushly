const KEY = "hushly.emails";
const MAX = 5;

export function rememberEmail(email: string) {
  if (typeof window === "undefined") return;
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes("@")) return;
  const list = getRememberedEmails().filter((e) => e !== clean);
  list.unshift(clean);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* storage unavailable */
  }
}

export function getRememberedEmails(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed.filter((e) => typeof e === "string") as string[]) : [];
  } catch {
    return [];
  }
}

export function forgetEmail(email: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify(getRememberedEmails().filter((e) => e !== email)),
    );
  } catch {
    /* storage unavailable */
  }
}
