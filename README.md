# Hushly

This repository currently contains the foundation for a premium, mobile-first Hushly dating app, but the escort marketplace product described in the living product spec is not yet fully implemented.

For the complete business requirements, roadmap, product decisions, and implementation status, see [docs/hushly-product-spec.md](docs/hushly-product-spec.md).

This project should evolve as a premium adult discovery and escort marketplace with strict onboarding, privacy, payment approval, and moderation rules.

---

1. User Types

There are two main user experiences:

Browsing Members

Users can enter Hushly and browse public dating profiles without creating an account.

They can:

- Browse profiles

- Discover people

- Filter profiles

- Search profiles

- View public profiles

- See profile information

- See recently active profiles

- See new profiles

- See popular/featured profiles

- Share public profile pages

An account should only be required when a user attempts an action that requires authentication, such as messaging or maintaining their own profile.

Registered Members

Registered members can:

- Create a dating profile

- Upload photos

- Set a username

- Add a bio

- Add interests

- Set dating preferences

- Set location

- Discover other members

- Send and receive messages

- React to messages

- Receive notifications

- Manage privacy

- Configure security

- Enable biometric app locking

---

2. Age Confirmation

On the first visit, display a modern animated screen asking the user to confirm that they are 18 or older.

The experience should be:

- Full screen

- Modern

- Animated

- Premium

- Simple

- Mobile-friendly

After confirmation, do not repeatedly ask the same user unnecessarily.

---

3. Registration

Support normal:

- Email

- Password

- Password confirmation

Every password field must include a show/hide password preview button.

Also support Google sign-in.

Google sign-in should be associated with an existing registered account rather than silently creating an unexpected account.

If a user attempts Google sign-in when they need to register first:

- Show a clear informational banner.

- Focus the email field.

- If technically supported by the browser/device authentication environment, prefill the recognized email address.

---

4. Email Convenience

Every email field throughout the application should remember previously used email addresses locally.

When the user focuses an email field:

- Show previously used email suggestions.

- Allow one-tap selection.

- Automatically populate the field after selection.

Use privacy-conscious local storage.

---

5. Username System

Every registered member should have a unique username.

Usernames should:

- Be unique.

- Be searchable.

- Be publicly displayed.

- Have sensible validation rules.

- Be checked for availability in real time.

- Prevent duplicates.

The username should be one of the core identifiers used throughout Hushly.

---

6. Dating Onboarding

Every registered member should go through a polished onboarding experience.

Collect appropriate information such as:

- Username

- At least 2 profile photos

- First/display name

- Age

- Gender

- Dating preferences

- Phone number

- Optional WhatsApp number

- Bio

- Interests

- Personality/relationship preferences

- Location

- Profile tags

- Optional future-feature preferences

The onboarding experience should use a multi-step modern interface with:

- Progress indicator

- Animated transitions

- Validation

- Save-and-continue behavior

- Back/next navigation

- Attractive illustrations

- Skeleton/loading states

---

7. Phone & WhatsApp

Phone number should be available as an account/profile field.

WhatsApp should be optional.

Include a convenient:

Same as phone number

action that automatically copies the phone number into the WhatsApp field.

The user should still be able to edit it afterward.

---

8. Location

Allow members to provide their location manually.

Also provide:

Use my current location

where browser/device permissions support location access.

When location is detected, let the user choose whether their profile uses:

- Exact location

- Approximate location

Public profile displays must respect this choice.

Do not expose private exact coordinates unnecessarily.

---

9. Dating Interests & Tags

Create a dedicated interests/tags system.

Members can add multiple keywords describing:

- Interests

- Personality

- Lifestyle

- Hobbies

- Relationship preferences

- General characteristics

Examples:

- Travel

- Fitness

- Music

- Foodie

- Movies

- Mature

- Adventurous

- Outgoing

- Romantic

- Professional

Location should not be stored as a profile tag.

Tags should be searchable and usable by the discovery system.

---

10. Intelligent Discovery

Do not make search behave like a basic database keyword search.

Build a smart discovery system that can understand:

- Usernames

- Interests

- Tags

- Profile characteristics

- Dating preferences

- Relevant profile information

For example, if a member has the tag “Travel”, searching for “travel” should make that profile eligible for discovery results.

