import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAdult, myProfileQuery } from "@/lib/hushly";
import { Logo } from "@/components/hushly/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChoicePills, GENDER_OPTIONS, INTEREST_IN_OPTIONS, InterestPicker, PhotoGrid } from "@/components/hushly/ProfileFields";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile — Hushly" },
      { name: "description", content: "Add your photos, interests and a short bio to start matching on Hushly." },
      { property: "og:title", content: "Set up your profile — Hushly" },
      { property: "og:description", content: "Add your photos and interests to start matching." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context }) => {
    const me = await context.queryClient.ensureQueryData(myProfileQuery());
    if (me?.onboarded) throw redirect({ to: "/discover" });
    return me;
  },
  component: Onboarding,
});

type Gender = "woman" | "man" | "nonbinary";
type Into = "women" | "men" | "everyone";

function Onboarding() {
  const me = Route.useLoaderData();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(me?.name ?? "");
  const [birthdate, setBirthdate] = useState(me?.birthdate ?? "");
  const [gender, setGender] = useState<Gender>((me?.gender as Gender) ?? "woman");
  const [into, setInto] = useState<Into>((me?.interested_in as Into) ?? "everyone");
  const [photos, setPhotos] = useState<string[]>(me?.photos ?? []);
  const [interests, setInterests] = useState<string[]>(me?.interests ?? []);
  const [bio, setBio] = useState(me?.bio ?? "");
  const [job, setJob] = useState(me?.job ?? "");
  const [city, setCity] = useState(me?.city ?? "");

  const steps = [
    { title: "What's your first name?", valid: name.trim().length >= 1 && isAdult(birthdate) },
    { title: "Tell us about you", valid: true },
    { title: "Add your best photos", valid: photos.length >= 1 },
    { title: "What are you into?", valid: interests.length >= 1 },
  ];
  const total = steps.length;

  function go(n: number) {
    setDir(n > step ? 1 : -1);
    setStep(n);
  }

  async function finish() {
    if (!me) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name.trim(),
        birthdate,
        gender,
        interested_in: into,
        photos,
        interests,
        bio: bio.trim(),
        job: job.trim(),
        city: city.trim(),
        onboarded: true,
      })
      .eq("id", me.id);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    await qc.invalidateQueries({ queryKey: ["me"] });
    qc.removeQueries({ queryKey: ["deck"] });
    navigate({ to: "/discover", replace: true });
  }

  const maxBirth = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().slice(0, 10);

  return (
    <div className="noise-bg flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-xl items-center gap-3 px-5 pt-6">
        {step > 0 ? (
          <button onClick={() => go(step - 1)} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card/50" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <Logo size="sm" />
        )}
        <div className="flex flex-1 gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div className="bg-brand h-full" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
            </div>
          ))}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-8 pt-10">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <p className="text-sm font-semibold text-primary">Step {step + 1} of {total}</p>
            <h1 className="mt-1 text-4xl font-extrabold">{steps[step]?.title}</h1>

            {step === 0 && (
              <div className="mt-8 grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">First name</Label>
                  <Input id="name" autoFocus value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className="h-14 rounded-2xl text-lg" placeholder="Your first name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bday">Birthday</Label>
                  <Input id="bday" type="date" max={maxBirth} value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="h-14 rounded-2xl text-lg" />
                  <p className="text-xs text-muted-foreground">
                    {birthdate && !isAdult(birthdate) ? "You must be 18 or older to use Hushly." : "Only your age is shown on your profile."}
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mt-8 grid gap-7">
                <div className="grid gap-3">
                  <Label>I am a</Label>
                  <ChoicePills value={gender} onChange={setGender} options={GENDER_OPTIONS} />
                </div>
                <div className="grid gap-3">
                  <Label>Show me</Label>
                  <ChoicePills value={into} onChange={setInto} options={INTEREST_IN_OPTIONS} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="job">Job (optional)</Label>
                    <Input id="job" value={job} maxLength={60} onChange={(e) => setJob(e.target.value)} className="h-12 rounded-xl" placeholder="Designer" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="city">City (optional)</Label>
                    <Input id="city" value={city} maxLength={60} onChange={(e) => setCity(e.target.value)} className="h-12 rounded-xl" placeholder="Nairobi" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-8">
                <p className="mb-4 text-sm text-muted-foreground">Add at least one photo. Profiles with 3+ photos get way more matches.</p>
                <PhotoGrid value={photos} onChange={setPhotos} />
              </div>
            )}

            {step === 3 && (
              <div className="mt-8 grid gap-6">
                <InterestPicker value={interests} onChange={setInterests} />
                <div className="grid gap-2">
                  <Label htmlFor="bio">About me (optional)</Label>
                  <Textarea id="bio" value={bio} maxLength={300} onChange={(e) => setBio(e.target.value)} rows={4} className="rounded-2xl" placeholder="Two truths and a lie..." />
                  <p className="text-right text-xs text-muted-foreground">{bio.length}/300</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <button
          disabled={!steps[step]?.valid || busy}
          onClick={() => (step < total - 1 ? go(step + 1) : finish())}
          className="bg-brand mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full text-lg font-bold text-primary-foreground shadow-glow transition active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
        >
          {busy && <Loader2 className="h-5 w-5 animate-spin" />}
          {step < total - 1 ? "Continue" : "Start swiping"}
        </button>
      </main>
    </div>
  );
}
