import { useEffect, useState } from "react";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";

const KEY = "naivibe.age-confirmed";

export function AgeGate() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      setOpen(window.localStorage.getItem(KEY) !== "yes");
    } catch {
      setOpen(true);
    }
    setReady(true);
  }, []);

  if (!ready || !open) return null;

  const confirm = () => {
    try {
      window.localStorage.setItem(KEY, "yes");
    } catch {
      /* ignore */
    }
    setLeaving(true);
    window.setTimeout(() => setOpen(false), 320);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Age confirmation"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between bg-background px-6 py-12 transition-all duration-300 ${
        leaving ? "scale-105 opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
        <div className="animate-float absolute -right-20 bottom-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl [animation-delay:1.5s]" />
      </div>

      <div className="relative mt-10 flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          <span className="animate-pulse-ring absolute inset-0 rounded-full bg-primary/40" />
          <div className="vibe-gradient relative flex h-24 w-24 items-center justify-center rounded-full shadow-2xl">
            <Heart className="h-11 w-11 text-primary-foreground" fill="currentColor" />
          </div>
        </div>

        <h1 className="animate-rise text-4xl font-bold">
          nai<span className="vibe-text-gradient">Vibe</span>
        </h1>
        <p className="animate-rise mt-3 max-w-xs text-sm text-muted-foreground [animation-delay:80ms]">
          Real people, real connections. Before you step in, confirm your age.
        </p>

        <div className="animate-rise glass mt-10 w-full max-w-sm rounded-3xl border border-border/60 p-6 text-left [animation-delay:160ms]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <p className="font-display text-lg font-semibold">Are you 18 or older?</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            naiVibe is an adults-only dating and social discovery community. You must be at least
            18 years old to continue.
          </p>
        </div>
      </div>

      <div className="animate-rise relative w-full max-w-sm space-y-3 [animation-delay:220ms]">
        <button
          onClick={confirm}
          className="vibe-gradient flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-display text-base font-semibold text-primary-foreground shadow-xl transition-transform active:scale-[0.97]"
        >
          <Sparkles className="h-5 w-5" />
          Yes, I&apos;m 18 or older
        </button>
        <a
          href="https://www.google.com"
          className="block w-full rounded-2xl border border-border bg-surface px-6 py-4 text-center text-sm font-medium text-muted-foreground transition-colors active:bg-secondary"
        >
          No, take me back
        </a>
        <p className="pt-2 text-center text-xs text-muted-foreground">
          By continuing you accept our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
