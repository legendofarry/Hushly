import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type Message = Tables<"messages">;
export type MatchRow = Tables<"matches">;

export type MatchWithPeople = MatchRow & {
  other: Profile;
  lastMessage: Message | null;
  unread: number;
};

export const INTEREST_OPTIONS = [
  "Travel", "Coffee", "Music", "Hiking", "Cooking", "Art", "Books", "Dancing",
  "Fitness", "Yoga", "Photography", "Gaming", "Movies", "Dogs", "Cats", "Wine",
  "Football", "Fashion", "Beach", "Camping", "Poetry", "Tech", "Brunch", "Festivals",
];

export function ageFrom(birthdate: string | null | undefined): number | null {
  if (!birthdate) return null;
  const b = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export function isAdult(birthdate: string | null | undefined): boolean {
  const age = ageFrom(birthdate);
  return age !== null && age >= 18 && age <= 120;
}

export function firstPhoto(p: Pick<Profile, "photos"> | null | undefined): string | undefined {
  return p?.photos?.[0];
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in");
  return data.user.id;
}

export const myProfileQuery = () =>
  queryOptions({
    queryKey: ["me"],
    queryFn: async (): Promise<Profile | null> => {
      const uid = await requireUserId();
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

export const deckQuery = () =>
  queryOptions({
    queryKey: ["deck"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase.rpc("discover_profiles", { _limit: 20 });
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
    staleTime: Infinity,
  });

export const matchesQuery = (meId: string) =>
  queryOptions({
    queryKey: ["matches", meId],
    queryFn: async (): Promise<MatchWithPeople[]> => {
      const { data: matches, error } = await supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!matches?.length) return [];
      const otherIds = matches.map((m) => (m.profile_a === meId ? m.profile_b : m.profile_a));
      const ids = matches.map((m) => m.id);
      const [{ data: people, error: pErr }, { data: msgs, error: mErr }] = await Promise.all([
        supabase.from("profiles").select("*").in("id", otherIds),
        supabase
          .from("messages")
          .select("*")
          .in("match_id", ids)
          .order("created_at", { ascending: false })
          .limit(500),
      ]);
      if (pErr) throw pErr;
      if (mErr) throw mErr;
      const byId = new Map((people ?? []).map((p) => [p.id, p]));
      const result: MatchWithPeople[] = [];
      for (const m of matches) {
        const other = byId.get(m.profile_a === meId ? m.profile_b : m.profile_a);
        if (!other) continue;
        const mine = (msgs ?? []).filter((x) => x.match_id === m.id);
        result.push({
          ...m,
          other,
          lastMessage: mine[0] ?? null,
          unread: mine.filter((x) => x.sender_id !== meId && !x.read_at).length,
        });
      }
      return result.sort((a, b) => {
        const ta = new Date(a.last_message_at ?? a.created_at).getTime();
        const tb = new Date(b.last_message_at ?? b.created_at).getTime();
        return tb - ta;
      });
    },
  });

export const messagesQuery = (matchId: string) =>
  queryOptions({
    queryKey: ["messages", matchId],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

export async function findMatchWith(meId: string, otherId: string): Promise<MatchRow | null> {
  const [a, b] = meId < otherId ? [meId, otherId] : [otherId, meId];
  const { data } = await supabase
    .from("matches")
    .select("*")
    .eq("profile_a", a)
    .eq("profile_b", b)
    .maybeSingle();
  return data ?? null;
}

const FIVE_YEARS = 60 * 60 * 24 * 365 * 5;

export async function uploadProfilePhoto(file: File): Promise<string> {
  const uid = await requireUserId();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${uid}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("photos").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: sErr } = await supabase.storage.from("photos").createSignedUrl(path, FIVE_YEARS);
  if (sErr || !data) throw sErr ?? new Error("Could not create photo link");
  return data.signedUrl;
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
