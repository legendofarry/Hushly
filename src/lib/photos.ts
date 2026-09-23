const cache = new Map<string, string>();

/**
 * This app runs entirely from local demo data, so photo URLs are used directly.
 * No remote storage layer is required on the frontend.
 */
export async function resolvePhotoUrl(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }
  const cached = cache.get(value);
  if (cached) return cached;
  cache.set(value, value);
  return value;
}

export async function resolvePhotoUrls(values: (string | null | undefined)[]) {
  return Promise.all(values.map((v) => resolvePhotoUrl(v)));
}

export async function uploadProfilePhoto(_userId: string, file: File) {
  const url = URL.createObjectURL(file);
  return url;
}

export async function removeProfilePhoto(_path: string) {
  return;
}
