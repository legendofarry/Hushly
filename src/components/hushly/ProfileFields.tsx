import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { INTEREST_OPTIONS, uploadProfilePhoto } from "@/lib/hushly";

export function ChoicePills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "relative rounded-full border px-5 py-2.5 text-sm font-semibold transition",
              active ? "border-transparent text-primary-foreground" : "border-border bg-card/50 text-foreground hover:bg-card",
            )}
          >
            {active && <motion.span layoutId={`pill-${options.map((x) => x.value).join("")}`} className="bg-brand absolute inset-0 rounded-full shadow-glow" />}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function InterestPicker({ value, onChange, max = 6 }: { value: string[]; onChange: (v: string[]) => void; max?: number }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {INTEREST_OPTIONS.map((tag) => {
          const active = value.includes(tag);
          return (
            <motion.button
              key={tag}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (active) onChange(value.filter((v) => v !== tag));
                else if (value.length < max) onChange([...value, tag]);
                else toast.message(`Pick up to ${max} interests`);
              }}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                active ? "border-primary bg-primary/15 text-primary" : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {tag}
            </motion.button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{value.length}/{max} selected</p>
    </div>
  );
}

export function PhotoGrid({ value, onChange, max = 6 }: { value: string[]; onChange: (v: string[]) => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const room = max - value.length;
      const picked = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, room);
      const urls: string[] = [];
      for (const f of picked) {
        if (f.size > 10 * 1024 * 1024) {
          toast.error(`${f.name} is larger than 10 MB`);
          continue;
        }
        urls.push(await uploadProfilePhoto(f));
      }
      onChange([...value, ...urls]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }

  const slots = Array.from({ length: max });
  return (
    <div className="grid grid-cols-3 gap-3">
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      {slots.map((_, i) => {
        const url = value[i];
        return (
          <div key={i} className={cn("relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card/40", url && "border-solid border-transparent")}>
            <AnimatePresence>
              {url ? (
                <motion.div key={url} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0">
                  <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && <span className="bg-brand absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">Main</span>}
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => onChange(value.filter((_, j) => j !== i))}
                    className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground shadow"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => input.current?.click()}
                  className="absolute inset-0 grid place-items-center text-muted-foreground transition hover:text-primary"
                  aria-label="Add photo"
                >
                  {uploading && i === value.length ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <span className="bg-brand grid h-8 w-8 place-items-center rounded-full text-primary-foreground shadow-glow">
                      <Plus className="h-5 w-5" />
                    </span>
                  )}
                </button>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export const GENDER_OPTIONS = [
  { value: "woman" as const, label: "Woman" },
  { value: "man" as const, label: "Man" },
  { value: "nonbinary" as const, label: "Non-binary" },
];
export const INTEREST_IN_OPTIONS = [
  { value: "women" as const, label: "Women" },
  { value: "men" as const, label: "Men" },
  { value: "everyone" as const, label: "Everyone" },
];
