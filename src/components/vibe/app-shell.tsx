import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Compass, Heart, MessageCircle, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Heart, exact: true },
  { to: "/discover", label: "Discover", icon: Compass, exact: false },
  { to: "/messages", label: "Chat", icon: MessageCircle, exact: false },
  { to: "/me", label: "Profile", icon: UserRound, exact: false },
] as const;

export function BottomNav() {
  return (
    <nav className="glass safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border/60 px-3 pt-2">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {tabs.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            className="group flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-muted-foreground transition-colors data-[status=active]:text-primary"
          >
            <Icon className="h-5 w-5 transition-transform group-active:scale-90" />
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/** Standard page with bottom navigation. */
export function AppPage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className={cn("mx-auto w-full max-w-md", className)}>{children}</div>
      <BottomNav />
    </div>
  );
}

/** Full-screen nested view: no bottom nav, floating back button. */
export function NestedPage({
  children,
  title,
  fallbackTo = "/",
}: {
  children: ReactNode;
  title?: string;
  fallbackTo?: "/" | "/discover" | "/messages" | "/me";
}) {
  const navigate = useNavigate();
  return (
    <div className="animate-slide-in-right min-h-screen bg-background">
      <button
        aria-label="Go back"
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) window.history.back();
          else navigate({ to: fallbackTo });
        }}
        className="glass fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border/60 shadow-lg transition-transform active:scale-90"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      {title && (
        <div className="glass sticky top-0 z-30 flex h-16 items-center justify-center border-b border-border/60">
          <p className="font-display text-base font-semibold">{title}</p>
        </div>
      )}
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );
}
