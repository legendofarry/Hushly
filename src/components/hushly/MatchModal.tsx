import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Heart, Send, Star } from "lucide-react";
import { firstPhoto, type Profile } from "@/lib/hushly";

type Props = {
  open: boolean;
  me: Profile | null;
  other: Profile | null;
  superLike?: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
};

function readVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function MatchModal({ open, me, other, superLike, onClose, onSend }: Props) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!open) return;
    setText("");
    const colors = [readVar("--primary"), readVar("--primary-glow"), readVar("--like"), readVar("--super")].filter(Boolean);
    const end = Date.now() + 900;
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors, disableForReducedMotion: true });
      confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors, disableForReducedMotion: true });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    const t = setTimeout(frame, 250);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <AnimatePresence>
      {open && other && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-scrim/90 px-6 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="noise-bg pointer-events-none absolute inset-0 opacity-80" />
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute text-primary"
              style={{ left: `${(i * 73) % 100}%`, bottom: -40 }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -900 - (i % 4) * 120, opacity: [0, 1, 0], rotate: (i % 2 ? 1 : -1) * 40 }}
              transition={{ duration: 3 + (i % 5) * 0.4, delay: (i % 7) * 0.25, repeat: Infinity }}
            >
              <Heart className="h-5 w-5" fill="currentColor" />
            </motion.div>
          ))}

          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {superLike ? "Super like landed" : "Mutual crush"}
          </motion.p>
          <motion.h2
            initial={{ scale: 0.3, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.15 }}
            className="text-brand relative mt-2 text-center font-display text-6xl font-extrabold italic leading-none sm:text-7xl"
          >
            It's a Match!
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="relative mt-3 text-center text-muted-foreground">
            You and {other.name} liked each other.
          </motion.p>

          <div className="relative mt-10 flex items-center justify-center">
            <motion.div
              initial={{ x: -160, rotate: -30, opacity: 0 }}
              animate={{ x: 18, rotate: -10, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.3 }}
              className="h-44 w-36 overflow-hidden rounded-3xl border-4 border-foreground shadow-card sm:h-52 sm:w-40"
            >
              {firstPhoto(me) ? <img src={firstPhoto(me)} alt="You" className="h-full w-full object-cover" /> : <div className="bg-brand h-full w-full" />}
            </motion.div>
            <motion.div
              initial={{ x: 160, rotate: 30, opacity: 0 }}
              animate={{ x: -18, rotate: 10, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.3 }}
              className="h-44 w-36 overflow-hidden rounded-3xl border-4 border-foreground shadow-card sm:h-52 sm:w-40"
            >
              {firstPhoto(other) && <img src={firstPhoto(other)} alt={other.name} className="h-full w-full object-cover" />}
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.4, 1] }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="bg-brand absolute -bottom-5 grid h-14 w-14 place-items-center rounded-full text-primary-foreground shadow-glow"
            >
              {superLike ? <Star className="h-7 w-7" fill="currentColor" /> : <Heart className="h-7 w-7" fill="currentColor" />}
            </motion.div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (text.trim()) onSend(text.trim());
            }}
            className="relative mt-14 flex w-full max-w-sm items-center gap-2 rounded-full border border-border bg-card/80 p-1.5 pl-5 backdrop-blur"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              placeholder={`Say hi to ${other.name}...`}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" disabled={!text.trim()} aria-label="Send" className="bg-brand grid h-10 w-10 place-items-center rounded-full text-primary-foreground disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </motion.form>
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} onClick={onClose} className="relative mt-5 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
            Keep swiping
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
