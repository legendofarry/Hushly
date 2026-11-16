import { animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Briefcase, Info, MapPin } from "lucide-react";
import { ageFrom, type Profile } from "@/lib/hushly";
import { cn } from "@/lib/utils";

export type SwipeDir = "like" | "nope" | "super";
export type SwipeCardHandle = { swipe: (dir: SwipeDir) => void };

export function PhotoProgress({ count, index }: { count: number; index: number }) {
  if (count <= 1) return null;
  return (
    <div className="absolute left-3 right-3 top-3 z-10 flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/30">
          <motion.div className="h-full bg-foreground" initial={false} animate={{ width: i <= index ? "100%" : "0%" }} transition={{ duration: 0.2 }} />
        </div>
      ))}
    </div>
  );
}

type Props = {
  profile: Profile;
  depth: number;
  enterFrom?: SwipeDir | null;
  onSwiped: (dir: SwipeDir) => void;
  onInfo: () => void;
};

export const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard({ profile, depth, enterFrom, onSwiped, onInfo }, ref) {
  const isTop = depth === 0;
  const x = useMotionValue(enterFrom === "like" ? 700 : enterFrom === "nope" ? -700 : 0);
  const y = useMotionValue(enterFrom === "super" ? -900 : 0);
  const rotate = useTransform(x, [-320, 320], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0]);
  const superOpacity = useTransform(y, [-160, -40], [1, 0]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const photos = profile.photos?.length ? profile.photos : [];

  if (enterFrom && isTop) {
    // Spring back in after a rewind.
    queueMicrotask(() => {
      animate(x, 0, { type: "spring", stiffness: 260, damping: 24 });
      animate(y, 0, { type: "spring", stiffness: 260, damping: 24 });
    });
  }

  function fly(dir: SwipeDir, velocity = 0) {
    if (leaving) return;
    setLeaving(true);
    const opts = { duration: Math.max(0.22, 0.4 - Math.abs(velocity) / 6000), ease: [0.3, 0.6, 0.4, 1] as const };
    const done = () => onSwiped(dir);
    if (dir === "super") {
      animate(y, -window.innerHeight - 200, opts).then(done);
    } else {
      animate(x, (dir === "like" ? 1 : -1) * (window.innerWidth + 300), opts).then(done);
      animate(y, y.get() + 60, opts);
    }
  }

  useImperativeHandle(ref, () => ({ swipe: (dir) => fly(dir) }));

  function onDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info;
    if (offset.x > 120 || velocity.x > 700) return fly("like", velocity.x);
    if (offset.x < -120 || velocity.x < -700) return fly("nope", velocity.x);
    if (offset.y < -150 || velocity.y < -800) return fly("super", velocity.y);
    animate(x, 0, { type: "spring", stiffness: 400, damping: 28 });
    animate(y, 0, { type: "spring", stiffness: 400, damping: 28 });
  }

  const age = ageFrom(profile.birthdate);

  return (
    <motion.div
      className={cn("absolute inset-0 touch-none select-none", isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none")}
      style={{ x: isTop ? x : 0, y: isTop ? y : 0, rotate: isTop ? rotate : 0, zIndex: 10 - depth }}
      initial={false}
      animate={{ scale: 1 - depth * 0.045, translateY: depth * 16, opacity: depth > 2 ? 0 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      drag={isTop && !leaving}
      dragElastic={0.9}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragMomentum={false}
      onDragEnd={onDragEnd}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
        {photos[photoIdx] ? (
          <img src={photos[photoIdx]} alt={profile.name} draggable={false} className="h-full w-full object-cover" />
        ) : (
          <div className="bg-brand h-full w-full" />
        )}
        <PhotoProgress count={photos.length} index={photoIdx} />

        {isTop && photos.length > 1 && (
          <div className="absolute inset-x-0 top-0 bottom-40 flex">
            <button aria-label="Previous photo" className="flex-1" onClick={() => setPhotoIdx((i) => Math.max(0, i - 1))} />
            <button aria-label="Next photo" className="flex-1" onClick={() => setPhotoIdx((i) => Math.min(photos.length - 1, i + 1))} />
          </div>
        )}

        {isTop && (
          <>
            <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute left-6 top-10 -rotate-[18deg] rounded-xl border-[5px] border-like px-3 py-1 font-display text-4xl font-extrabold tracking-wider text-like">
              LIKE
            </motion.div>
            <motion.div style={{ opacity: nopeOpacity }} className="pointer-events-none absolute right-6 top-10 rotate-[18deg] rounded-xl border-[5px] border-nope px-3 py-1 font-display text-4xl font-extrabold tracking-wider text-nope">
              NOPE
            </motion.div>
            <motion.div style={{ opacity: superOpacity }} className="pointer-events-none absolute bottom-48 left-1/2 -translate-x-1/2 -rotate-6 rounded-xl border-[5px] border-super px-3 py-1 text-center font-display text-3xl font-extrabold leading-none tracking-wider text-super">
              SUPER<br />LIKE
            </motion.div>
          </>
        )}

        <div className="bg-scrim-gradient pointer-events-none absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-5 pb-28">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-3xl font-extrabold text-foreground sm:text-4xl">
                {profile.name} <span className="font-normal opacity-90">{age ?? ""}</span>
              </h2>
              <div className="mt-1 space-y-0.5 text-sm text-foreground/85">
                {profile.job && <p className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" />{profile.job}</p>}
                {profile.city && <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{profile.city}</p>}
              </div>
              {profile.interests?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profile.interests.slice(0, 4).map((t) => (
                    <span key={t} className="glass rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-foreground">{t}</span>
                  ))}
                </div>
              )}
            </div>
            {isTop && (
              <button
                onClick={onInfo}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label={`Open ${profile.name}'s profile`}
                className="glass grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-foreground transition hover:scale-110"
              >
                <Info className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
