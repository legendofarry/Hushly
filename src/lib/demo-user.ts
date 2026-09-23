export const DEMO_ACCOUNT = {
  email: "demo@hushly.app",
  password: "Demo123!",
  id: "demo-user-verified-active",
  displayName: "Demo Verified",
  role: "escort",
  verified: true,
};

const DEMO_SESSION_KEY = "hushly.demo-session";
export const AUTH_CHANGE_EVENT = "hushly-auth-change";

export function signInDemoSession() {
  if (typeof window === "undefined") return false;

  const session = {
    user: {
      id: DEMO_ACCOUNT.id,
      email: DEMO_ACCOUNT.email,
      app_metadata: { provider: "demo" },
      user_metadata: {
        full_name: DEMO_ACCOUNT.displayName,
      },
    },
    expires_at: Date.now() + 1000 * 60 * 60 * 24 * 30,
  };

  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  return true;
}

export function getDemoSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { user: parsed.user, expires_at: parsed.expires_at };
  } catch {
    return null;
  }
}

export function isDemoSessionActive() {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Number(parsed.expires_at) > Date.now();
  } catch {
    return false;
  }
}

export function signOutDemoSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}
