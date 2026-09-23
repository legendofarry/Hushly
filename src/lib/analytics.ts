/** Privacy-conscious event logging: no PII, only event name + coarse properties. */
export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  subjectId?: string,
) {
  try {
    const payload = {
      event_name: eventName,
      properties,
      subject_id: subjectId ?? null,
      user_id: null,
      tracked_at: new Date().toISOString(),
    };
    const key = "hushly.analytics.events";
    const existing = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    existing.push(payload);
    window.localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    /* analytics must never break the app */
  }
}