Search should intelligently combine the user's query with available filters.

Results should remain predictable and explainable.

If advanced AI search becomes unnecessary, provide a strong traditional filtering system while maintaining the same polished UX.

---

11. Filters

Create a powerful mobile-friendly filtering interface.

Possible filters:

- Gender

- Age range

- Distance

- Interests

- Tags

- Relationship preferences

- Recently active

- New profiles

- Popular profiles

- Featured profiles

Filters should update results quickly.

Use a modern bottom-sheet/filter-panel experience on mobile.

---

12. Profile Cards

Create beautiful dating-profile cards.

Cards can display:

- Main photo

- Username

- Display name

- Age

- Gender

- General location

- Selected interests

- Short bio

- Recently active indicator

- New profile indicator

- Featured indicator

Cards should use modern layouts and subtle animations.

---

13. Public Profile

Every member should have a polished public profile.

Include:

- Photo gallery

- Username

- Display name

- Age

- Gender

- General location

- Bio

- Interests

- Tags

- Dating preferences where appropriate

- Activity information

- Connect/message actions where authentication is required

Profiles should work both inside the application and through shareable public URLs.

---

14. Premium Membership

Hushly should initially have one optional premium membership plan:

KES 500/month

The payment workflow should be designed around manual payment confirmation.

The application does not directly process or hold the payment.

Payment instructions can be displayed in the membership screen.

Members can:

1. Select the KES 500 monthly plan.

2. View payment instructions.

3. Complete payment externally.

4. Attach payment confirmation as an image or text.

5. Enter their real name for payment verification.

6. Submit the membership request.

7. Enter a pending approval state.

Payment destination:

M-Pesa: 0715938110

The system should clearly communicate that payment verification is handled by the platform administrator.

---

15. Membership Approval

After submitting payment confirmation:

Status becomes:

Pending Approval

The user should see:

- Current status

- Submission date

- Verification state

- Relevant instructions

Prevent duplicate submissions while the current request is pending.

Possible states:

- Draft

- Payment Pending

- Pending Approval

- Approved

- Rejected

- Expired

- Suspended

The separate administrator application will manage approval.

---

16. Post-Approval Setup

After membership approval, display a profile-completion/setup screen.

Show:

- Completed sections

- Remaining sections

- Profile completion percentage

- Recommended improvements

- Publish/profile visibility state

Make the setup process feel like a modern guided experience.

---

17. Future Live Feature

Allow members to optionally express interest in an upcoming live dating/social feature.

Explain that users who opt in can be among the first invited to test the beta once it launches.

Store this preference in the backend.

Do not build the complete live feature yet.

---

18. Notifications

Notifications should be an overlay/panel, not a separate primary navigation screen.

The notification panel should slide over the current page.

Group notifications into:

- Important system notifications

- Messages

- Application/admin messages

- Account notifications

- Membership/payment notifications

- Safety/security alerts

Each notification should support:

- Mark as read

- Mark as unread where appropriate

- Delete

- Archive

- Three-dot menu

- Timestamp

- Unread indicator

- Relevant icon/illustration

Use polished illustrations, Lottie animations, icons, and modern empty states.

---

19. Chat

Create a modern messaging system.

When a chat notification is selected, the conversation should slide into a full-screen chat view.

Chat should include:

- Conversation history

- Message composer

- Send button

- Timestamps

- Read states where appropriate

- Reactions

- Image/media support where appropriate

- Smooth message animations

- Modern message bubbles

At the top display:

- Avatar

- Username

Clicking the avatar or username opens that member's public profile.

---

20. Biometric Security

Support device biometric authentication where available:

- Fingerprint

- Face authentication / Face ID

Biometric protection should be optional.

If enabled, the user should be able to use biometric unlock instead of repeatedly entering their credentials.

Keep normal account credentials available as a secure fallback/recovery method.

---

21. App Lock

Inside Preferences, allow users to configure:

- Automatic lock after inactivity

- Lock duration

- Other supported lock conditions

The lock screen should be:

- Full screen

- Modern

- Minimal

- Premium

- Animated

- Smooth

- Highly polished

The experience should resemble a modern native mobile application.

---

22. Homepage

