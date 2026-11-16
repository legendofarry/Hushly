import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Heart, RotateCcw, Star, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deckQuery, findMatchWith, firstPhoto, myProfileQuery, type Profile } from "@/lib/hushly";
import { SwipeCard, type SwipeCardHandle, type SwipeDir } from "@/components/hushly/SwipeCard";
import { MatchModal } from "@/components/hushly/MatchModal";
import { ProfileDetail } from "@/components/hushly/ProfileDetail";
import { requestSampleReply } from "@/lib/chat.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_shell/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Hushly" },
      { name: "description", content: "Swipe right to like, left to pass, up to super like." },
      { property: "og:title", content: "Discover — Hushly" },
      { property: "og:description", content: "Swipe right to like, left to pass, up to super like." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Discover,
});

type HistoryItem = { profile: Profile; dir: SwipeDir; matched: boolean };

function Discover() {
  const { data: me } = useSuspenseQuery(myProfileQuery());
  const { data: deck = [], isLoading, refetch, isFetching } = useQuery(deckQuery());
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [swiped, setSwiped] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [rewound, setRewound] = useState<{ id: string; dir: SwipeDir } | null>(null);
  const [match, setMatch] = useState<{ other: Profile; matchId: string; superLike: boolean } | null>(null);
  const [detail, setDetail] = useState<Profile | null>(null);
  const topRef = useRef<SwipeCardHandle>(null);

  const cards = useMemo(() => deck.filter((p) => !swiped.has(p.id)), [deck, swiped]);
  const visible = cards.slice(0, 3);

  useEffect(() => {
    if (!isFetching && cards.length <= 2 && deck.length > 0 && swiped.size > 0) {
      refetch();
    }
  }, [cards.length, deck.length, swiped.size, isFetching, refetch]);

  const onSwiped = useCallback(
    async (profile: Profile, dir: SwipeDir) => {
      if (!me) return;
      setRewound(null);
      setSwiped((s) => new Set(s).add(profile.id));
      const { error } = await supabase.from("swipes").insert({ swiper_id: me.id, target_id: profile.id, direction: dir });
      if (error && !error.message.includes("duplicate")) {
        toast.error("Couldn't save that swipe");
        return;
      }
      let matched = false;
      if (dir !== "nope") {
        const m = await findMatchWith(me.id, profile.id);
        if (m) {
          matched = true;
          setMatch({ other: profile, matchId: m.id, superLike: dir === "super" });
          qc.invalidateQueries({ queryKey: ["matches", me.id] });
        }
      }
      setHistory((h) => [...h.slice(-9), { profile, dir, matched }]);
    },
    [me, qc],
  );

  async function rewind() {
    const last = history.at(-1);
    if (!last || !me) return;
    if (last.matched) {
      toast.message(`You already matched with ${last.profile.name} — say hi instead!`);
      return;
    }
    const { error } = await supabase.from("swipes").delete().eq("swiper_id", me.id).eq("target_id", last.profile.id);
    if (error) return toast.error("Couldn't rewind");
    setHistory((h) => h.slice(0, -1));
    setRewound({ id: last.profile.id, dir: last.dir });
    setSwiped((s) => {
      const n = new Set(s);
      n.delete(last.profile.id);
      return n;
    });
  }

  async function revisitPassed() {
    if (!me) return;
    const { error } = await supabase.from("swipes").delete().eq("swiper_id", me.id).eq("direction", "nope");
    if (error) return toast.error("Couldn't reload profiles");
    setSwiped(new Set());
    setHistory([]);
    await qc.invalidateQueries({ queryKey: ["deck"] });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (match || detail) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight") topRef.current?.swipe("like");
      else if (e.key === "ArrowLeft") topRef.current?.swipe("nope");
      else if (e.key === "ArrowUp") { e.preventDefault(); topRef.current?.swipe("super"); }
      else if (e.key === "Backspace") rewind();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function sendFirstMessage(text: string) {
    if (!match || !me) return;
    const { matchId, other } = match;
    setMatch(null);
    const { error } = await supabase.from("messages").insert({ match_id: matchId, sender_id: me.id, body: text });
    if (error) return toast.error("Message failed to send");
    qc.invalidateQueries({ queryKey: ["matches", me.id] });
    if (other.is_demo) requestSampleReply({ data: { matchId } }).catch(() => {});
    navigate({ to: "/chat/$matchId", params: { matchId } });
  }

  const empty = !isLoading && cards.length === 0;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-3 py-3 sm:px-6">
      <div className="relative w-full max-w-[420px] flex-1" style={{ maxHeight: 680, minHeight: 420 }}>
        {isLoading && <div className="absolute inset-0 animate-pulse rounded-[2rem] bg-muted" />}

        <AnimatePresence>
          {empty && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-border bg-card/40 p-8 text-center backdrop-blur"
            >
              <div className="relative mb-8 grid h-32 w-32 place-items-center">
                {[0, 0.7, 1.4].map((d) => (
                  <span key={d} className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-primary" style={{ animationDelay: `${d}s` }} />
                ))}
                <span className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background shadow-glow">
                  {firstPhoto(me) && <img src={firstPhoto(me)} alt="You" className="h-full w-full object-cover" />}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold">You've seen everyone nearby</h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">New people join all the time. Check back soon, or take another look at the people you passed.</p>
              <button onClick={revisitPassed} className="bg-brand mt-6 rounded-full px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition active:scale-95">
                Revisit passed profiles
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {visible
          .map((p, i) => (
            <SwipeCard
              key={p.id}
              ref={i === 0 ? topRef : undefined}
              profile={p}
              depth={i}
              enterFrom={rewound?.id === p.id ? rewound.dir : null}
              onSwiped={(dir) => onSwiped(p, dir)}
              onInfo={() => setDetail(p)}
            />
          ))
          .reverse()}

        {!empty && !isLoading && (
          <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-3 sm:gap-4">
            <ActionButton label="Rewind" onClick={rewind} disabled={history.length === 0} className="h-12 w-12 text-rewind" glow="var(--rewind)">
              <RotateCcw className="h-5 w-5" strokeWidth={2.75} />
            </ActionButton>
            <ActionButton label="Nope" onClick={() => topRef.current?.swipe("nope")} className="h-16 w-16 text-nope" glow="var(--nope)">
              <X className="h-8 w-8" strokeWidth={3.25} />
            </ActionButton>
            <ActionButton label="Super like" onClick={() => topRef.current?.swipe("super")} className="h-12 w-12 text-super" glow="var(--super)">
              <Star className="h-5 w-5" fill="currentColor" />
            </ActionButton>
            <ActionButton label="Like" onClick={() => topRef.current?.swipe("like")} className="h-16 w-16 text-like" glow="var(--like)">
              <Heart className="h-8 w-8" fill="currentColor" />
            </ActionButton>
          </div>
        )}
      </div>

      <p className="mt-3 hidden text-xs text-muted-foreground lg:block">
        Tip: use ← → to pass or like, ↑ to super like, Backspace to rewind
      </p>

      <MatchModal
        open={!!match}
        me={me}
        other={match?.other ?? null}
        superLike={match?.superLike}
        onClose={() => setMatch(null)}
        onSend={sendFirstMessage}
      />
      <ProfileDetail profile={detail} open={!!detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  disabled,
  className,
  glow,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  glow: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.1, boxShadow: `0 0 30px -4px color-mix(in oklab, ${glow} 70%, transparent)` }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className={cn("glass grid place-items-center rounded-full border border-border shadow-card disabled:opacity-35", className)}
    >
      {children}
    </motion.button>
  );
}
