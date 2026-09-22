export const ESCORT_ONBOARDING_KEY = "naivibe.escort-onboarding";
export const ESCORT_PAYMENT_KEY = "naivibe.escort-payment";

export type EscortLocationPrecision = "exact" | "approximate";

export type EscortOnboarding = {
  username: string;
  displayName: string;
  age: string;
  gender: string;
  phone: string;
  whatsapp: string;
  bio: string;
  services: string[];
  tags: string[];
  location: string;
  locationPrecision: EscortLocationPrecision;
  liveBetaOptIn: boolean;
  photos: string[];
  paymentStatus: "not-started" | "pending" | "approved" | "rejected";
  priceMode: "call" | "set";
  totalPrice: string;
  incallRate: string;
  outcallRate: string;
};

export const defaultEscortOnboarding: EscortOnboarding = {
  username: "",
  displayName: "",
  age: "",
  gender: "",
  phone: "",
  whatsapp: "",
  bio: "",
  services: ["DINNER DATE", "MASSAGE"],
  tags: ["mature", "stylish", "discreet"],
  location: "",
  locationPrecision: "approximate",
  liveBetaOptIn: false,
  photos: [],
  paymentStatus: "not-started",
  priceMode: "call",
  totalPrice: "",
  incallRate: "",
  outcallRate: "",
};

const RESERVED_USERNAMES = new Set([
  "admin",
  "support",
  "help",
  "owner",
  "naivibe",
  "moderation",
  "billing",
  "staff",
  "team",
  "root",
]);

export function sanitizeUsername(value: string) {
  return value.trim().replace(/\s+/g, "").toLowerCase();
}

export function isUsernameAvailable(value: string, existingNames: string[] = []) {
  const normalized = sanitizeUsername(value);
  if (!normalized) return { ok: false, message: "Choose a username." };
  if (normalized.length < 3) return { ok: false, message: "Use at least 3 characters." };
  if (!/^[a-z0-9._-]+$/.test(normalized)) {
    return { ok: false, message: "Use letters, numbers, dots, underscores or hyphens only." };
  }
  if (RESERVED_USERNAMES.has(normalized)) {
    return { ok: false, message: "That username is reserved." };
  }
  if (existingNames.some((name) => name.toLowerCase() === normalized)) {
    return { ok: false, message: "This username is already taken." };
  }
  return { ok: true, message: "Username available" };
}

export function readEscortOnboarding() {
  if (typeof window === "undefined") return defaultEscortOnboarding;
  try {
    const raw = window.localStorage.getItem(ESCORT_ONBOARDING_KEY);
    return raw ? ({ ...defaultEscortOnboarding, ...JSON.parse(raw) } as EscortOnboarding) : defaultEscortOnboarding;
  } catch {
    return defaultEscortOnboarding;
  }
}

export function writeEscortOnboarding(value: EscortOnboarding) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ESCORT_ONBOARDING_KEY, JSON.stringify(value));
}

export function readEscortPayment() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ESCORT_PAYMENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeEscortPayment(value: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ESCORT_PAYMENT_KEY, JSON.stringify(value));
}

export const escortTags = [
  "mature",
  "discreet",
  "luxury",
  "girlfriend experience",
  "outcall",
  "incall",
  "petite",
  "athletic",
  "educated",
  "sugar",
  "travel",
  "couples",
  "roleplay",
  "after-hours",
  "private",
  "premium",
  "curvy",
  "latina",
  "asian",
  "black",
  "fashion",
  "social",
  "party",
];

export const escortServices = [
  "DINNER DATE",
  "TRAVEL COMPANION",
  "LESBIAN SHOW",
  "RIMMING",
  "RAW BJ",
  "BJ",
  "GFE",
  "COB – CUM ON BODY",
  "CUM – CUM IN MOUTH",
  "3 SOME",
  "ANAL",
  "MASSAGE",
  "RAWSEX",
  "PEGGING",
  "VIP DATES",
  "OUTCALLS",
  "INCALLS",
  "TRAVEL",
  "COMPANIONSHIP",
  "PRIVATE SESSIONS",
];
