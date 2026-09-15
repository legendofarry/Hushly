# naiVibe — Build Plan

A premium, mobile-first dating and social-discovery web app. The spec is large, so this plan builds it in ordered phases, each one usable on its own. Nothing is left as a stub: every phase ships working screens.

## What gets built first (Phase 1 + 2, this approval)

**Foundation**
- Brand and design system: Outfit for headings, Figtree for body; warm dusk palette (deep plum background, sunset coral primary, soft gold accent) with rounded cards, soft shadows, frosted surfaces and gradients. Light and dark themes.
- Mobile-first shell: bottom navigation (Discover, Search, Chat, Profile), full-screen nested views with floating back button, smooth page transitions.
- Animated full-screen 18+ age confirmation on first visit, remembered locally.
- Backend enabled (database, accounts, file storage, server logic).

**Accounts and profiles**
- Sign up with email + password (each password box has a show/hide eye), plus Google sign-in. Clear banner and email focus/prefill when someone tries Google before registering.
- Email boxes remember previously used addresses on the device and suggest them on tap.
- Unique usernames with live availability checking.
- Multi-step onboarding with progress bar, animated steps, validation, save-and-continue: username, 2+ photos, display name, age, gender, dating preferences, phone, optional WhatsApp ("Same as phone" button), bio, interests/tags, location, personality preferences, live-feature opt-in.
- Location entered manually or via "Use my current location", with exact vs approximate precision choice that public pages always respect.
- Public profile pages at `/u/username` — gallery, details, interests, activity, share, with per-page titles, descriptions and social preview data. Browsable without an account; messaging prompts sign-in.

## Following phases

**Phase 3 — Discovery**: homepage with hero, promo banners, New on naiVibe, Recently Active, Popular, Featured; profile cards with badges and animation; smart search that matches usernames, interests, tags and profile traits; bottom-sheet filters (gender, age, distance, interests, tags, relationship goals, activity).

**Phase 4 — Membership**: KES 500/month plan, M-Pesa 0715938110 instructions, proof upload + real name, submission, pending-approval state with duplicate-submission blocking, full status lifecycle, post-approval guided profile completion with percentage.

**Phase 5 — Communication**: sliding notification overlay with grouping, read/unread, delete, archive, three-dot menus, empty states; full-screen chat with bubbles, reactions, images, timestamps, read states, avatar/username tapping through to the profile.

**Phase 6 — Security & preferences**: biometric unlock (device fingerprint/Face ID via WebAuthn) with password fallback, app lock with inactivity timing and an animated lock screen, settings area (account, security, privacy, notifications, dating profile), reporting, blocking, community guidelines.

**Phase 7 — Growth**: analytics events, image optimization and lazy loading, polished loading/empty/error/offline states everywhere, legal pages, Help & Support Center with contact details and in-app form.

**Phase 8 — Future**: live dating beta, advanced discovery, further membership features.

## Documentation

`PROJECT_DOCS.md` is created in Phase 1 and updated every phase: vision, features, roadmap, architecture, database, authentication, UI/UX, security, future features, and a status table labelling each feature Planned / In Progress / Complete / Needs Testing / Blocked / Future.

## Technical notes

- TanStack Start + Lovable Cloud (Postgres, auth, storage, server functions). No separate admin UI here — the schema and rules are written so a separate administrator app can manage users, profiles, memberships, payments, approvals, reports, moderation, featured flags, support tickets, analytics and platform config.
- Tables: profiles, profile_photos, interests/tags + join tables, dating_preferences, locations (exact coords private, approximate exposed), memberships, payment_submissions, notifications, conversations, messages, message_reactions, reports, blocks, support_tickets, analytics_events, user_preferences, security_settings, feature_opt_ins, platform_config, user_roles.
- Row-level security on every table: public reads limited to safe columns of visible profiles; owners write only their own rows; privileged actions go through server-side checks. Exact coordinates never readable by anonymous visitors.
- Server-side validation on all writes, rate limiting on search/messaging/reports, validated image uploads, generated thumbnails.
- Admin approval of payments happens outside this app; naiVibe only submits and reflects status.

## Open items

- Payment verification is manual by design; no payment processor is integrated.
- Real photos for demo profiles will be generated illustrations/placeholders until real members join.
