import { supabase } from "@/integrations/supabase/client";

/** Privacy-conscious event logging: no PII, only event name + coarse properties. */
export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  subjectId?: string,
) {
  try {
    const { data } = await supabase.auth.getSession();
    await supabase.from("analytics_events").insert({
      event_name: eventName,
      properties: properties as never,
      subject_id: subjectId ?? null,
      user_id: data.session?.user.id ?? null,
    });
  } catch {
    /* analytics must never break the app */
  }
}
