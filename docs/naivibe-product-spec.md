# naiVibe Product Specification

## 1. Product overview

naiVibe is a mobile-first adult discovery and escort marketplace web app. It has two core user journeys:

- Customers browse public profiles, filter and discover escorts, and contact or hire them.
- Escorts create paid listings, complete onboarding, complete verification/payment onboarding, and manage a public profile.

The platform is designed around privacy, high-end modern UI, local convenience features, and a clear separation between guest browsing and trusted account-based flows.

This document is the living source of truth for product decisions, roadmap, UX considerations, and implementation status.

---

## 2. Core product goals

1. Let customers browse without forced registration.
2. Let escorts be discoverable only after a paid listing approval flow.
3. Keep the app premium and mobile-first with modern animation and bento-style layouts.
4. Use local convenience features for email recall and saved device login settings.
5. Avoid handling money directly; every escort payment is manual and owner-approved.
6. Keep the owner/admin application separate from the customer-facing app while sharing backend data.
7. Prioritize safety, abuse prevention, privacy, and moderation.

---

## 3. User types

### 3.1 Customers

Customers are users who browse and hire escorts without needing to register.

They can:

- Browse public profiles and listings
- Search or filter by tags, age, gender, location and preferences
- View public profile details without account creation
- See recently active, new, popular and featured profiles
- Read profile bios, tags and service overview
- Contact or request a hire flow when available through the app workflow
- Receive notifications when they have new messages or updates

### 3.2 Escorts

Escorts are paid members who get listed on the app.

They can:

- Register via email/password or Google (with the rules below)
- Complete onboarding and setup their profile
- Upload photos and edit listing information
- Set a unique username
- Provide services, tags, bio, age and location
- Opt in to live beta features
- Receive chat and notification events
- Manage their published status and profile visibility

### 3.3 App owner/admin

The owner app is not built here. It is a separate management interface that receives shared data, reviews payment submissions, manages approval states, and moderates content.

---

## 4. Registration and sign-in rules

### 4.1 Account creation

Every user who needs a member account must go through onboarding and account creation.

The app supports:

- Email + password signup
- Email + password sign-in
- Google sign-in

### 4.2 Google sign-in constraint

Google sign-in should only be used as an additional login method for an already-registered user.

Rules:

- A user must first register with email/password.
- If the user attempts Google sign-in before that, show an informational banner.
- Focus the email field and guide the user back to the registration flow.
- If the browser/device exposes a matching Google account email, autofill the email field.

This is a product requirement to avoid silent, accidental duplicate accounts.

### 4.3 Password fields

Every password field must include:

- Show/hide toggle
- Clear visual affordance
- Accessible label
- Mobile-friendly spacing

### 4.4 Email convenience

Every email field should:

- Save previously used emails in local browser storage
- Display a dropdown of prior addresses on focus
- Allow single-tap selection
- Filter suggestion list by the current input
- Support manual editing after selection

This should be privacy-conscious and local-only, not server-side for convenience alone.

---

## 5. Age gate and legal compliance

The app is adults-only. On first visit, every user must see a premium full-screen animated age verification screen.

Requirements:

- Full-screen modal or screen
- Modern motion and glow effects
- Clear verification statement
- Single confirmation action
- No repeat gate after the user confirms in the same browser
- Users who decline are redirected away

The age gate is a user trust and legal compliance requirement, not a general onboarding step.

---

## 6. Account onboarding requirements

### 6.1 Onboarding for all account holders

Every registered user should go through a polished onboarding flow, even if they are only creating a basic member account.

Minimum fields:

- Username
- At least 2 profile photos
- Phone number
- Optional WhatsApp number
- Bio
- Gender
- Age
- Location
- Services offered or interest tags
- Optional live beta opt-in

### 6.2 Username requirements

Usernames are a core identity field.

Requirements:

- Must be unique across the application
- Must be publicly visible
- Must be searchable
- Must support real-time availability checking
- Must reject duplicates and invalid patterns
- Must be a key lookup used in profile pages and discovery

### 6.3 Photo upload

Escorts must upload at least two photos before they can be considered for listings.

Requirements:

- Minimum two photos
- Gallery or file uploader
- Image preview
- Clear visual validation status
- Support for cropping or reordering later if desired

