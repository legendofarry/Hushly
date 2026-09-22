import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, SearchX, WifiOff } from "lucide-react";

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-surface">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary">
        <div className="absolute inset-0 -translate-x-full animate-[vibe-shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
      </div>
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 rounded-full bg-secondary" />
        <div className="h-3 w-1/2 rounded-full bg-secondary" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
      <div className="vibe-gradient mb-4 flex h-16 w-16 items-center justify-center rounded-2xl opacity-90">
        {icon ?? <SearchX className="h-7 w-7 text-primary-foreground" />}
      </div>
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<WifiOff className="h-7 w-7 text-primary-foreground" />}
      title="Something went wrong"
      description={message ?? "We couldn't load this right now. Check your connection and try again."}
      action={
        onRetry ? (
          <button
            onClick={onRetry}
            className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
        ) : null
      }
    />
  );
}

export function SignInPrompt({ message }: { message: string }) {
  return (
    <EmptyState
      icon={<Heart className="h-7 w-7 text-primary-foreground" fill="currentColor" />}
      title="Join Hushly to continue"
      description={message}
      action={
        <Link
          to="/auth"
          className="vibe-gradient inline-flex rounded-2xl px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Create a free account
        </Link>
      }
    />
  );
}
