import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Send, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { firstPhoto, matchesQuery, messagesQuery, myProfileQuery, type Message } from "@/lib/hushly";
import { requestSampleReply } from "@/lib/chat.functions";
import { ProfileDetail } from "@/components/hushly/ProfileDetail";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_shell/chat/$matchId")({
  head: () => ({
    meta: [
      { title: "Chat — Hushly" },
      { name: "description", content: "Chat with your Hushly match in real time." },
      { property: "og:title", content: "Chat — Hushly" },
      { property: "og:description", content: "Chat with your Hushly match in real time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

const ICEBREAKERS = ["Hey! How's your week going?", "Two truths and a lie — go!", "What's your perfect Sunday?"];

function ChatPage() {
  const { matchId } = Route.useParams();
  const { data: me } = useSuspenseQuery(myProfileQuery());
  const { data: matches = [], isLoading: loadingMatches } = useQuery({ ...matchesQuery(me?.id ?? ""), enabled: !!me });
  const { data: messages = [] } = useQuery(messagesQuery(matchId));
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const match = matches.find((m) => m.id === matchId);
  const other = match?.other ?? null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typing]);

  useEffect(() => {
    if (!me || !messages.some((m) => m.sender_id !== me.id && !m.read_at)) return;
    supabase.rpc("mark_match_read", { _match_id: matchId }).then(() => {
      qc.invalidateQueries({ queryKey: ["matches", me.id] });
    });
  }, [messages, me, matchId, qc]);

  async function send(body: string) {
    if (!me || !body.trim()) return;
    setText("");
    const optimistic: Message = { id: crypto.randomUUID(), match_id: matchId, sender_id: me.id, body: body.trim(), created_at: new Date().toISOString(), read_at: null };
    qc.setQueryData<Message[]>(["messages", matchId], (old = []) => [...old, optimistic]);
    const { error } = await supabase.from("messages").insert({ match_id: matchId, sender_id: me.id, body: body.trim() });
    if (error) {
      toast.error("Message failed to send");
      qc.invalidateQueries({ queryKey: ["messages", matchId] });
      return;
    }
    if (other?.is_demo) {
      setTyping(true);
      try {
        await Promise.all([requestSampleReply({ data: { matchId } }), new Promise((r) => setTimeout(r, 1200))]);
      } catch {
        // reply is best-effort
      } finally {
        setTyping(false);
        qc.invalidateQueries({ queryKey: ["messages", matchId] });
      }
    }
  }

  async function unmatch() {
    if (!me || !window.confirm(`Unmatch ${other?.name ?? "this person"}?`)) return;
    const { error } = await supabase.from("matches").delete().eq("id", matchId);
    if (error) {
      toast.error("Couldn't unmatch");
      return;
    }
    qc.invalidateQueries({ queryKey: ["matches", me.id] });
    navigate({ to: "/matches", replace: true });
  }

  if (!loadingMatches && !match) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-muted-foreground">This conversation isn't available.</p>
        <Link to="/matches" className="bg-brand rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground">Back to chats</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="glass flex items-center gap-3 border-b border-border px-3 py-3">
        <Link to="/matches" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent lg:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <button onClick={() => setShowProfile(true)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
            {firstPhoto(other) && <img src={firstPhoto(other)} alt={other?.name ?? ""} className="h-full w-full object-cover" />}
          </span>
          <span className="truncate font-display text-lg font-bold">{other?.name}</span>
        </button>
        <button onClick={unmatch} aria-label="Unmatch" title="Unmatch" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-destructive">
          <UserX className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {match && (
          <p className="pb-3 text-center text-xs text-muted-foreground">
            You matched with {other?.name} on {new Date(match.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
        )}
        {messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-2 pt-6">
            {ICEBREAKERS.map((t) => (
              <button key={t} onClick={() => send(t)} className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm transition hover:border-primary">{t}</button>
            ))}
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const mine = m.sender_id === me?.id;
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <p className={cn("max-w-[78%] whitespace-pre-wrap break-words rounded-3xl px-4 py-2.5 text-[15px] leading-snug", mine ? "bg-brand rounded-br-md text-primary-foreground" : "rounded-bl-md bg-secondary text-secondary-foreground")}>
                  {m.body}
                </p>
              </motion.div>
            );
          })}
          {typing && (
            <motion.div key="typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex">
              <span className="flex gap-1 rounded-3xl rounded-bl-md bg-secondary px-4 py-3.5">
                {[0, 0.15, 0.3].map((d) => <span key={d} className="animate-typing h-2 w-2 rounded-full bg-muted-foreground" style={{ animationDelay: `${d}s` }} />)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-center gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder="Type a message" className="h-11 min-w-0 flex-1 rounded-full border border-border bg-card/60 px-5 text-sm outline-none focus:border-primary" />
        <motion.button whileTap={{ scale: 0.85 }} type="submit" disabled={!text.trim()} aria-label="Send" className="bg-brand grid h-11 w-11 place-items-center rounded-full text-primary-foreground disabled:opacity-40">
          <Send className="h-4 w-4" />
        </motion.button>
      </form>
      <ProfileDetail profile={other} open={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}
