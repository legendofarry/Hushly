import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Briefcase, ChevronDown, GraduationCap, MapPin } from "lucide-react";
import { ageFrom, type Profile } from "@/lib/hushly";
import { PhotoProgress } from "./SwipeCard";

export function ProfileDetail({ profile, open, onClose }: { profile: Profile | null; open: boolean; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const photos = profile?.photos?.length ? profile.photos : [];
  return (
    <AnimatePresence>
      {open && profile && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.button aria-label="Close profile" className="absolute inset-0 bg-scrim/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card shadow-card scrollbar-none sm:rounded-3xl"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              {photos[idx] && <img src={photos[idx]} alt={profile.name} className="h-full w-full object-cover" />}
              <PhotoProgress count={photos.length} index={idx} />
              {photos.length > 1 && (
                <div className="absolute inset-0 flex">
                  <button aria-label="Previous photo" className="flex-1" onClick={() => setIdx((i) => Math.max(0, i - 1))} />
                  <button aria-label="Next photo" className="flex-1" onClick={() => setIdx((i) => Math.min(photos.length - 1, i + 1))} />
                </div>
              )}
              <button
                onClick={onClose}
                aria-label="Close"
                className="bg-brand absolute -bottom-6 right-5 grid h-12 w-12 place-items-center rounded-full text-primary-foreground shadow-glow"
              >
                <ChevronDown className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-5 p-6 pt-8">
              <div>
                <h2 className="text-3xl font-extrabold">
                  {profile.name} <span className="font-normal text-muted-foreground">{ageFrom(profile.birthdate) ?? ""}</span>
                </h2>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {profile.job && <p className="flex items-center gap-2"><Briefcase className="h-4 w-4" />{profile.job}</p>}
                  {profile.school && <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4" />{profile.school}</p>}
                  {profile.city && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />Lives in {profile.city}</p>}
                </div>
              </div>
              {profile.bio && (
                <div>
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">About</h3>
                  <p className="leading-relaxed">{profile.bio}</p>
                </div>
              )}
              {profile.interests?.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((t) => (
                      <span key={t} className="rounded-full border border-border bg-secondary px-3 py-1 text-sm">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
