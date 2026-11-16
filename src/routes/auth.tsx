import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/hushly/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } => ({
    mode: s.mode === "signup" || s.mode === "forgot" || s.mode === "signin" ? (s.mode as Mode) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in to Hushly" },
      { name: "description", content: "Log in or create your Hushly account to start swiping and matching." },
      { property: "og:title", content: "Sign in to Hushly" },
      { property: "og:description", content: "Log in or create your Hushly account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/discover", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/discover", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/discover", data: { name: name.trim() } },
        });
        if (error) throw error;
        if (!data.session) setSentTo(email);
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSentTo(email);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" });
    if (result.error) {
      toast.error(result.error.message ?? "Sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/discover", replace: true });
  }

  const title = mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back";

  return (
    <div className="noise-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {["/people/sofia.jpg", "/people/mateo.jpg", "/people/priya.jpg", "/people/noah.jpg"].map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.18 }}
            transition={{ delay: i * 0.15, duration: 1 }}
            className="animate-float absolute hidden w-40 rounded-3xl object-cover blur-[1px] md:block"
            style={{
              top: ["8%", "60%", "12%", "62%"][i],
              left: i % 2 === 0 ? ["6%", "", "78%", ""][i] : undefined,
              right: i % 2 === 1 ? ["", "80%", "", "6%"][i] : undefined,
              rotate: `${[-10, 8, 10, -6][i]}deg`,
              aspectRatio: "3/4",
              animationDelay: `${i}s`,
            }}
          />
        ))}
      </div>

      <Link to="/" className="relative z-10 mb-8">
        <Logo size="lg" />
      </Link>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass relative z-10 w-full max-w-md rounded-3xl border border-border p-7 shadow-card"
      >
        <AnimatePresence mode="wait">
          {sentTo ? (
            <motion.div key="sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
              <div className="bg-brand mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full shadow-glow">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">Check your inbox</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a link to <span className="font-semibold text-foreground">{sentTo}</span>.{" "}
                {mode === "forgot" ? "Open it to choose a new password." : "Confirm your email to finish signing up."}
              </p>
              <Button variant="ghost" className="mt-5" onClick={() => { setSentTo(null); setMode("signin"); }}>
                Back to sign in
              </Button>
            </motion.div>
          ) : (
            <motion.div key={mode} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              <h1 className="text-3xl font-extrabold">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signup" ? "It takes less than a minute. 18+ only." : mode === "forgot" ? "We'll email you a reset link." : "Your matches are waiting."}
              </p>

              {mode !== "forgot" && (
                <div className="mt-6 grid gap-2.5">
                  <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => social("google")}>
                    <GoogleIcon />
                    Continue with Google
                  </Button>
                  <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => social("lovable")}>
                    <LovableMark />
                    Continue with Lovable
                  </Button>
                  <div className="my-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" />
                  </div>
                </div>
              )}

              <form onSubmit={onSubmit} className={mode === "forgot" ? "mt-6 grid gap-4" : "grid gap-4"}>
                {mode === "signup" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">First name</Label>
                    <Input id="name" required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" className="h-11 rounded-xl" />
                  </div>
                )}
                <div className="grid gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-11 rounded-xl" />
                </div>
                {mode !== "forgot" && (
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {mode === "signin" && (
                        <button type="button" onClick={() => setMode("forgot")} className="text-xs font-medium text-primary hover:underline">
                          Forgot?
                        </button>
                      )}
                    </div>
                    <Input id="password" type="password" required minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11 rounded-xl" />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-brand mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full text-base font-bold text-primary-foreground shadow-glow transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Log in"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signup" ? (
                  <>Already on Hushly?{" "}<button className="font-semibold text-primary hover:underline" onClick={() => setMode("signin")}>Log in</button></>
                ) : mode === "signin" ? (
                  <>New here?{" "}<button className="font-semibold text-primary hover:underline" onClick={() => setMode("signup")}>Create an account</button></>
                ) : (
                  <button className="font-semibold text-primary hover:underline" onClick={() => setMode("signin")}>Back to log in</button>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
