import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Heart, Star } from "lucide-react";
import { firstPhoto, matchesQuery, timeAgo, type Profile } from "@/lib/hushly";
import { cn } from "@/lib/utils";

export function MatchesPanel({ me }: { me: Profile }) {
  const { data: matches = [], isLoading } = useQuery(matchesQuery(me.id));
  const params = useParams({ strict: false }) as { matchId?: string };
  const fresh = matches.filter((m) => !m.lastMessage);
  const convos = matches.filter((m) => m.lastMessage);

  return (
    <div className="flex h-full flex-col">
      <section className="px-4 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">New matches</h2>
          {fresh.length > 0 && <span className="bg-brand rounded-full px-2 py-0.5 text-xs font-bold text-primary-foreground">{fresh.length}</span>}
        </div>
        {isLoading ? (
          <div className="flex gap-3">{[0, 1, 2].map((i) => <div key={i} className="h-32 w-24 animate-pulse rounded-2xl bg-muted" />)}</div>
        ) : fresh.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            <div className="bg-brand grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-foreground"><Heart className="h-5 w-5" fill="currentColor" /></div>
            Keep swiping — new matches show up here.
          </div>
        ) : (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
            {fresh.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                <Link to="/chat/$matchId" params={{ matchId: m.id }} className="group block w-24 shrink-0">
                  <div className={cn("relative h-32 w-24 overflow-hidden rounded-2xl border-2 transition group-hover:scale-[1.04]", m.super_like ? "border-super" : "border-primary")}>
                    {firstPhoto(m.other) && <img src={firstPhoto(m.other)} alt={m.other.name} className="h-full w-full object-cover" />}
                    {m.super_like && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-super text-primary-foreground"><Star className="h-3 w-3" fill="currentColor" /></span>}
                    <div className="bg-scrim-gradient absolute inset-0" />
                    <p className="absolute bottom-1.5 left-2 right-2 truncate text-sm font-bold text-foreground">{m.other.name}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-5 flex-1 px-2">
        <h2 className="mb-1 px-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">Messages</h2>
        {convos.length === 0 && !isLoading && (
          <p className="px-2 py-6 text-sm text-muted-foreground">No conversations yet. Tap a new match to say hi.</p>
        )}
        <ul>
          {convos.map((m, i) => {
            const active = params.matchId === m.id;
            const mineLast = m.lastMessage?.sender_id === me.id;
            return (
              <motion.li key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Link
                  to="/chat/$matchId"
                  params={{ matchId: m.id }}
                  className={cn("flex items-center gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-accent", active && "bg-accent")}
                >
                  <div className="relative">
                    <div className="h-14 w-14 overflow-hidden rounded-full">
                      {firstPhoto(m.other) && <img src={firstPhoto(m.other)} alt={m.other.name} className="h-full w-full object-cover" />}
                    </div>
                    {m.unread > 0 && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-sidebar bg-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cn("truncate font-semibold", m.unread > 0 && "font-bold")}>{m.other.name}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{m.lastMessage && timeAgo(m.lastMessage.created_at)}</span>
                    </div>
                    <p className={cn("truncate text-sm", m.unread > 0 ? "text-foreground" : "text-muted-foreground")}>
                      {mineLast && <span className="text-muted-foreground">You: </span>}
                      {m.lastMessage?.body}
                    </p>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
