import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Sparkles, UserRound, UploadCloud, Check, ChevronRight, LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { NestedPage } from "@/components/vibe/app-shell";
import {
  defaultEscortOnboarding,
  escortServices,
  escortTags,
  isUsernameAvailable,
  readEscortOnboarding,
  sanitizeUsername,
  writeEscortOnboarding,
  type EscortOnboarding,
} from "@/lib/escort";

const stepCount = 4;

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<EscortOnboarding>(defaultEscortOnboarding);
  const [usernameMessage, setUsernameMessage] = useState("Choose a unique username.");
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    const saved = readEscortOnboarding();
    if (saved) {
      setForm(saved);
      const status = isUsernameAvailable(saved.username, [saved.username]);
      setUsernameMessage(status.message);
    }
  }, []);

  useEffect(() => {
    if (!form.username) {
      setUsernameMessage("Choose a unique username.");
      return;
    }
    const status = isUsernameAvailable(form.username, [form.username]);
    setUsernameMessage(status.ok ? status.message : status.message);
  }, [form.username]);

  const currentStep = useMemo(() => {
    const steps = [
      {
        title: "Profile basics",
        subtitle: "Pick a username and core identity details.",
      },
      {
        title: "Contact details",
        subtitle: "Set your phone and WhatsApp details.",
      },
      {
        title: "Photos & bio",
        subtitle: "Show your style and describe your vibe.",
      },
      {
        title: "Services & pricing",
        subtitle: "Add your services, rates, keywords, and live beta preference.",
      },
    ];
    return steps[step] ?? steps[0]!;
  }, [step]);

  const validForStep = () => {
    switch (step) {
      case 0:
        return (
          !!form.username &&
          isUsernameAvailable(form.username, [form.username]).ok &&
          !!form.displayName &&
          !!form.age &&
          !!form.gender
        );
      case 1:
        return !!form.phone && form.phone.trim().length >= 8;
      case 2:
        return form.photos.length >= 2 && form.bio.trim().length > 20;
      case 3:
        return form.services.length > 0 && form.tags.length > 0;
      default:
        return true;
    }
  };

  const save = (next: EscortOnboarding) => {
    setForm(next);
    writeEscortOnboarding(next);
  };

  const nextStep = () => {
    if (step === 0 && !validForStep()) {
      toast.error("Complete your username and profile basics before continuing.");
      return;
    }
    if (step === 1 && !validForStep()) {
      toast.error("Add a valid phone number first.");
      return;
    }
    if (step === 2 && !validForStep()) {
      toast.error("Upload at least two photos and write a short bio.");
      return;
    }
    if (step === 3 && !validForStep()) {
      toast.error("Add at least one service and one tag.");
      return;
    }
    if (step < stepCount - 1) {
      setStep((prev) => prev + 1);
    } else {
      const final = { ...form, paymentStatus: "pending" as const };
      save(final);
      toast.success("Your escort profile is ready for review.");
      navigate({ to: "/" });
    }
  };

  const previousStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const useCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Location access is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prev) => ({
          ...prev,
          location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          locationPrecision: "exact",
        }));
        setLocationError("");
      },
      () => {
        setLocationError("Location permission was denied. You can still set your area manually.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files).slice(0, 6);
    Promise.all(
      images.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ""));
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
          }),
      ),
    )
      .then((results) => {
        setForm((prev) => ({ ...prev, photos: [...prev.photos, ...results].slice(0, 6) }));
      })
      .catch(() => toast.error("Some photos could not be processed."));
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((item) => item !== tag) : [...prev.tags, tag],
    }));
  };

  const toggleService = (service: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((item) => item !== service)
        : [...prev.services, service],
    }));
  };

  return (
    <NestedPage title="Onboarding" fallbackTo="/">
      <div className="space-y-6 px-4 pb-10 pt-20">
        <div className="glass rounded-[28px] border border-border/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Step {step + 1}</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">{currentStep.title}</h2>
            </div>
            <div className="rounded-full border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
              {step + 1}/{stepCount}
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{currentStep.subtitle}</p>

          <div className="mt-5 flex gap-2">
            {Array.from({ length: stepCount }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index <= step ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Username</span>
              <input
                value={form.username}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    username: sanitizeUsername(e.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                placeholder="yourname"
              />
              <span className={`mt-2 block text-xs ${usernameMessage.includes("available") ? "text-success" : "text-muted-foreground"}`}>
                {usernameMessage}
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Display name</span>
              <input
                value={form.displayName}
                onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
                className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                placeholder="Display name"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Age</span>
                <input
                  type="number"
                  min={18}
                  max={80}
                  value={form.age}
                  onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
                  className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                  placeholder="25"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">Gender</span>
                <select
                  value={form.gender}
                  onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                  className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                >
                  <option value="">Select</option>
                  <option value="Woman">Woman</option>
                  <option value="Man">Man</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Cell phone</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                placeholder="0712 345 678"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">WhatsApp number</span>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                  className="flex-1 rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                  placeholder="Optional"
                />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, whatsapp: prev.phone }))}
                  className="rounded-2xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground"
                >
                  Same as cell
                </button>
              </div>
            </label>

            <div className="glass rounded-[24px] border border-border/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-semibold">Location</p>
                  <p className="text-xs text-muted-foreground">Give a public area, not private coordinates.</p>
                </div>
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground"
                >
                  <LocateFixed className="h-4 w-4" />
                  Use current location
                </button>
              </div>

              <input
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="mt-4 w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                placeholder="Nairobi, Kenya"
              />

              <div className="mt-4 flex gap-2">
                {(["exact", "approximate"] as const).map((precision) => (
                  <button
                    key={precision}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, locationPrecision: precision }))}
                    className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-medium ${
                      form.locationPrecision === precision
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {precision === "exact" ? "Exact" : "Approximate"}
                  </button>
                ))}
              </div>

              {locationError && <p className="mt-3 text-xs text-destructive">{locationError}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block rounded-[24px] border border-dashed border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <UploadCloud className="h-5 w-5 text-accent" />
                <span className="font-medium">Upload photos</span>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => onFiles(event.target.files)}
                className="mt-4 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-xl file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary"
              />
            </label>

            {form.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {form.photos.map((photo, index) => (
                  <div key={`${photo}-${index}`} className="overflow-hidden rounded-[24px] border border-border bg-surface">
                    <img src={photo} alt={`Profile ${index + 1}`} className="h-36 w-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Bio</span>
              <textarea
                rows={5}
                value={form.bio}
                onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                placeholder="Tell people about your vibe, your style and what to expect."
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="glass rounded-[24px] border border-border/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <p className="font-display text-lg font-semibold">Services</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {escortServices.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`rounded-full border px-3 py-2 text-[11px] font-medium ${
                      form.services.includes(service)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-[24px] border border-border/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-accent" />
                <p className="font-display text-lg font-semibold">Pricing</p>
              </div>

              <div className="mb-4 flex gap-2">
                {(["call", "set"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, priceMode: mode }))}
                    className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-medium ${
                      form.priceMode === mode
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {mode === "call" ? "Call for price" : "Set price"}
                  </button>
                ))}
              </div>

              {form.priceMode === "set" && (
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Total price</span>
                    <input
                      value={form.totalPrice}
                      onChange={(e) => setForm((prev) => ({ ...prev, totalPrice: e.target.value }))}
                      placeholder="e.g. KSH 12,000"
                      className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Incalls / hour</span>
                      <input
                        value={form.incallRate}
                        onChange={(e) => setForm((prev) => ({ ...prev, incallRate: e.target.value }))}
                        placeholder="KSH 4,000"
                        className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Outcalls / hour</span>
                      <input
                        value={form.outcallRate}
                        onChange={(e) => setForm((prev) => ({ ...prev, outcallRate: e.target.value }))}
                        placeholder="KSH 5,000"
                        className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                      />
                    </label>
                  </div>
                </div>
              )}

              {form.priceMode === "call" && (
                <p className="text-sm text-muted-foreground">
                  Customers will need to call you for pricing. Add your hourly incall/outcall rates below if you want to show them.
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Incalls / hour from</span>
                  <input
                    value={form.incallRate}
                    onChange={(e) => setForm((prev) => ({ ...prev, incallRate: e.target.value }))}
                    placeholder="KSH 4,000"
                    className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Outcalls / hour from</span>
                  <input
                    value={form.outcallRate}
                    onChange={(e) => setForm((prev) => ({ ...prev, outcallRate: e.target.value }))}
                    placeholder="KSH 5,000"
                    className="w-full rounded-2xl border border-input bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/25"
                  />
                </label>
              </div>
            </div>

            <div className="glass rounded-[24px] border border-border/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <p className="font-display text-lg font-semibold">Tags</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {escortTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-2 text-xs font-medium ${
                      form.tags.includes(tag)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-[24px] border border-border/60 p-4">
              <div className="flex items-start gap-3">
                <input
                  id="live-beta"
                  type="checkbox"
                  checked={form.liveBetaOptIn}
                  onChange={(e) => setForm((prev) => ({ ...prev, liveBetaOptIn: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded border-border bg-surface text-primary"
                />
                <label htmlFor="live-beta" className="block text-sm text-muted-foreground">
                  <span className="font-display text-base font-semibold text-foreground">Opt in to the live beta</span>
                  <br />
                  Be first to try the live feature when it launches.
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={previousStep}
              className="flex-1 rounded-2xl border border-border bg-surface px-5 py-3 font-semibold text-foreground"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={nextStep}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-display text-base font-semibold text-primary-foreground"
          >
            {step === stepCount - 1 ? "Finish setup" : "Continue"}
            {step < stepCount - 1 && <ChevronRight className="h-4 w-4" />}
            {step === stepCount - 1 && <Check className="h-4 w-4" />}
          </button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Need help? <Link to="/support" className="text-primary">Contact support</Link>
        </div>
      </div>
    </NestedPage>
  );
}
