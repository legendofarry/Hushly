import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/hushly/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — Hushly" },
      { name: "description", content: "Set a new password for your Hushly account." },
      { property: "og:title", content: "Choose a new password — Hushly" },
      { property: "og:description", content: "Set a new password for your Hushly account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const hasRecovery = window.location.hash.includes("type=recovery");
    supabase.auth.getSession().then(({ data }) => setReady(hasRecovery || !!data.session));
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/discover", replace: true });
  }

  return (
    <div className="noise-bg flex min-h-screen flex-col items-center justify-center bg-background px-5">
      <Logo size="lg" className="mb-8" />
      <form onSubmit={submit} className="glass w-full max-w-md rounded-3xl border border-border p-7 shadow-card">
        <h1 className="text-2xl font-extrabold">Choose a new password</h1>
        {!ready ? (
          <p className="mt-3 text-sm text-muted-foreground">Open this page from the reset link in your email.</p>
        ) : (
          <div className="mt-5 grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="pw">New password</Label>
              <Input id="pw" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <button disabled={busy} className="bg-brand h-12 rounded-full font-bold text-primary-foreground shadow-glow disabled:opacity-60">
              Save password
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
