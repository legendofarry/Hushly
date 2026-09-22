import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { NestedPage } from "@/components/vibe/app-shell";
import { readEscortPayment, writeEscortPayment } from "@/lib/escort";

const price = "KSH 500";
const mpesaNumber = "0715938110";

export const Route = createFileRoute("/membership")({
  component: MembershipPage,
});

function MembershipPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    plan: "escort-monthly",
    realName: "",
    paymentMessage: "",
    proofType: "image",
    proofText: "",
    proofImage: "",
  });

  useEffect(() => {
    const saved = readEscortPayment();
    if (saved) setForm((prev) => ({ ...prev, ...saved }));
  }, []);

  const canSubmit = useMemo(() => {
    return (
      form.realName.trim().length > 1 &&
      (form.proofType === "text" ? form.proofText.trim().length > 0 : form.proofImage.trim().length > 0)
    );
  }, [form]);

  const handleImage = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, proofImage: String(reader.result ?? "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      toast.error("Add your real name and a valid payment proof before submitting.");
      return;
    }

    const payload = {
      ...form,
      amount: price,
      status: "pending",
      createdAt: new Date().toISOString(),
      mpesaNumber,
    };

    writeEscortPayment(payload);
    toast.success("Payment request submitted for review.");
    navigate({ to: "/onboarding" });
  };

  return (
    <NestedPage title="Membership" fallbackTo="/">
      <div className="space-y-6 px-4 pb-8 pt-20">
        <div className="glass rounded-[28px] border border-border/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Plan</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">Escort listing</h2>
            </div>
            <div className="vibe-gradient rounded-2xl px-3 py-2 text-sm font-bold text-primary-foreground">
              {price}/mo
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Public escort profile approval
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Photo and bio profile setup
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Manual review before publication
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="glass rounded-[28px] border border-border/60 p-5">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent" />
              <p className="font-display text-lg font-semibold">Pay manually</p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Your real name</span>
                <input
                  value={form.realName}
                  onChange={(e) => setForm((prev) => ({ ...prev, realName: e.target.value }))}
                  className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                  placeholder="Enter your full legal name"
                />
              </label>

              <div className="rounded-2xl border border-border bg-surface/70 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Mpesa details</p>
                <p className="mt-3 text-base font-semibold">Send payment to {mpesaNumber}</p>
                <p className="mt-1 text-sm text-muted-foreground">Reference: {price} Escort Listing</p>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">Payment message</span>
                <textarea
                  value={form.paymentMessage}
                  onChange={(e) => setForm((prev) => ({ ...prev, paymentMessage: e.target.value }))}
                  rows={3}
                  className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                  placeholder="Paste the exact payment message you sent or the transaction note"
                />
              </label>

              <div className="space-y-2">
                <p className="text-sm font-medium">Proof source</p>
                <div className="flex gap-2">
                  {(["image", "text"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, proofType: type }))}
                      className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                        form.proofType === type
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-surface text-muted-foreground"
                      }`}
                    >
                      {type === "image" ? "Image proof" : "Text proof"}
                    </button>
                  ))}
                </div>
              </div>

              {form.proofType === "image" ? (
                <label className="block rounded-2xl border border-dashed border-border bg-surface p-4">
                  <span className="mb-2 block text-sm font-medium">Upload payment receipt</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImage(event.target.files?.[0])}
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-xl file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
                  />
                  {form.proofImage && <p className="mt-3 text-xs text-success">Receipt attached</p>}
                </label>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Paste proof details</span>
                  <textarea
                    value={form.proofText}
                    onChange={(e) => setForm((prev) => ({ ...prev, proofText: e.target.value }))}
                    rows={3}
                    className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                    placeholder="Transaction ID, timestamp, or payment note"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="glass rounded-[28px] border border-border/60 p-5">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Your request will be reviewed before publication.
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 font-display text-base font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit listing request
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="glass flex items-center gap-3 rounded-[28px] border border-border/60 p-4 text-sm text-muted-foreground">
          <BadgeCheck className="h-5 w-5 text-success" />
          Payment is handled manually and never through the app.
        </div>
      </div>
    </NestedPage>
  );
}
