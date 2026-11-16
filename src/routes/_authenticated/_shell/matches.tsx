import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { myProfileQuery } from "@/lib/hushly";
import { MatchesPanel } from "@/components/hushly/MatchesPanel";

export const Route = createFileRoute("/_authenticated/_shell/matches")({
  head: () => ({
    meta: [
      { title: "Matches & chats — Hushly" },
      { name: "description", content: "Your Hushly matches and conversations." },
      { property: "og:title", content: "Matches & chats — Hushly" },
      { property: "og:description", content: "Your Hushly matches and conversations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const { data: me } = useSuspenseQuery(myProfileQuery());
  if (!me) return null;
  return (
    <div className="mx-auto w-full max-w-xl flex-1 overflow-y-auto">
      <MatchesPanel me={me} />
    </div>
  );
}
