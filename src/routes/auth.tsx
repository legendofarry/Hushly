import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { EmailField, PasswordField } from "@/components/vibe/fields";
import { rememberEmail } from "@/lib/email-memory";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Join naiVibe — create your account" },
      {
        name: "description",
        content: "Create your free naiVibe account or sign in to message members and be discovered.",
      },
      { property: "og:title", content: "Join naiVibe" },
      { property: "og:description", content: "Create a free naiVibe account in under a minute." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [focusEmail, setFocusEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Enter your email address.");
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    if (mode === "signup" && password !== confirm) return setError("Passwords don't match.");

    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/onboarding` },
        });
        if (err) throw err;
        rememberEmail(email);
        void trackEvent("signup_completed");
        toast.success("Welcome to naiVibe!");
        navigate({ to: "/onboarding" });
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        rememberEmail(email);
        void trackEvent("signin_completed");
        navigate({ to: "/me" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(
        message.toLowerCase().includes("invalid login")
          ? "That email and password don't match an account."
          : message,
      );
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    // Google is an add-on to an existing naiVibe account: people who have never
    // registered are guided back to the email form instead of being signed up silently.
    const { data } = await supabase.auth.getSession();
    if (!data.session && mode === "signup") {
      setNotice(
        "Register with your email and password first — then you can use Google to sign in faster.",
      );
      setFocusEmail(true);
      window.setTimeout(() => setFocusEmail(false), 600);
      return;
    }
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setBusy(false);
    if (result?.error) toast.error("Google sign-in didn't complete. Try again.");
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
            nai<span className="vibe-text-gradient">Vibe</span>
          </span>
        </Link>

        <h1 className="animate-rise font-display text-3xl font-bold">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="animate-rise mt-2 text-sm text-muted-foreground [animation-delay:60ms]">
          {mode === "signup"
            ? "You must be 18 or older to join naiVibe."
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
            hint={mode === "signup" ? "At least 8 characters" : undefined}
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

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already a member?" : "New to naiVibe?"}{" "}
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
          By continuing you agree to our <Link to="/terms" className="underline">Terms</Link> and{" "}
          <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
