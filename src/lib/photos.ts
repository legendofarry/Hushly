import { supabase } from "@/integrations/supabase/client";

const BUCKET = "profile-photos";
const cache = new Map<string, string>();

/**
 * Photos live in a private bucket, so stored paths are resolved to short-lived
 * signed URLs. Absolute URLs (illustrations, seeded imagery) pass straight through.
 */
export async function resolvePhotoUrl(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }
  const cached = cache.get(value);
  if (cached) return cached;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(value, 60 * 60 * 6);
  if (!data?.signedUrl) return null;
  cache.set(value, data.signedUrl);
  return data.signedUrl;
}

export async function resolvePhotoUrls(values: (string | null | undefined)[]) {
  return Promise.all(values.map((v) => resolvePhotoUrl(v)));
}

export async function uploadProfilePhoto(userId: string, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp", "gif", "heic"];
  if (!allowed.includes(ext)) throw new Error("Please choose a JPG, PNG or WEBP image.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Images must be smaller than 10MB.");
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function removeProfilePhoto(path: string) {
  if (!path.startsWith("http")) {
    await supabase.storage.from(BUCKET).remove([path]);
  }
  cache.delete(path);
}
