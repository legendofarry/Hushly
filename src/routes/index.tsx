import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Heart, MessageCircle, Sparkles, ShieldCheck, Star, X } from "lucide-react";
import { Logo } from "@/components/hushly/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hushly — Swipe softly. Match loudly." },
      { name: "description", content: "Meet people nearby on Hushly. Swipe right to like, match when it's mutual and chat instantly." },
      { property: "og:title", content: "Hushly — Swipe softly. Match loudly." },
      { property: "og:description", content: "Meet people nearby. Swipe, match and chat instantly on Hushly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STACK = [
  { src: "/people/wanjiru.jpg", name: "Wanjiru", age: 30, rot: -14, x: -170, y: 30, delay: 0.1 },
  { src: "/people/kofi.jpg", name: "Kofi", age: 30, rot: 12, x: 170, y: 40, delay: 0.2 },
  { src: "/people/amara.jpg", name: "Amara", age: 29, rot: -3, x: 0, y: 0, delay: 0.35 },
];

function Landing() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  return (
    <div className="noise-bg relative min-h-screen overflow-hidden bg-background">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        {signedIn ? (
          <Link to="/discover" className="bg-brand rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow">
            Open Hushly
          </Link>
        ) : (
          <Link to="/auth" search={{ mode: "signin" }} className="rounded-full border border-border bg-card/40 px-5 py-2 text-sm font-semibold backdrop-blur transition hover:bg-card">
            Log in
          </Link>
        )}
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-6 lg:grid-cols-2 lg:pt-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-like" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-like" />
            </span>
            People near you are swiping right now
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            className="text-5xl font-extrabold leading-[0.95] sm:text-7xl"
          >
            Swipe softly.
            <br />
            <span className="text-brand">Match loudly.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-md text-lg text-muted-foreground"
          >
            Hushly is where good conversations start. Like who you like, match when it's mutual, and chat the moment sparks fly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            {signedIn ? (
              <Link to="/discover" className="bg-brand rounded-full px-8 py-4 text-base font-bold text-primary-foreground shadow-glow transition hover:scale-[1.03] active:scale-95">
                Start swiping
              </Link>
            ) : (
              <>
                <Link to="/auth" search={{ mode: "signup" }} className="bg-brand rounded-full px-8 py-4 text-base font-bold text-primary-foreground shadow-glow transition hover:scale-[1.03] active:scale-95">
                  Create account
                </Link>
                <Link to="/auth" search={{ mode: "signin" }} className="rounded-full border border-border bg-card/40 px-8 py-4 text-base font-semibold backdrop-blur transition hover:bg-card">
                  I have an account
                </Link>
              </>
            )}
          </motion.div>

          <div className="mt-12 grid max-w-md grid-cols-3 gap-4">
            {[
              { icon: Heart, label: "Mutual matches only" },
              { icon: MessageCircle, label: "Real-time chat" },
              { icon: ShieldCheck, label: "18+ verified ages" },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
                className="rounded-2xl border border-border bg-card/40 p-3 backdrop-blur"
              >
                <f.icon className="mb-2 h-5 w-5 text-primary" />
                <p className="text-xs font-medium leading-snug text-muted-foreground">{f.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto h-[520px] w-full max-w-[520px]">
          {STACK.map((c) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 80, rotate: 0, x: 0, scale: 0.9 }}
              animate={{ opacity: 1, y: c.y, rotate: c.rot, x: c.x, scale: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 16, delay: c.delay }}
              className="absolute left-1/2 top-4 -ml-[130px] w-[260px]"
            >
              <div className="animate-float" style={{ animationDelay: `${c.delay * 4}s` }}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-border shadow-card">
                  <img src={c.src} alt={`${c.name}, sample profile`} width={768} height={1024} className="h-full w-full object-cover" />
                  <div className="bg-scrim-gradient absolute inset-0" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-display text-2xl font-bold text-foreground">
                      {c.name} <span className="font-normal opacity-80">{c.age}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 0.9 }}
            className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-4"
          >
            <span className="glass grid h-14 w-14 place-items-center rounded-full border border-border text-nope shadow-card"><X className="h-7 w-7" strokeWidth={3} /></span>
            <span className="glass grid h-12 w-12 place-items-center rounded-full border border-border text-super shadow-card"><Star className="h-6 w-6" fill="currentColor" /></span>
            <span className="glass grid h-14 w-14 place-items-center rounded-full border border-border text-like shadow-card"><Heart className="h-7 w-7" fill="currentColor" /></span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="glass absolute right-0 top-0 flex items-center gap-2 rounded-2xl border border-border px-4 py-3 shadow-card"
          >
            <Sparkles className="h-4 w-4 text-primary-glow" />
            <span className="text-sm font-semibold">It's a match!</span>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Hushly · For adults 18+ · Be kind, be safe.
      </footer>
    </div>
  );
}
