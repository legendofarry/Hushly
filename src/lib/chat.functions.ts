import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ReplyResult = { replied: boolean; error?: string };

export const requestSampleReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { matchId: string }) => {
    if (!input || typeof input.matchId !== "string" || !/^[0-9a-f-]{36}$/i.test(input.matchId)) {
      throw new Error("Invalid match");
    }
    return { matchId: input.matchId };
  })
  .handler(async ({ data, context }): Promise<ReplyResult> => {
    const { supabase, userId } = context;

    // RLS: the caller can only read matches they belong to.
    const { data: match } = await supabase.from("matches").select("*").eq("id", data.matchId).maybeSingle();
    if (!match) return { replied: false, error: "Match not found" };

    const { data: people } = await supabase
      .from("profiles")
      .select("id, user_id, name, bio, job, city, interests, is_demo, demo_persona")
      .in("id", [match.profile_a, match.profile_b]);
    const me = people?.find((p) => p.user_id === userId);
    const sample = people?.find((p) => p.is_demo);
    if (!me || !sample) return { replied: false };

    const { data: history } = await supabase
      .from("messages")
      .select("sender_id, body, created_at")
      .eq("match_id", match.id)
      .order("created_at", { ascending: false })
      .limit(20);
    const ordered = (history ?? []).reverse();
    const last = ordered.at(-1);
    if (!last || last.sender_id !== me.id) return { replied: false };

    const transcript = ordered
      .map((m) => `${m.sender_id === sample.id ? sample.name : me.name || "Them"}: ${m.body}`)
      .join("\n");

    let reply = "";
    try {
      const { generateResponse } = await import("@lovable.dev/ai-gateway");
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions:
          `You are ${sample.name}, a person chatting on the dating app Hushly. Persona: ${sample.demo_persona ?? ""}. ` +
          `Job: ${sample.job}. City: ${sample.city}. Interests: ${(sample.interests ?? []).join(", ")}. Bio: ${sample.bio}. ` +
          `Reply as ${sample.name} to the latest message in a natural, flirty-but-respectful, texting style. ` +
          `Keep it to 1-2 short sentences, sometimes ask a question back. Never mention being an AI. Keep things friendly and PG-13; ` +
          `if asked for explicit content, money, or personal contact details, politely steer the chat elsewhere. Output only the message text.`,
        input: `Conversation so far:\n${transcript}\n\nWrite ${sample.name}'s next message.`,
        max_output_tokens: 400,
      });
      for (const item of res.output ?? []) {
        if (item.type === "message") {
          for (const c of item.content) {
            if (c.type === "output_text") reply += c.text;
          }
        }
      }
    } catch (err) {
      console.error("sample reply failed", err);
      return { replied: false, error: "Reply unavailable" };
    }

    reply = reply.trim().replace(/^"|"$/g, "").slice(0, 1000);
    if (!reply) return { replied: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("messages")
      .insert({ match_id: match.id, sender_id: sample.id, body: reply });
    if (error) {
      console.error(error);
      return { replied: false, error: "Could not send reply" };
    }
    return { replied: true };
  });