### 6.4 Phone and WhatsApp

Phone number is required for account/profile setup.

WhatsApp is optional but recommended.

Include a trigger like “Same as cell phone” that copies the phone number into the WhatsApp field while allowing the user to edit it afterward.

### 6.5 Location

Users should be able to:

- Fill in location manually
- Use current device location when available
- Choose exact or approximate location accuracy

Public profile display must respect the chosen precision. Exact coordinates are never exposed publicly.

---

## 7. Escorts and paid listing flow

### 7.1 Payment model

Escorts pay to be listed; the app never handles money.

Current plan:

- KSH 500 per month
- Manual payment only
- Payment details visible in the app before the user submits a request

### 7.2 Manual payment flow

The escort user selects the plan, then:

- Sends money to the owner’s Mpesa number: 0715938110
- Uploads proof image or pastes a payment message
- Submits the request in-app
- Enters their real name for the owner review message

The payment submission should include:

- Real name
- Payment proof
- Time/date of payment
- Optional notes

### 7.3 Approval flow

Escorts should be blocked from reapplying until the request is reviewed and its state changes.

Flow:

- Pending
- Approved
- Rejected
- Banned

Only approved escorts proceed into profile setup and publishing.

### 7.4 Setup after approval

Once approved, the escort enters a setup flow where they create their full profile.

This includes:

- Bio
- Services
- Age
- Tags
- Photos
- Location
- Availability status
- Optional live beta opt-in

---

## 8. Escort profile and listing model

Each escort listing should contain:

- Username
- Display name
- Age and gender
- Location with exact vs approximate precision
- Bio
- Services offered
- Tags/keywords
- Photos
- Featured or premium state
- Last active status
- Availability and recently active states

Profile card design should highlight trust and personalization, not clutter. The profile card should surface key details but not reveal private exact location.

---

## 9. Search, filtering, and discovery

### 9.1 Search design

Search should not behave like a generic keyword-only box for every word.

The product should favor:

- Tag-based matching
- Username matching
- Profile metadata matching
- AI-assisted semantic understanding for relevant terms

Examples:

- If an escort profile is tagged with “mature,” the escort should appear when a customer searches for “mature.”
- If a customer searches for “man” and then “mature,” the system should prioritize relevant female profiles within a matching age range.

This should be “smart matching,” not a case-insensitive raw string search only.

### 9.2 Filtering model

The app should support filters such as:

- Gender
- Age range
- Tags
- Services
- Location area
- Popularity
- Newness
- Featured profiles

### 9.3 Discovery sections

Homepage and discovery pages should include:

- Homepage banners and promotional areas
- Recently active profiles
- New profiles
- Popular/featured profiles
- Location-based discovery
- Personalized recommendations based on tags and profile intent

---

## 10. Notifications, chat, and messaging

### 10.1 Notification system

Notifications should not live in a dedicated full-screen route by default. They should be a floating overlay or panel that opens over the current screen.

Requirements:

- Grouped notifications
- System alerts
- User chat notifications
- App-owner messages
- Mark as read
- Three-dots menu per notification
- Delete or archive option
- Chat entry opens a slide-in chat screen

### 10.2 Chat experience

The chat screen should support:

- Message list
- Reactions
- Media or image viewing
- User avatar and username in the header
- Profile opening when tapping the avatar or username
- Slide-in animated transitions

### 10.3 Security and abuse prevention

The app should have:

- Content moderation hooks
- Reporting tools
- Abuse flags
- Rate limits for inquiries
- Safe-contact handling defaults

---

## 11. Biometric lock and app security

### 11.1 Biometrics

The app supports optional biometric security.

Requirements:

- New users are prompted to enable biometrics if they wish
- If biometrics are enabled, the app should favor the lock screen instead of requiring normal email/password or Google login for access
- Users can set lock duration based on inactivity or custom preferences
- Users can configure conditions for automatic lock

### 11.2 Lock screen design

Lock screen requirements:

- Full-screen immersive design
- Modern motion
- Premium glassmorphism or layered gradients
- Publish a polished experience with animation and transitions
- Mobile-first
- Use face ID / fingerprint unlock when device supports it

This lock is not a replacement for account security; it is an additional app-access layer for convenience and personal privacy.

---

## 12. UI/UX system

