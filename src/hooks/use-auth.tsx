import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AUTH_CHANGE_EVENT,
  DEMO_ACCOUNT,
  getDemoSession,
  isDemoSessionActive,
  signOutDemoSession,
} from "@/lib/demo-user";
import {
  getCurrentLocalUser,
  getLocalSession,
  signOutLocalSession,
} from "@/lib/local-auth";

type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
  app_metadata?: {
    provider?: string;
  };
};

type AuthContextValue = {
  session: { user: AuthUser } | null;
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: AuthUser } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncSession = () => {
      if (isDemoSessionActive()) {
        setSession(getDemoSession());
        setLoading(false);
        return;
      }

      const localSession = getLocalSession();
      setSession(localSession ? { user: localSession.user } : null);
      setLoading(false);
    };

    syncSession();
    window.addEventListener(AUTH_CHANGE_EVENT, syncSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? getCurrentLocalUser() ?? null,
      loading,
      signOut: async () => {
        if (isDemoSessionActive()) {
          signOutDemoSession();
          setSession(null);
          return;
        }
        signOutLocalSession();
        setSession(null);
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export { DEMO_ACCOUNT };
