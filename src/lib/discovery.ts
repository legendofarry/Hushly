import { DEMO_PROFILES, DEMO_TAGS } from "@/lib/demo-data";

export type DiscoveryProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  age: number | null;
  gender: string | null;
  bio: string | null;
  location_area: string | null;
  location_label: string | null;
  location_precision: "exact" | "approximate";
  is_featured: boolean;
  popularity_score: number;
  view_count: number;
  last_active_at: string;
  created_at: string;
  relationship_goal: string | null;
  seeking: string[];
  photos: { url: string; storage_path: string | null; is_main: boolean; position: number }[];
  tags: { slug: string; label: string; emoji: string | null; category: string }[];
};

export type DiscoveryFilters = {
  query?: string | undefined;
  gender?: string | undefined;
  minAge?: number | undefined;
  maxAge?: number | undefined;
  tags?: string[];
  relationshipGoal?: string | undefined;
  sort?: "recent" | "new" | "popular" | "featured" | undefined;
  area?: string | undefined;
  limit?: number | undefined;
};

const demoProfiles = DEMO_PROFILES.map((profile) => ({
  id: profile.id,
  username: profile.username,
  display_name: profile.display_name,
  age: profile.age,
  gender: profile.gender,
  bio: profile.bio,
  location_area: profile.location_area,
  location_label: profile.location_label,
  location_precision: profile.location_precision as DiscoveryProfile["location_precision"],
  is_featured: profile.is_featured,
  popularity_score: profile.popularity_score,
  view_count: profile.view_count,
  last_active_at: profile.last_active_at,
  created_at: profile.created_at,
  relationship_goal: profile.relationship_goal,
  seeking: profile.seeking,
  photos: profile.photos.map((url, index) => ({
    url,
    storage_path: null,
    is_main: index === 0,
    position: index,
  })),
  tags: profile.tags
    .map((slug) => DEMO_TAGS.find((tag) => tag.slug === slug))
    .filter((tag): tag is (typeof DEMO_TAGS)[number] => Boolean(tag))
    .map((tag) => ({
      slug: tag.slug,
      label: tag.label,
      emoji: tag.emoji,
      category: tag.category,
    })),
})) satisfies DiscoveryProfile[];

function applyDemoFilters(rows: DiscoveryProfile[], filters: DiscoveryFilters) {
  let data = [...rows];

  if (filters.gender && filters.gender !== "any") {
    data = data.filter((profile) => profile.gender?.toLowerCase() === filters.gender?.toLowerCase());
  }
  if (filters.minAge) {
    data = data.filter((profile) => (profile.age ?? 0) >= filters.minAge!);
  }
  if (filters.maxAge) {
    data = data.filter((profile) => (profile.age ?? 0) <= filters.maxAge!);
  }
  if (filters.relationshipGoal && filters.relationshipGoal !== "any") {
    data = data.filter((profile) =>
      profile.relationship_goal?.toLowerCase() === filters.relationshipGoal?.toLowerCase(),
    );
  }
  if (filters.area) {
    data = data.filter((profile) =>
      profile.location_area?.toLowerCase().includes(filters.area!.toLowerCase()),
    );
  }
  if (filters.tags && filters.tags.length > 0) {
    const wanted = new Set(filters.tags);
    data = data.filter((profile) => profile.tags.some((tag) => wanted.has(tag.slug)));
  }

  switch (filters.sort) {
    case "new":
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case "popular":
      data.sort((a, b) => b.popularity_score - a.popularity_score);
      break;
    case "featured":
      data = data.filter((profile) => profile.is_featured).sort((a, b) => b.popularity_score - a.popularity_score);
      break;
    default:
      data.sort((a, b) => new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime());
      break;
  }

  return data.slice(0, filters.limit ?? 60);
}

/** Words that shouldn't drive matching. */
const STOP_WORDS = new Set([
  "a","an","the","and","or","for","with","who","that","likes","like","love","loves",
  "someone","people","person","looking","into","in","of","to","me","my","is","are","i",
]);

export function tokenize(query: string) {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Discovery ranks candidates instead of doing a raw keyword match: query words
 * are matched against username, name, bio, tags, gender, goal and location and
 * every hit adds an explainable amount of score.
 */
export function scoreProfile(profile: DiscoveryProfile, tokens: string[]) {
  if (tokens.length === 0) return { score: 0, reasons: [] as string[] };
  let score = 0;
  const reasons: string[] = [];

  for (const token of tokens) {
    if (profile.username?.toLowerCase().includes(token)) {
      score += 6;
      reasons.push(`username matches "${token}"`);
    }
    if (profile.display_name?.toLowerCase().includes(token)) {
      score += 4;
      reasons.push(`name matches "${token}"`);
    }
    const tagHit = profile.tags.find(
      (t) => t.slug.includes(token) || t.label.toLowerCase().includes(token),
    );
    if (tagHit) {
      score += 5;
      reasons.push(`interested in ${tagHit.label}`);
    }
    if (profile.bio?.toLowerCase().includes(token)) {
      score += 2;
      reasons.push(`bio mentions "${token}"`);
    }
    if (profile.gender?.toLowerCase().includes(token)) {
      score += 3;
      reasons.push(`${profile.gender}`);
    }
    if (profile.relationship_goal?.toLowerCase().includes(token)) {
      score += 3;
      reasons.push(`looking for ${profile.relationship_goal}`);
    }
    if (profile.location_area?.toLowerCase().includes(token)) {
      score += 4;
      reasons.push(`based in ${profile.location_area}`);
    }
  }

  return { score, reasons: [...new Set(reasons)].slice(0, 3) };
}

export type RankedProfile = DiscoveryProfile & { matchReasons: string[] };

export async function fetchProfiles(filters: DiscoveryFilters = {}): Promise<RankedProfile[]> {
  const rows = applyDemoFilters(demoProfiles, filters);
  const tokens = tokenize(filters.query ?? "");

  if (tokens.length === 0) {
    return rows.map((profile) => ({ ...profile, matchReasons: [] }));
  }

  return rows
    .map((profile) => {
      const { score, reasons } = scoreProfile(profile, tokens);
      return { ...profile, matchReasons: reasons, score };
    })
    .filter((profile) => profile.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ score, ...profile }) => ({ ...profile, matchReasons: profile.matchReasons }));
}

export async function fetchProfileByUsername(username: string): Promise<DiscoveryProfile | null> {
  const normalized = username.toLowerCase();
  return demoProfiles.find((profile) => profile.username?.toLowerCase() === normalized) ?? null;
}

export async function fetchTags() {
  return DEMO_TAGS;
}

export function activityLabel(lastActive: string) {
  const diff = Date.now() - new Date(lastActive).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 15) return "Active now";
  if (mins < 60) return "Active today";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return "Active today";
  const days = Math.floor(hours / 24);
  if (days < 7) return `Active ${days}d ago`;
  if (days < 30) return "Active this month";
  return "Away";
}

export function isRecentlyActive(lastActive: string) {
  return Date.now() - new Date(lastActive).getTime() < 1000 * 60 * 60 * 24 * 2;
}

export function isNewProfile(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 1000 * 60 * 60 * 24 * 14;
}
