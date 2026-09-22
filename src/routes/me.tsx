import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Mail, ShieldCheck, Sparkles, Star, UserRound } from "lucide-react";
import { NestedPage } from "@/components/vibe/app-shell";
import { useAuth, DEMO_ACCOUNT } from "@/hooks/use-auth";

export const Route = createFileRoute("/me")({
  component: MePage,
});

function MePage() {
  const { user } = useAuth();
  const demoUser = user ?? { email: DEMO_ACCOUNT.email, user_metadata: { full_name: DEMO_ACCOUNT.displayName } };

  return (
    <NestedPage title="Profile" fallbackTo="/">
      <div className="space-y-6 px-4 pb-10 pt-20">
        <div className="glass rounded-[30px] border border-border/60 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-2xl font-semibold">
                  {demoUser.user_metadata?.full_name ?? DEMO_ACCOUNT.displayName}
                </p>
                <p className="text-sm text-muted-foreground">{demoUser.email ?? DEMO_ACCOUNT.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-2.5 py-1.5 text-xs font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" />
              Verified
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-surface p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
              <p className="mt-2 text-lg font-semibold">Active</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rating</p>
              <p className="mt-2 text-lg font-semibold">4.9</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-[30px] border border-border/60 p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <p className="font-display text-lg font-semibold">Account status</p>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-success" /> Verified account</li>
            <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-success" /> Email verified</li>
            <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-success" /> Listing approved</li>
            <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-success" /> Payment status cleared</li>
          </ul>
        </div>

        <div className="glass rounded-[30px] border border-border/60 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <p className="font-display text-lg font-semibold">Highlights</p>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-3">
              <span className="flex items-center gap-2"><Star className="h-4 w-4 text-accent" /> Featured</span>
              <span className="font-semibold text-foreground">Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-3">
              <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> Email</span>
              <span className="font-semibold text-foreground">demo@naivibe.app</span>
            </div>
          </div>
        </div>

        <Link to="/onboarding" className="block rounded-2xl bg-primary px-5 py-3 text-center font-display text-base font-semibold text-primary-foreground">
          Edit profile
        </Link>
      </div>
    </NestedPage>
  );
}
