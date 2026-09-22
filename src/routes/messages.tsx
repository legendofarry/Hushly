import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquareMore, PhoneCall, Star } from "lucide-react";
import { NestedPage } from "@/components/vibe/app-shell";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  return (
    <NestedPage title="Messages" fallbackTo="/">
      <div className="space-y-4 px-4 pb-10 pt-20">
        <div className="glass rounded-[28px] border border-border/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MessageSquareMore className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">Demo verified</p>
                <p className="text-xs text-muted-foreground">Online • now</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-accent" />
              4.9
            </div>
          </div>
        </div>

        <div className="glass rounded-[28px] border border-border/60 p-4">
          <div className="mb-4 rounded-2xl border border-border bg-surface p-3 text-sm text-muted-foreground">
            Hey there! This is your demo chat message area. You can test the conversation flow here.
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-3 text-sm text-foreground">
            <span className="flex items-center gap-2"><PhoneCall className="h-4 w-4 text-accent" /> Call request</span>
            <span className="font-semibold text-primary">Available</span>
          </div>
        </div>

        <Link to="/" className="block rounded-2xl bg-primary px-5 py-3 text-center font-display text-base font-semibold text-primary-foreground">
          Back home
        </Link>
      </div>
    </NestedPage>
  );
}
