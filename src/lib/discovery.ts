import { supabase } from "@/integrations/supabase/client";

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
  query?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  tags?: string[];
  relationshipGoal?: string;
  sort?: "recent" | "new" | "popular" | "featured";
  area?: string;
  limit?: number;
};

const SELECT = `
  id, username, display_name, age, gender, bio, location_area, location_label,
  location_precision, is_featured, popularity_score, view_count, last_active_at,
  created_at, relationship_goal, seeking,
  profile_photos ( url, storage_path, is_main, position ),
  profile_tags ( tags ( slug, label, emoji, category ) )
`;

type RawRow = Record<string, unknown>;

function shape(row: RawRow): DiscoveryProfile {
  const photos = ((row["profile_photos"] as RawRow[] | null) ?? [])
    .map((p) => ({
      url: String(p["url"] ?? ""),
      storage_path: (p["storage_path"] as string | null) ?? null,
      is_main: Boolean(p["is_main"]),
      position: Number(p["position"] ?? 0),
    }))
    .sort((a, b) => Number(b.is_main) - Number(a.is_main) || a.position - b.position);

  const tags = ((row["profile_tags"] as RawRow[] | null) ?? [])
    .map((pt) => pt["tags"] as RawRow | null)
    .filter(Boolean)
    .map((t) => ({
      slug: String(t!["slug"]),
      label: String(t!["label"]),
      emoji: (t!["emoji"] as string | null) ?? null,
      category: String(t!["category"] ?? "interest"),
    }));

  return {
    id: String(row["id"]),
    username: (row["username"] as string | null) ?? null,
    display_name: (row["display_name"] as string | null) ?? null,
    age: (row["age"] as number | null) ?? null,
    gender: (row["gender"] as string | null) ?? null,
    bio: (row["bio"] as string | null) ?? null,
    location_area: (row["location_area"] as string | null) ?? null,
    location_label: (row["location_label"] as string | null) ?? null,
    location_precision: (row["location_precision"] as "exact" | "approximate") ?? "approximate",
    is_featured: Boolean(row["is_featured"]),
    popularity_score: Number(row["popularity_score"] ?? 0),
    view_count: Number(row["view_count"] ?? 0),
    last_active_at: String(row["last_active_at"]),
    created_at: String(row["created_at"]),
    relationship_goal: (row["relationship_goal"] as string | null) ?? null,
    seeking: ((row["seeking"] as string[] | null) ?? []) as string[],
    tags,
    photos,
  };
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
  let q = supabase
    .from("profiles")
    .select(SELECT)
    .eq("is_published", true)
    .eq("visibility", "public");

  if (filters.gender && filters.gender !== "any") q = q.eq("gender", filters.gender);
  if (filters.minAge) q = q.gte("age", filters.minAge);
  if (filters.maxAge) q = q.lte("age", filters.maxAge);
  if (filters.relationshipGoal && filters.relationshipGoal !== "any") {
    q = q.eq("relationship_goal", filters.relationshipGoal);
  }
  if (filters.area) q = q.ilike("location_area", `%${filters.area}%`);
  if (filters.sort === "featured") q = q.eq("is_featured", true);

  switch (filters.sort) {
    case "new":
      q = q.order("created_at", { ascending: false });
      break;
    case "popular":
      q = q.order("popularity_score", { ascending: false });
      break;
    default:
      q = q.order("last_active_at", { ascending: false });
  }

  const { data, error } = await q.limit(filters.limit ?? 60);
  if (error) throw error;

  let rows = (data ?? []).map((r) => shape(r as RawRow));

  if (filters.tags && filters.tags.length > 0) {
    const wanted = new Set(filters.tags);
    rows = rows.filter((p) => p.tags.some((t) => wanted.has(t.slug)));
  }

  const tokens = tokenize(filters.query ?? "");
  if (tokens.length === 0) {
    return rows.map((p) => ({ ...p, matchReasons: [] }));
  }

  return rows
    .map((p) => {
      const { score, reasons } = scoreProfile(p, tokens);
      return { profile: p, score, reasons };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => ({ ...r.profile, matchReasons: r.reasons }));
}

export async function fetchProfileByUsername(username: string): Promise<DiscoveryProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(SELECT)
    .ilike("username", username)
    .maybeSingle();
  if (error) throw error;
  return data ? shape(data as RawRow) : null;
}

export async function fetchTags() {
  const { data, error } = await supabase
    .from("tags")
    .select("slug, label, emoji, category")
    .eq("is_active", true)
    .order("label");
  if (error) throw error;
  return data ?? [];
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
