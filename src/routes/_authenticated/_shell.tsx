import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { firstPhoto, matchesQuery, myProfileQuery, type Message } from "@/lib/hushly";
import { Logo } from "@/components/hushly/Logo";
import { MatchesPanel } from "@/components/hushly/MatchesPanel";
import { BottomNav } from "@/components/hushly/BottomNav";

export const Route = createFileRoute("/_authenticated/_shell")({
  loader: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(myProfileQuery());
    if (!me?.onboarded) throw redirect({ to: "/onboarding" });
  },
  component: Shell,
});

function Shell() {
  const { data: me } = useSuspenseQuery(myProfileQuery());
  const qc = useQueryClient();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: matches = [] } = useQuery({ ...matchesQuery(me!.id), enabled: !!me });
  const unread = matches.reduce((n, m) => n + (m.unread > 0 ? 1 : 0), 0);

  useEffect(() => {
    if (!me) return;
    const channel = supabase
      .channel(`hushly-${me.id}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message;
        qc.invalidateQueries({ queryKey: ["messages", msg.match_id] });
        qc.invalidateQueries({ queryKey: ["matches", me.id] });
        if (msg.sender_id !== me.id && !window.location.pathname.includes(msg.match_id)) {
          toast(msg.body.length > 80 ? msg.body.slice(0, 80) + "…" : msg.body, { description: "New message" });
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => {
        qc.invalidateQueries({ queryKey: ["matches", me.id] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [me, qc]);

  if (!me) return null;
  const inChat = path.startsWith("/chat/");

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="hidden w-[360px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="bg-brand flex items-center justify-between px-4 py-4">
          <Link to="/profile" className="flex items-center gap-3 rounded-full transition hover:opacity-90">
            <span className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary-foreground/80">
              {firstPhoto(me) && <img src={firstPhoto(me)} alt="My profile" className="h-full w-full object-cover" />}
            </span>
            <span className="font-display text-lg font-bold text-primary-foreground">My profile</span>
          </Link>
          <Link to="/discover" className="rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/25">
            Discover
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-none">
          <MatchesPanel me={me} />
        </div>
      </aside>

      <main className="noise-bg relative flex min-w-0 flex-1 flex-col">
        {!inChat && (
          <header className="flex items-center justify-center px-4 pb-1 pt-4 lg:hidden">
            <Logo size="sm" />
          </header>
        )}
        <div className={inChat ? "flex min-h-0 flex-1 flex-col" : "flex min-h-0 flex-1 flex-col pb-20 lg:pb-0"}>
          <Outlet />
        </div>
        {!inChat && <BottomNav unread={unread} />}
      </main>
    </div>
  );
}
