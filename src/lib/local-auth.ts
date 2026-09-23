export type LocalUser = {
  id: string;
  email: string;
  password: string;
  full_name?: string;
  user_metadata?: {
    full_name?: string;
  };
  app_metadata?: {
    provider?: string;
  };
  provider?: "email" | "demo";
  role?: string;
  verified?: boolean;
  created_at: string;
};

const USERS_KEY = "hushly.local-users";
const SESSION_KEY = "hushly.local-session";
const AUTH_CHANGE_EVENT = "hushly-auth-change";

function readUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as LocalUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: LocalUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getLocalUsers() {
  return readUsers();
}

export function createLocalUserAccount(input: { email: string; password: string; full_name?: string }) {
  if (typeof window === "undefined") {
    return { ok: false, error: "Local storage is not available in this environment." };
  }

  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters long." };
  }

  const users = readUsers();
  if (users.some((user) => user.email === email)) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const user: LocalUser = {
    id: `local-user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    email,
    password,
    app_metadata: {
      provider: "email",
    },
    provider: "email",
    role: "member",
    verified: true,
    created_at: new Date().toISOString(),
  };

  if (input.full_name) {
    user.full_name = input.full_name;
    user.user_metadata = { full_name: input.full_name };
  }

  users.push(user);
  writeUsers(users);
  writeLocalSession(user);
  return { ok: true, user };
}

export function signInLocalUser(input: { email: string; password: string }) {
  if (typeof window === "undefined") {
    return { ok: false, error: "Local storage is not available in this environment." };
  }

  const email = normalizeEmail(input.email);
  const users = readUsers();
  const user = users.find((record) => record.email === email && record.password === input.password);

  if (!user) {
    return { ok: false, error: "That email and password do not match an account." };
  }

  writeLocalSession(user);
  return { ok: true, user };
}

export function writeLocalSession(user: LocalUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      user,
      expires_at: Date.now() + 1000 * 60 * 60 * 24 * 30,
    }),
  );
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getLocalSession(): { user: LocalUser; expires_at: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user?: LocalUser; expires_at?: number };
    if (!parsed.user || !parsed.expires_at) return null;
    if (parsed.expires_at < Date.now()) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isLocalSessionActive() {
  return Boolean(getLocalSession());
}

export function getCurrentLocalUser() {
  const session = getLocalSession();
  return session?.user ?? null;
}

export function signOutLocalSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}