Create a premium dating discovery homepage containing:

- Hero section

- Discovery/search

- Promotional banners

- New members

- Recently active members

- Popular members

- Featured members

- Dating/discovery sections

- Membership call-to-action

- Profile creation call-to-action

Use dynamic sections where appropriate.

---

23. Recently Active

Create a dedicated section showing recently active members.

Use privacy-conscious activity indicators.

Do not expose sensitive activity information.

---

24. New Members

Create:

New on Hushly

Show recently created/public profiles using attractive cards and subtle animations.

---

25. Popular & Featured

Create:

- Popular members

- Featured members

The ranking system should be configurable from the backend.

Featured status should eventually be controllable through the administrator application.

---

26. Location-Based Discovery

Support location-aware discovery.

Members should be able to discover other members based on general location and distance.

Respect each member's selected location precision.

Never expose an exact location when the member selected approximate location.

---

27. Analytics

Implement analytics infrastructure for useful aggregate statistics.

Track appropriate events such as:

- Profile views

- Discovery interactions

- Search usage

- Filter usage

- New registrations

- Membership requests

- Membership status

- Profile activity

- Engagement

- Recently active members

Use privacy-conscious analytics.

---

28. SEO & Shareable Profiles

Public profiles should have:

- SEO-friendly URLs

- Page titles

- Meta descriptions

- Open Graph metadata

- Social sharing previews

- Appropriate structured metadata

- Optimized images

- Canonical URLs

A member should be able to share their Hushly profile externally.

---

29. Support Center

Create a Help & Support Center.

Support contact:

Email: moderation.mails.go@gmail.com

WhatsApp: 0762634893

Also provide an in-app support form.

Fields:

- Name

- Email

- Issue category

- Description

- Optional attachment

Store support requests in the backend for administrator management.

---

30. Administrator Application Integration

The administrator application will be built separately.

Do not build its UI inside Hushly.

Hushly is currently configured as a frontend-only local-storage app for static hosting.

The backend should support management of:

- Users

- Profiles

- Memberships

- Payment submissions

- Approvals

- Notifications

- Messages

- Reports

- Moderation

- Suspensions

- Featured profiles

- Analytics

- Support requests

- Platform configuration

Do not make assumptions about the administrator application's interface.

---

31. Safety & Moderation

Build appropriate infrastructure for:

- User reports

- Profile reports

- Message reports

- Blocking

- Account restrictions

- Suspensions

- Content moderation

- Abuse prevention

- Rate limiting

- Suspicious activity detection

The platform should have clear community guidelines.

---

32. Legal Pages

Include:

- Terms of Service

- Privacy Policy

- Community Guidelines

- Safety Guidelines

Make these easily accessible.

---

33. Account Preferences

Create a modern settings area.

Account

- Email

- Username

- Display name

- Phone

- Account information

Security

- Password

- Biometric unlock

- App-lock duration

- Lock conditions

- Active sessions where appropriate

Privacy

- Location precision

- Profile visibility

- Privacy controls

Notifications

- Message notifications

- System notifications

- Membership notifications

- Promotional notifications

Dating Profile

- Photos

- Bio

- Interests

- Dating preferences

- Profile visibility

- Profile completion

---

34. Navigation

Use a modern mobile-first navigation system.

Primary navigation can use a bottom navigation bar.

For deeply nested screens:

- Hide bottom navigation.

- Open a full-screen nested view.

- Add a floating back button.

- Use smooth screen transitions.

The nested view should feel like a native mobile screen rather than a web page inside another page.

---

35. Typography

Use:

Figtree and Outfit

throughout the application.

Establish a consistent typography system for:

- Headings

- Body text

- Labels

- Buttons

- Cards

- Navigation

- Forms

- Notifications

---

36. Visual Direction

The UI should be extremely modern and premium.

Use:

- Bento layouts

- Modern cards

- Clean spacing

- Strong visual hierarchy

- Rounded components

- Subtle shadows

- Glass/frosted effects where appropriate

- Subtle gradients

- Modern icons

- Lottie animations

- Micro-interactions

- Smooth transitions

- High-quality imagery

Avoid generic templates.

The final product should look like a professionally designed modern dating application.

---

37. Animation

Use polished animations for:

- Onboarding

