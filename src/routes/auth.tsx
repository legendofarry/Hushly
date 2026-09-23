import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EmailField, PasswordField } from "@/components/vibe/fields";
import { rememberEmail } from "@/lib/email-memory";
import { trackEvent } from "@/lib/analytics";
import { DEMO_ACCOUNT, signInDemoSession } from "@/lib/demo-user";
import { createLocalUserAccount, signInLocalUser } from "@/lib/local-auth";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Join Hushly — create your account" },
      {
        name: "description",
        content: "Create your free Hushly account or sign in to message members and be discovered.",
      },
      { property: "og:title", content: "Join Hushly" },
      { property: "og:description", content: "Create a free Hushly account in under a minute." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [focusEmail, setFocusEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/me" });
    }
  }, [loading, navigate, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Enter your email address.");
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    if (mode === "signup" && password !== confirm) return setError("Passwords don't match.");

    setBusy(true);
    try {
      if (mode === "signup") {
        const result = createLocalUserAccount({
          email: email.trim(),
          password,
          full_name: email.split("@")[0] ?? email.trim(),
        });
        if (!result.ok) throw new Error(result.error);
        rememberEmail(email);
        void trackEvent("signup_completed");
        toast.success("Welcome to Hushly!");
        navigate({ to: "/onboarding" });
      } else {
        const result = signInLocalUser({ email: email.trim(), password });
        if (!result.ok) throw new Error(result.error);
        rememberEmail(email);
        void trackEvent("signin_completed");
        navigate({ to: "/me" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setNotice(
      "Google sign-in is disabled in this local-storage build. Use email signup or the demo account instead.",
    );
    setFocusEmail(true);
    window.setTimeout(() => setFocusEmail(false), 600);
    return;
  };

  return (
    <div className="relative min-h-screen bg-background px-5 pb-16 pt-14">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -left-24 top-0 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
        <div className="animate-float absolute -right-20 top-40 h-64 w-64 rounded-full bg-accent/20 blur-3xl [animation-delay:1.4s]" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <span className="vibe-gradient flex h-10 w-10 items-center justify-center rounded-2xl">
            <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
          </span>
          <span className="font-display text-lg font-bold">
            <span className="vibe-text-gradient">Hushly</span>
          </span>
        </Link>

        <h1 className="animate-rise font-display text-3xl font-bold">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="animate-rise mt-2 text-sm text-muted-foreground [animation-delay:60ms]">
          {mode === "signup"
            ? "You must be 18 or older to join Hushly."
            : "Sign in to keep the conversation going."}
        </p>

        {notice && (
          <div className="animate-rise mt-5 flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <p className="text-sm text-foreground/90">{notice}</p>
          </div>
        )}

        <form onSubmit={submit} className="animate-rise mt-6 space-y-4 [animation-delay:120ms]">
          <EmailField value={email} onChange={setEmail} autoFocusField={focusEmail} />
          <PasswordField
            label="Password"
            value={password}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            onChange={(e) => setPassword(e.target.value)}
            {...(mode === "signup" ? { hint: "At least 8 characters" } : {})}
          />
          {mode === "signup" && (
            <PasswordField
              label="Confirm password"
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
            />
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="vibe-gradient flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-display text-base font-semibold text-primary-foreground shadow-xl transition-transform active:scale-[0.97] disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={google}
          disabled={busy}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-6 py-4 text-sm font-semibold transition-transform active:scale-[0.97]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path fill="#EA4335" d="M12 10.2v3.9h5.5a4.7 4.7 0 0 1-2 3.1l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2H12z" />
            <path fill="#34A853" d="M6.6 14.3 5.9 15l-2.6 2A9 9 0 0 0 12 21c2.4 0 4.5-.8 6-2.3l-3.2-2.5c-.8.6-1.9.9-3 .9a5.2 5.2 0 0 1-4.9-3.6z" />
            <path fill="#FBBC05" d="M3.3 7A9 9 0 0 0 3 12c0 1.7.4 3.4 1.2 4.9l3.4-2.6A5.4 5.4 0 0 1 7.3 12c0-.5.1-1 .3-1.4z" />
            <path fill="#4285F4" d="M12 6.6c1.3 0 2.5.5 3.5 1.4l2.6-2.6A9 9 0 0 0 3.3 7l3.3 2.6A5.2 5.2 0 0 1 12 6.6z" />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={async () => {
            setBusy(true);
            try {
              signInDemoSession();
              void trackEvent("demo_login");
              toast.success("Demo verified account activated.");
              navigate({ to: "/me" });
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-primary/50 bg-primary/10 px-6 py-4 text-sm font-semibold text-primary transition-transform active:scale-[0.97]"
        >
          Use demo verified account
        </button>

        <div className="mt-4 rounded-2xl border border-border bg-surface/80 p-3 text-center text-xs text-muted-foreground">
          Demo account: {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already a member?" : "New to Hushly?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
              setNotice(null);
            }}
            className="font-semibold text-primary"
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </p>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our <a href="/terms" className="underline">Terms</a> and{" "}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
