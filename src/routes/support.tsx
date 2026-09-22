import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Send } from "lucide-react";
import { NestedPage } from "@/components/vibe/app-shell";

export const Route = createFileRoute("/support")({
  component: SupportPage,
});

function SupportPage() {
  return (
    <NestedPage title="Support" fallbackTo="/">
      <div className="space-y-5 px-4 pb-10 pt-20">
        <div className="glass rounded-[28px] border border-border/60 p-5">
          <p className="font-display text-xl font-semibold">Need help?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Contact the owner or support team using the channels below.
          </p>

          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
              <Mail className="h-4 w-4 text-accent" />
              moderation.mails.go@gmail.com
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
              <MessageCircle className="h-4 w-4 text-accent" />
              WhatsApp: 0762634893
            </div>
          </div>
        </div>

        <div className="glass rounded-[28px] border border-border/60 p-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Your name</span>
            <input className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground" placeholder="Name" />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium">Issue</span>
            <textarea rows={5} className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground" placeholder="Describe your issue..." />
          </label>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-display text-base font-semibold text-primary-foreground">
            <Send className="h-4 w-4" />
            Send request
          </button>
        </div>
      </div>
    </NestedPage>
  );
}
