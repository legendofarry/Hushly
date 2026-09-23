import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Crown, Heart, Search, Sparkles, Star, Zap } from "lucide-react";
import { AppPage } from "@/components/vibe/app-shell";
import { ProfileCard } from "@/components/vibe/profile-card";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/vibe/states";
import { fetchProfiles } from "@/lib/discovery";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hushly — meet real people, share your vibe" },
      {
        name: "description",
        content:
          "Discover new members, recently active singles, popular and featured profiles on Hushly, the 18+ dating and social discovery community.",
      },
      { property: "og:title", content: "Hushly — meet real people, share your vibe" },
      {
        property: "og:description",
        content: "Browse members free, create a profile in minutes and start real conversations.",
      },
    ],
  }),
  component: Home,
});

function Row({
  title,
  subtitle,
  sort,
}: {
  title: string;
  subtitle: string;
  sort: "new" | "recent" | "popular" | "featured";
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["profiles", sort],
    queryFn: () => fetchProfiles({ sort, limit: 12 }),
  });

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between px-4">
        <div>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Link to="/discover" className="text-xs font-semibold text-primary">
          See all
        </Link>
      </div>

      {isLoading ? (
        <div className="px-4">
          <CardGridSkeleton count={2} />
        </div>
      ) : error ? (
        <div className="px-4">
          <ErrorState onRetry={() => refetch()} />
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="px-4">
          <EmptyState
            title="Nobody here yet"
            description="Be one of the first members in this list — create your profile and get discovered."
            action={
              <Link
                to="/auth"
                className="vibe-gradient inline-flex rounded-2xl px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Create a profile
              </Link>
            }
          />
        </div>
      ) : (
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
          {data!.map((p) => (
            <ProfileCard key={p.id} profile={p} compact />
          ))}
        </div>
      )}
    </section>
  );
}

function Home() {
  const { user } = useAuth();

  return (
    <AppPage>
      <header className="relative overflow-hidden px-4 pb-6 pt-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-float absolute -left-20 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
          <div className="animate-float absolute -right-16 top-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl [animation-delay:1.2s]" />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl font-bold">
              <span className="vibe-text-gradient">Hushly</span>
            </p>
            {!user && (
              <Link
                to="/auth"
                className="rounded-2xl border border-border bg-surface px-4 py-2 text-xs font-semibold"
              >
                Sign in
              </Link>
            )}
          </div>

          <h1 className="animate-rise mt-7 font-display text-3xl font-bold leading-tight">
            Real people.
            <br />
            <span className="vibe-text-gradient">Real connections.</span>
          </h1>
          <p className="animate-rise mt-3 max-w-xs text-sm text-muted-foreground [animation-delay:80ms]">
            Browse members freely. Create a profile when you&apos;re ready to be discovered.
          </p>

          <Link
            to="/discover"
            className="animate-rise glass mt-6 flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3.5 text-sm text-muted-foreground [animation-delay:140ms]"
          >
            <Search className="h-5 w-5 text-primary" />
            Search by vibe, interest or username…
          </Link>

          <div className="animate-rise mt-4 grid grid-cols-2 gap-3 [animation-delay:200ms]">
            <Link
              to={user ? "/onboarding" : "/auth"}
              className="vibe-gradient flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl transition-transform active:scale-[0.97]"
            >
              <Heart className="h-4 w-4" fill="currentColor" />
              {user ? "Finish profile" : "Join Hushly"}
            </Link>
            <Link
              to="/membership"
              className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-semibold transition-transform active:scale-[0.97]"
            >
              <Crown className="h-4 w-4 text-accent" />
              Go premium
            </Link>
          </div>
        </div>
      </header>

      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4">
        {[
          { icon: Zap, title: "Live beta soon", text: "Opt in during onboarding to be invited first." },
          { icon: Star, title: "Featured members", text: "Get seen by more people with premium." },
          { icon: Sparkles, title: "Smart discovery", text: "Search by vibe — we explain every match." },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="glass w-64 shrink-0 rounded-3xl border border-border/60 p-4"
          >
            <Icon className="h-5 w-5 text-accent" />
            <p className="mt-2 font-display text-sm font-semibold">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>

      <Row title="New on Hushly" subtitle="Members who just joined" sort="new" />
      <Row title="Recently active" subtitle="Online in the last couple of days" sort="recent" />
      <Row title="Popular right now" subtitle="Most viewed profiles" sort="popular" />
      <Row title="Featured" subtitle="Handpicked members" sort="featured" />

      <footer className="mt-10 space-y-3 px-4 text-center text-xs text-muted-foreground">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/guidelines">Community</a>
          <a href="/safety">Safety</a>
          <Link to="/support">Support</Link>
        </div>
        <p>Hushly is for adults 18+. Date safely, respect everyone.</p>
      </footer>
    </AppPage>
  );
}
