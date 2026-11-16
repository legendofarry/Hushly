import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ageFrom, myProfileQuery } from "@/lib/hushly";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChoicePills, GENDER_OPTIONS, INTEREST_IN_OPTIONS, InterestPicker, PhotoGrid } from "@/components/hushly/ProfileFields";

export const Route = createFileRoute("/_authenticated/_shell/profile")({
  head: () => ({
    meta: [
      { title: "My profile — Hushly" },
      { name: "description", content: "Edit your Hushly photos, bio and preferences." },
      { property: "og:title", content: "My profile — Hushly" },
      { property: "og:description", content: "Edit your Hushly photos, bio and preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

type Gender = "woman" | "man" | "nonbinary";
type Into = "women" | "men" | "everyone";

function ProfilePage() {
  const { data: me } = useSuspenseQuery(myProfileQuery());
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(me?.name ?? "");
  const [gender, setGender] = useState<Gender>((me?.gender as Gender) ?? "woman");
  const [into, setInto] = useState<Into>((me?.interested_in as Into) ?? "everyone");
  const [photos, setPhotos] = useState<string[]>(me?.photos ?? []);
  const [interests, setInterests] = useState<string[]>(me?.interests ?? []);
  const [bio, setBio] = useState(me?.bio ?? "");
  const [job, setJob] = useState(me?.job ?? "");
  const [school, setSchool] = useState(me?.school ?? "");
  const [city, setCity] = useState(me?.city ?? "");

  if (!me) return null;

  async function save() {
    if (!me) return;
    if (!name.trim() || photos.length === 0) {
      toast.error("Add your name and at least one photo");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), gender, interested_in: into, photos, interests, bio: bio.trim(), job: job.trim(), school: school.trim(), city: city.trim() })
      .eq("id", me.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["me"] });
    qc.invalidateQueries({ queryKey: ["deck"] });
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-xl flex-1 overflow-y-auto px-5 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">{me.name}, {ageFrom(me.birthdate) ?? ""}</h1>
        <button onClick={signOut} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
      <div className="grid gap-7">
        <PhotoGrid value={photos} onChange={setPhotos} />
        <div className="grid gap-2"><Label htmlFor="pname">First name</Label><Input id="pname" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" /></div>
        <div className="grid gap-2"><Label htmlFor="pbio">About me</Label><Textarea id="pbio" value={bio} maxLength={300} rows={4} onChange={(e) => setBio(e.target.value)} className="rounded-2xl" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2"><Label htmlFor="pjob">Job</Label><Input id="pjob" value={job} maxLength={60} onChange={(e) => setJob(e.target.value)} className="h-12 rounded-xl" /></div>
          <div className="grid gap-2"><Label htmlFor="pschool">School</Label><Input id="pschool" value={school} maxLength={60} onChange={(e) => setSchool(e.target.value)} className="h-12 rounded-xl" /></div>
        </div>
        <div className="grid gap-2"><Label htmlFor="pcity">City</Label><Input id="pcity" value={city} maxLength={60} onChange={(e) => setCity(e.target.value)} className="h-12 rounded-xl" /></div>
        <div className="grid gap-3"><Label>I am a</Label><ChoicePills value={gender} onChange={setGender} options={GENDER_OPTIONS} /></div>
        <div className="grid gap-3"><Label>Show me</Label><ChoicePills value={into} onChange={setInto} options={INTEREST_IN_OPTIONS} /></div>
        <div className="grid gap-3"><Label>Interests</Label><InterestPicker value={interests} onChange={setInterests} /></div>
        <button onClick={save} disabled={busy} className="bg-brand inline-flex h-13 items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold text-primary-foreground shadow-glow disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
        </button>
      </div>
    </div>
  );
}