### 12.1 Visual direction

The app should use:

- Figtree for general UI text
- Outfit for headings and important display typography

### 12.2 Layout system

The design direction should be:

- Mobile-first
- Bento-inspired card layouts
- Premium modern cards and panels
- Smooth transitions
- Motion-heavy but tasteful
- Fewer unnecessary screens, more structured nested flows

### 12.3 Screen behavior

- Full-screen nested screens
- Bottom navigation hidden on deeper flows
- Floating back button when appropriate
- Overlay notifications over content
- Modern forms with card layouts and animated motion

### 12.4 Illustration system

Use image, illustration, and Lottie-inspired UI details at strategic places:

- Empty states
- Age gate
- Onboarding milestones
- Payment onboarding
- Support and help flows
- Notification overlays

---

## 13. Help and support

The app must include a help center and support request flow.

Contact details:

- Email: moderation.mails.go@gmail.com
- WhatsApp: 0762634893

Support request form requirements:

- Full name
- Issue description
- Send to admin app or owner-managed ticket flow

---

## 14. Privacy, terms, and community guidelines

The app must include:

- Terms of service
- Privacy policy
- Community guidelines
- Abuse reporting flow
- Age verification statement

The app should make it exceptionally clear that all users are adults and that the platform is for legal, consenting, and moderated adult discovery content.

---

## 15. Analytics and activity metrics

The app should track:

- Profile views
- Search and filter usage
- Conversion from browse to contact or hire actions
- Authentication funnel completion
- Payment submission stats
- Onboarding completion rates
- Profile completion progress
- Recently active user counts

This should support performance analysis for discovery and retention.

---

## 16. SEO and shareable profile pages

The app should support:

- Public profile pages
- Shareable URLs
- Deterministic metadata for social shares
- SEO-friendly metadata for public profiles and landing pages

Escorts must have public pages that can be shared and indexed appropriately within legal constraints.

---

## 17. Technology and architecture assumptions

The app should be built around a modern stack with:

- React + Vite
- Tailwind-based design system
- TanStack Router
- Supabase for auth, data and storage
- Local browser storage for convenience features
- Cloud storage for uploaded profile media
- A separate owner/admin application for approvals and moderation

---

## 18. Roadmap

### Phase 1 — Foundation

- Finalize product rules and legal disclaimers
- Implement age gate and onboarding requirement
- Build registration and Google gating logic
- Build email memory suggestions and password visibility

### Phase 2 — Escort onboarding and profiles

- Multi-step onboarding
- Unique username validation
- Photo uploads
- Phone and WhatsApp flows
- Location precision selection
- Tags and services

### Phase 3 — Discovery and public browsing

- Public customer browse flow
- Search and filters
- Recently active/new/popular sections
- Featured profiles and SEO metadata

### Phase 4 — Payments and approval

- Manual payment flow
- Review state and admin approval
- Publish/unpublish logic
- Reapplication gating

### Phase 5 — Messaging and notifications

- Notification overlay
- Chat screens
- Reactions and profile headers
- Moderation and abuse tools

### Phase 6 — Security and premium polish

- Biometrics and lock screen settings
- Screen lock timers and triggers
- Support flows and moderation tools
- Final QA and release readiness

---

## 19. Current repository status

This repository already contains a generic dating app foundation for naiVibe, including:

- Age gate prompt
- Auth screen flow
- Email memory feature
- Password preview toggle
- Discovery/search implementation
- Public profile cards
- Shared design tokens and premium visual styling
- Figtree and Outfit font configuration

However, the escort-specific app rules in this document are not fully implemented yet. The current codebase is closer to a general dating app than to the paid escort marketplace described here.

That means the next steps are to build the escort-specific user roles, approval/payment flow, and all the additional onboarding and app-lock requirements that are unique to this product.

---

## 20. Product decision summary

This project makes sense only if the business rules are treated as first-class product requirements rather than generic dating features.

The most important decisions are:

- Customers browse without registration.
- Escorts are the only paid member type.
- Google sign-in is not a free-pass; it is an existing-account convenience tool.
- Username uniqueness is mandatory.
- Payment is manual and owner-controlled.
- The owner dashboard is separate.
- Profile privacy and safety are fundamental, not optional.

These rules should guide every implementation step.
