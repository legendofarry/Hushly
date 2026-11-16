import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MessageCircle, User } from "lucide-react";
import { LogoMark } from "./Logo";
import { cn } from "@/lib/utils";

export function BottomNav({ unread }: { unread: number }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/discover" as const, label: "Discover", active: path.startsWith("/discover"), icon: <LogoMark className="h-6 w-6" /> },
    { to: "/matches" as const, label: "Chats", active: path.startsWith("/matches") || path.startsWith("/chat"), icon: <MessageCircle className="h-6 w-6" />, badge: unread },
    { to: "/profile" as const, label: "Profile", active: path.startsWith("/profile"), icon: <User className="h-6 w-6" /> },
  ];
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around py-1.5">
        {items.map((it) => (
          <li key={it.to}>
            <Link to={it.to} className={cn("relative flex flex-col items-center gap-0.5 px-5 py-1.5 text-[11px] font-semibold transition", it.active ? "text-foreground" : "text-muted-foreground grayscale")}>
              {it.active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-2xl bg-accent" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative">
                {it.icon}
                {!!it.badge && it.badge > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-brand absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-primary-foreground">
                    {it.badge > 9 ? "9+" : it.badge}
                  </motion.span>
                )}
              </span>
              <span className="relative">{it.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
