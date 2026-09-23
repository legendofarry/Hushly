import { Link } from "@tanstack/react-router";
import { MapPin, Sparkles, Star } from "lucide-react";
import { Photo } from "./photo";
import {
  activityLabel,
  isNewProfile,
  isRecentlyActive,
  type RankedProfile,
  type DiscoveryProfile,
} from "@/lib/discovery";
import { cn } from "@/lib/utils";

type Props = {
  profile: DiscoveryProfile | RankedProfile;
  className?: string;
  compact?: boolean;
};

export function ProfileCard({ profile, className, compact }: Props) {
  const main = profile.photos[0];
  const reasons = "matchReasons" in profile ? profile.matchReasons : [];
  const active = isRecentlyActive(profile.last_active_at);

  return (
    <Link
      to="/discover"
      className={cn(
        "group relative block overflow-hidden rounded-3xl border border-border/60 bg-surface shadow-lg transition-transform duration-300 active:scale-[0.98]",
        compact ? "w-[63vw] max-w-[240px] shrink-0" : "",
        className,
      )}
    >
      <div className="relative aspect-[3/4] w-full">
        <Photo path={main?.storage_path ?? main?.url} alt={profile.display_name ?? "Member"} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {profile.is_featured && (
            <span className="vibe-gradient flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
              <Star className="h-3 w-3" fill="currentColor" /> Featured
            </span>
          )}
          {isNewProfile(profile.created_at) && (
            <span className="glass flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-semibold">
              <Sparkles className="h-3 w-3 text-accent" /> New
            </span>
          )}
        </div>

        {active && (
          <span className="glass absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-success" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            {activityLabel(profile.last_active_at)}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <div className="flex items-baseline gap-1.5">
            <h3 className="truncate font-display text-lg font-semibold">
              {profile.display_name ?? profile.username}
            </h3>
            {profile.age && <span className="text-lg font-medium text-foreground/85">{profile.age}</span>}
          </div>
          <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
          {profile.location_area && (
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-foreground/75">
              <MapPin className="h-3 w-3 text-primary" />
              {profile.location_area}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 p-3.5">
        {profile.bio && <p className="line-clamp-2 text-xs text-muted-foreground">{profile.bio}</p>}
        {profile.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.tags.slice(0, 3).map((t) => (
              <span
                key={t.slug}
                className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground"
              >
                {t.emoji} {t.label}
              </span>
            ))}
          </div>
        )}
        {reasons.length > 0 && (
          <p className="text-[11px] text-accent">Match: {reasons.join(" · ")}</p>
        )}
      </div>
    </Link>
  );
}
