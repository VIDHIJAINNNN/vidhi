# LEGACY — Product Requirements Document

## Product
**LEGACY** — a Student Knowledge Ecosystem where verified senior students mentor juniors, upload winning resources (Legacy Vault), and every graduating student "leaves a legacy". Premium iOS-quality mobile app built on React Native (Expo) + FastAPI + MongoDB.

Tagline: **Knowledge Never Graduates.**

## Stack
- **Frontend:** Expo SDK 54, React Native 0.81, Expo Router, react-native-reanimated, expo-linear-gradient, expo-web-browser + expo-linking (Emergent Google Auth), Ionicons.
- **Backend:** FastAPI, Motor (async MongoDB), httpx (Emergent auth handshake), emergentintegrations (Claude Sonnet 4.5 streaming chat).
- **Auth:** Emergent-managed Google OAuth + one-tap Guest demo login.
- **AI:** Claude Sonnet 4.5 via Emergent LLM key — powers the Career Compass advisor with SSE streaming.
- **Payments:** MOCKED (booking flow returns `status: "confirmed"` instantly with no real charge).

## Core Screens
1. Splash → Onboarding (3 slides) → Login (Google/Apple/Guest)
2. **Home tab** — greeting, search, 4 core pillar cards (Learn / Legacy Vault / Career Compass / Community), Become a Mentor banner, Featured Mentors carousel, Legacy Vault preview, Career Compass grid, Upcoming Workshops, Student Journey, "See your Legacy" CTA
3. **Search tab** — mentor discovery with 15 category chips + list of mentor cards
4. **Bookings tab** — user's confirmed sessions
5. **Vault tab** — Netflix-style rows (Winning Presentations, Debate Speeches, MUN Position Papers, Pitch Decks, Scholarship Essays, Notes)
6. **Profile tab** — avatar, stats, menu, sign out
7. **Mentor Profile** `/mentor/[id]` — hero image, verified badge, achievements, reviews, sticky Book CTA
8. **Book Session** `/book/[mentorId]` — 14-day date picker, time slots, video/in-person toggle, payment summary
9. **Booking Success** — success animation + summary card
10. **Career Compass** `/career` list + `/career/[id]` detail with 3 tabs (Overview, Roadmap, **AI Advisor** — streaming Claude chat)
11. **Community** — filter chips + event cards
12. **Become a Mentor** — CTA with benefits + steps
13. **Legacy Impact** `/legacy` — dark blue emotional screen with glowing tree + stats

## Backend Endpoints (all under `/api`)
- Auth: `POST /auth/session`, `POST /auth/guest`, `GET /auth/me`, `POST /auth/logout`
- Mentors: `GET /mentors?category=&q=`, `GET /mentors/{id}`, `GET /mentors/{id}/reviews`
- Categories: `GET /categories`
- Vault: `GET /vault`, `GET /vault/collections`, `POST /vault/{id}/bookmark`
- Careers: `GET /careers`, `GET /careers/{id}`
- Community: `GET /community/events?kind=`
- Bookings: `POST /bookings`, `GET /bookings`
- Impact: `GET /impact`
- AI Chat: `POST /career-chat/stream` (SSE), `POST /career-chat` (non-streaming), `GET /career-chat/{session_id}`

## Seed Data
- 6 mentors, 9 vault items across 6 collections, 8 careers, 6 events, 5 reviews — all seeded on startup.

## Design System
- Primary Blue #2563EB, dark impact #0A0F24
- Pillar accent colors: Blue / Green / Amber / Purple
- Inter font system, generous white space, rounded 20/24 corners, soft shadows
- Category chip rows use horizontal ScrollView with 36pt chips, 56pt rows, `flexShrink: 0`

## Business Model (Investor Angle)
- ₹29 platform fee per booking (mock)
- Verified mentor marketplace with take rate
- Premium school subscriptions (future)
- Vault access as school-level SaaS

## Not in v1
- Real payment gateway (Stripe/Razorpay)
- Push notifications
- Video calling integration (button links to placeholder)
- School alumni portal
- Mentor onboarding form (button visible, form deferred)
