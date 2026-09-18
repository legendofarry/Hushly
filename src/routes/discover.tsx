import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { AppPage } from "@/components/vibe/app-shell";
import { ProfileCard } from "@/components/vibe/profile-card";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/vibe/states";
import { fetchProfiles, fetchTags, type DiscoveryFilters } from "@/lib/discovery";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover members — naiVibe" },
      {
        name: "description",
        content:
          "Search naiVibe by vibe, interest, username or location and filter by age, gender, tags and relationship goals.",
      },
      { property: "og:title", content: "Discover members on naiVibe" },
      { property: "og:description", content: "Smart search that explains every match." },
    ],
  }),
  component: Discover,
});

const GOALS = ["any", "friendship", "dating", "long-term", "casual", "networking"];
const GENDERS = ["any", "woman", "man", "non-binary"];
const SORTS = [
  { key: "recent", label: "Recently active" },
  { key: "new", label: "New" },
  { key: "popular", label: "Popular" },
  { key: "featured", label: "Featured" },
] as const;

function Discover() {
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState(false);
  const [filters, setFilters] = useState<DiscoveryFilters>({ sort: "recent" });

  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: fetchTags });
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["discover", query, filters],
    queryFn: () => {
      void trackEvent("discovery_search", { has_query: query.length > 0, sort: filters.sort });
      return fetchProfiles({ ...filters, query });
    },
  });

  const activeTags = filters.tags ?? [];
  const toggleTag = (slug: string) =>
    setFilters((f) => ({
      ...f,
      tags: activeTags.includes(slug) ? activeTags.filter((t) => t !== slug) : [...activeTags, slug],
    }));

  const activeCount =
    (filters.gender && filters.gender !== "any" ? 1 : 0) +
    (filters.relationshipGoal && filters.relationshipGoal !== "any" ? 1 : 0) +
    (filters.minAge || filters.maxAge ? 1 : 0) +
    activeTags.length +
    (filters.area ? 1 : 0);

  return (
    <AppPage>
      <div className="glass sticky top-0 z-30 space-y-3 border-b border-border/60 px-4 pb-3 pt-6">
        <h1 className="font-display text-2xl font-bold">Discover</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “loves travel in Westlands”"
              className="w-full rounded-2xl border border-input bg-surface py-3.5 pl-12 pr-4 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <button
            onClick={() => setSheet(true)}
            className="relative flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-border bg-surface"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeCount > 0 && (
              <span className="vibe-gradient absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setFilters((f) => ({ ...f, sort: s.key }))}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                filters.sort === s.key
                  ? "vibe-gradient text-primary-foreground"
                  : "border border-border bg-surface text-muted-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {isLoading ? (
          <CardGridSkeleton count={6} />
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No members match that yet"
            description="Try a different word, widen your filters, or check back soon — naiVibe is growing every day."
            action={
              <button
                onClick={() => {
                  setQuery("");
                  setFilters({ sort: "recent" });
                }}
                className="rounded-2xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold"
              >
                Clear search
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {data!.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        )}
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
          <button
            aria-label="Close filters"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setSheet(false)}
          />
          <div className="animate-slide-up safe-bottom relative max-h-[82vh] w-full overflow-y-auto rounded-t-3xl border-t border-border bg-surface p-5">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Filters</h2>
              <button onClick={() => setSheet(false)} aria-label="Close">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <p className="mt-5 text-sm font-medium">Gender</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <Chip
                  key={g}
                  active={(filters.gender ?? "any") === g}
                  onClick={() => setFilters((f) => ({ ...f, gender: g }))}
                >
                  {g}
                </Chip>
              ))}
            </div>

            <p className="mt-5 text-sm font-medium">Age range</p>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={18}
                max={99}
                placeholder="18"
                value={filters.minAge ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, minAge: e.target.value ? Number(e.target.value) : undefined }))
                }
                className="w-24 rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="number"
                min={18}
                max={99}
                placeholder="99"
                value={filters.maxAge ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxAge: e.target.value ? Number(e.target.value) : undefined }))
                }
                className="w-24 rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
              />
            </div>

            <p className="mt-5 text-sm font-medium">Area</p>
            <input
              value={filters.area ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, area: e.target.value || undefined }))}
              placeholder="Westlands, Kilimani…"
              className="mt-2 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
            />

            <p className="mt-5 text-sm font-medium">Looking for</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <Chip
                  key={g}
                  active={(filters.relationshipGoal ?? "any") === g}
                  onClick={() => setFilters((f) => ({ ...f, relationshipGoal: g }))}
                >
                  {g}
                </Chip>
              ))}
            </div>

            <p className="mt-5 text-sm font-medium">Interests &amp; tags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(tags ?? []).map((t) => (
                <Chip key={t.slug} active={activeTags.includes(t.slug)} onClick={() => toggleTag(t.slug)}>
                  {t.emoji} {t.label}
                </Chip>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setFilters({ sort: filters.sort })}
                className="flex-1 rounded-2xl border border-border px-5 py-3.5 text-sm font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => setSheet(false)}
                className="vibe-gradient flex-1 rounded-2xl px-5 py-3.5 text-sm font-semibold text-primary-foreground"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </AppPage>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-2 text-xs font-medium capitalize transition-colors",
        active
          ? "vibe-gradient text-primary-foreground"
          : "border border-border bg-background text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
