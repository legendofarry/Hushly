import { useId } from "react";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 40 40" className={cn("h-8 w-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary-glow)" />
        </linearGradient>
      </defs>
      <path
        d="M20 3c9.4 0 17 6.7 17 15.2 0 8.4-7.6 15.2-17 15.2-1.6 0-3.1-.2-4.6-.6L8 36.5c-.9.5-1.9-.3-1.6-1.3l1.6-5.6C4.9 26.9 3 22.8 3 18.2 3 9.7 10.6 3 20 3Z"
        fill={`url(#${id}-g)`}
      />
      <path
        d="M20 25.5s-7-4.2-7-9.1c0-2.4 1.8-4.2 4-4.2 1.4 0 2.4.7 3 1.7.6-1 1.6-1.7 3-1.7 2.2 0 4 1.8 4 4.2 0 4.9-7 9.1-7 9.1Z"
        fill="var(--primary-foreground)"
      />
    </svg>
  );
}

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const text = size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-2xl";
  const mark = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-8 w-8";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={mark} />
      <span className={cn("font-display font-extrabold tracking-tight text-brand", text)}>hushly</span>
    </span>
  );
}