- Page transitions

- Profile cards

- Profile galleries

- Notifications

- Chat

- Bottom sheets

- Loading states

- Skeleton screens

- Success states

- Error states

- Membership states

- Biometric lock/unlock

- Form progression

Animations should be smooth and fast without hurting performance.

---

38. Performance

Optimize for mobile networks.

Implement:

- Lazy-loaded images

- Responsive image sizes

- Compression

- Modern image formats

- Thumbnail generation

- Caching

- Skeleton loading

- Efficient database queries

- Fast initial page load

---

39. Security

Implement:

- Secure authentication

- Secure sessions

- Authorization

- Backend validation

- Input sanitization

- Rate limiting

- Secure file uploads

- Image validation

- Database security rules

- Privacy-conscious location handling

- Secure messaging

- Protection against unauthorized profile modification

- Protection against unauthorized membership/payment modification

Never rely exclusively on frontend validation.

---

40. Loading & Empty States

Every major screen needs polished:

- Loading state

- Empty state

- Error state

- Offline state

- Success state

- Pending state

Use modern illustrations, Lotties, animations, and helpful copy.

---

41. Backend Data Architecture

Design the backend for future scalability and administrator integration.

Core entities should include:

- Users

- Authentication identities

- Profiles

- Photos

- Interests

- Tags

- Dating preferences

- Locations

- Memberships

- Payment submissions

- Membership approvals

- Notifications

- Notification groups

- Conversations

- Messages

- Message reactions

- Reports

- Blocks

- Support tickets

- Analytics events

- User preferences

- Security settings

- App-lock settings

- Feature opt-ins

- Featured-profile configuration

Use appropriate relationships, indexes, security rules, and validation.

---

42. Living Documentation

Maintain a documentation file inside the project.

Continuously document:

Product Vision

What Hushly is and the experience it provides.

Current Features

What has already been implemented.

Roadmap

What is planned next.

Architecture

Important technical decisions.

Database

Entities, fields, relationships, indexes, and security rules.

Authentication

Registration, login, Google authentication, sessions, biometrics, and recovery.

UI/UX

Design system, typography, layouts, navigation, animations, and responsive behavior.

Security

Security measures and known risks.

Future Features

Ideas discussed but not yet implemented.

Development Status

Every feature should be labeled:

- Planned

- In Progress

- Complete

- Needs Testing

- Blocked

- Future

Update the documentation as development progresses.

---

43. Development Roadmap

Phase 1 — Foundation

- Project setup

- Design system

- Typography

- Responsive foundation

- Authentication

- Database foundation

- Age confirmation

- Navigation

Phase 2 — Dating Profiles

- Registration

- Onboarding

- Username system

- Photo uploads

- Profile creation

- Interests

- Tags

- Dating preferences

- Location

- Public profiles

Phase 3 — Discovery

- Homepage

- Profile cards

- Search

- Intelligent discovery

- Filters

- Recently active

- New members

- Popular members

- Featured members

- Location discovery

Phase 4 — Membership

- KES 500 monthly plan

- Manual payment instructions

- Payment confirmation

- Proof upload

- Membership request

- Pending approval

- Administrator backend integration

- Approval states

- Profile setup after approval

Phase 5 — Communication

- Notification overlay

- Notification grouping

- Chat

- Reactions

- Profile navigation

- System notifications

- Administrator messages

Phase 6 — Security

- Biometric unlock

- App lock

- Preferences

- Privacy controls

- Reporting

- Blocking

- Abuse prevention

Phase 7 — Growth & Performance

- SEO

- Shareable profiles

- Analytics

- Image optimization

- Performance optimization

- Loading/empty/error states

Phase 8 — Future

- Live dating/social beta

- Advanced discovery

- Additional profile features

- Additional analytics

- Additional membership features

- Future features based on user feedback

---

44. Core Product Principle

Hushly should feel like a premium, modern, mobile-first dating and social-discovery application, not a generic directory.

Prioritize:

Usability → Privacy → Security → Performance → Visual quality → Scalability

Build the foundation cleanly so the separate administrator application can later use the same backend to manage the entire Hushly platform.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6d301926-38e6-4cce-8e4b-c82a963301fc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitLab and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
# Hushly
