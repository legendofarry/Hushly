import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, Mail, X } from "lucide-react";
import { getRememberedEmails, forgetEmail } from "@/lib/email-memory";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-2xl border border-input bg-surface px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:border-primary/70 focus:ring-2 focus:ring-primary/25";

export function TextField({
  label,
  hint,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; error?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-foreground/90">{label}</span>}
      <input className={cn(base, error && "border-destructive/70", className)} {...props} />
      {error ? (
        <span className="mt-1.5 block text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

export function PasswordField({
  label,
  error,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; error?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-foreground/90">{label}</span>}
      <span className="relative block">
        <input
          type={show ? "text" : "password"}
          className={cn(base, "pr-12", error && "border-destructive/70", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2.5 text-muted-foreground transition-colors active:bg-secondary"
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </span>
      {error ? (
        <span className="mt-1.5 block text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

type EmailFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  autoFocusField?: boolean;
  id?: string;
};

/** Email input that remembers previously used addresses on this device. */
export function EmailField({ value, onChange, label = "Email", error, autoFocusField, id }: EmailFieldProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSuggestions(getRememberedEmails());
  }, []);

  useEffect(() => {
    if (autoFocusField) ref.current?.focus();
  }, [autoFocusField]);

  const visible = suggestions.filter(
    (s) => s !== value.toLowerCase() && s.includes(value.toLowerCase().trim()),
  );

  return (
    <div className="relative">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground/90">{label}</span>
        <span className="relative block">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            id={id}
            ref={ref}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={value}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            onChange={(e) => onChange(e.target.value)}
            className={cn(base, "pl-12", error && "border-destructive/70")}
          />
        </span>
        {error && <span className="mt-1.5 block text-xs text-destructive">{error}</span>}
      </label>

      {open && visible.length > 0 && (
        <div className="animate-rise absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl">
          <p className="px-4 pt-3 text-[11px] uppercase tracking-wide text-muted-foreground">
            Saved on this device
          </p>
          {visible.map((s) => (
            <div key={s} className="flex items-center">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(s);
                  setOpen(false);
                }}
                className="flex-1 truncate px-4 py-3 text-left text-sm transition-colors active:bg-secondary"
              >
                {s}
              </button>
              <button
                type="button"
                aria-label={`Forget ${s}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  forgetEmail(s);
                  setSuggestions(getRememberedEmails());
                }}
                className="px-3 py-3 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
