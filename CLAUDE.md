# Frontend — React 19 + Vite

## Stack

- React 19.1 with Vite 6.3
- React Router DOM 7.6 (createBrowserRouter)
- Tailwind CSS 4.1 + Shadcn/ui (Radix UI primitives)
- React Hook Form 7.56 + Zod validation (auth forms only; most forms use plain useState)
- Recharts 2.15 (charts), Framer Motion 12.15 (animations)
- Editor.js (blog editor), Lucide React (icons), Sonner (toasts)
- date-fns for date formatting
- Plausible analytics (production-only injection — see `services/analytics.js`)

## Project Layout

```
src/
  main.jsx              # App entry point
  App.jsx               # Root component
  router.jsx            # All routes (createBrowserRouter)
  pages/                # 27 page components (one per route)
  components/
    ui/                 # Shadcn/ui components (~40+ primitives)
    auth/               # Auth-related components
    therapist-finder/   # Filter-first discovery surface (TherapistCard, etc.)
    *.jsx               # Feature components (SchedulingSystem, TherapistsList, WhatsAppButton, etc.)
  services/             # API service layer (15 service files)
  hooks/                # Custom hooks (use-mobile, useExitIntent)
  utils/
    whatsapp.js         # WHATSAPP_NUMBER + buildWhatsAppUrl + appendSourceTag + openWhatsApp
  lib/
    utils.js            # cn() utility (clsx + tailwind-merge)
  assets/               # Static assets
```

## API Layer

- `services/api.js` — `ApiService` singleton: base fetch wrapper with JWT auth. Adds the `Authorization: Bearer` header automatically. Exposes `get/post/put/delete` (JSON) and `requestBlob` (binary, used for PDF receipt download). Backend's user-facing Portuguese message is surfaced on `error.message` — prefer `err.errors?.[0] || err.message || '<fallback>'` in callers. Skips `JSON.parse` on `204 No Content` / empty bodies (returns `null`) so `head :no_content` responses (e.g. DELETE) don't throw a false error
- API base URL: `import.meta.env.VITE_API_URL` or `http://localhost:3000/api/v1`
- Token stored in `localStorage` as `auth_token`
- User object cached in `localStorage` as `user`
- All services import and use the `apiService` singleton

### Service Files
- `authService.js` — login, register, logout, getCurrentUser, isTherapist/isClient
- `companyService.js` — company data, therapists, HR dashboard
- `therapistService.js` — list, profile, availability, `formatTherapistForUI` (exposes `acolhimentoPrice`)
- `appointmentService.js` — CRUD appointments
- `availabilityService.js` — manage therapist slots
- `blogService.js` — articles CRUD
- `questionnaireService.js` — questionnaires and responses
- `activityService.js` — wellness activities (journal/reflection/reading)
- `leadService.js` — lead capture forms
- `triageFeedbackService.js` — anonymous /triagem feedback
- `adminService.js` — admin CRUD (companies, therapists, clients, services, leads, themes) + `createTherapistAsaasAccount` (sub-account onboarding)
- `paymentService.js` — `createPayment(appointmentId)`, `getStatus(appointmentId)` (polled by ConfirmationPage), `downloadReceipt(appointmentId)` (returns Blob)
- `gamificationService.js` — localStorage-only reading streaks + badges (no backend)
- `connectionService.js` — clinical connection handshake (`getMyCode`, `connectWithCode`, `rotateCode`, `getStatus`, `getPendingRequests`, `respondToRequest`, `requestConnection`, `revoke`)
- `patientEntriesService.js` — therapist reads shared activity entries from connected patients
- `analytics.js` — Plausible `track()` wrapper. Never import `window.plausible` directly — always use `track()`

## Auth Pattern

```javascript
// Check login state
authService.isLoggedIn()   // has token + user in storage
authService.isTherapist()  // user.user_type === 'therapist'
authService.isClient()     // user.user_type === 'client'
authService.getUser()      // returns cached user or from localStorage

// Login response sets token + user (incl. company_slug + cpf for B2C clients)
const { success, user } = await authService.login(email, password)

// Merge fields into cached user (e.g. after saving cpf at first paid booking)
authService.updateCachedUser({ cpf: '12345678901' })
```

No route guards — pages check auth internally and redirect if needed. The exception is `CompanyAuthGate`, which wraps B2B-gated routes and uses `user.company_slug` to block cross-company access.

## Route Map

### Public
- `/` — LandingPage (filter-first therapist discovery, privacy hero, exit-intent modal)
- `/login` — LoginPage
- `/blog`, `/blog/:slug` — Blog
- `/acolhimento`, `/acolhimento/:slug` — Per-therapist acolhimento landing (WhatsApp fast-lane)
- `/triagem` — Anonymous triage flow
- `/enigma` — Assessment quiz
- `/form` — Lead capture funnel (fallback for non-acolhimento therapists)
- `/admin` — Admin panel (gated by admin email — companies, therapists, clients, services, leads, questionnaires, themes)

### Client (auth required)
- `/dashboard` — ClientDashboardPage (mood trend, appointments, recommended readings, "Sua Jornada de Leitura" gamification panel)
- `/matching` — Find therapist
- `/scheduling` — Book appointment
- `/confirmation` — Post-booking
- `/atividades/:slug` — Wellness activities

### Therapist (auth required)
- `/therapist/dashboard` — TherapistDashboardPage
- `/therapist/profile/edit` — Profile editor
- `/therapist/questionarios/:slug/respostas` — Questionnaire responses list
- `/therapist/respostas/:id` — Response detail
- `/therapist/pacientes/:clientId/registros` — Shared activity entries from a connected patient (requires active CareRelationship)
- `/blog-admin` — Article management
- `/blog-admin/new`, `/blog-admin/:slug/edit` — Article editor

### B2B Company (slug-based)
- `/empresa/:slug` — Company landing page
- `/empresa/:slug/login` — Company-scoped login
- `/empresa/:slug/cadastro` — Employee registration
- `/empresa/:slug/psicologos` — Company therapist list (CompanyAuthGate)
- `/empresa/:slug/agendar/:therapistId` — Book with company therapist (CompanyAuthGate)
- `/empresa/:slug/rh` — HR dashboard / analytics (CompanyAuthGate)
- `/empresa/:slug/questionario/:questionnaire_slug` — Assessment form (anonymous-permissive — uses `try_authorize`)

## Component Conventions

- Shadcn/ui components in `components/ui/` — use these for all UI primitives
- `cn()` from `lib/utils.js` for conditional class merging
- Forms: most use plain `useState`; auth forms use React Hook Form + Zod
- Toasts: Sonner (`toast.success()`, `toast.error()`)
- Icons: Lucide React
- Pages are self-contained — each imports its own services and components

## Payment Flow (B2C, Asaas)

The paid B2C booking flow is anchored on three pages:

- **`SchedulingSystem.jsx`** — three steps (`service` → `datetime` → `confirm`), now fully **click-to-advance** (no intermediate "Continuar" buttons):
  - **Service step.** Loads the selected therapist's services from the auth-aware `GET /therapists/:id/services` (refetched when login state changes) so each service carries `visibility` + `already_booked`. Shows all non-hidden services; clicking a card jumps straight to `datetime`. Cards lock per service: a guest clicking an `authenticated`-visibility service is routed to the inline login modal (faded card, amber 🔒 hint); an `already_booked` single-use service is faded + inert with a green "já realizou" hint. `public` services are bookable by anyone.
  - **Datetime step.** Click a date → reveals time slots; click an available time → jumps to `confirm` (no button). Unavailable slots stay disabled/strikethrough.
  - **Confirm step.** **Guest visitors** booking a `public` service see a "Seus dados" block (name/email/phone/CPF/password) → `authService.guestCheckout` creates the Client + stores the JWT, then the booking flow continues. (`authenticated` services never reach here as a guest — login is forced at the service step.) **Logged-in clients** with no CPF on file see the inline CPF input. Submit creates the appointment, then if `pending_payment`, calls `paymentService.createPayment` and `window.location.href = invoice_url` to Asaas hosted checkout. Free / B2B bookings go straight to `ConfirmationPage` via location.state. A `pendingAppointmentId` ref guards against double-booking on retry. The therapistId is read from `?therapistId=N` (refresh-safe for campaign links), falling back to router state.
- **`ConfirmationPage.jsx`** — two modes:
  - Free flow: reads `scheduledAppointment` from `location.state`, renders the legacy confirmed view.
  - Paid flow: reads `appointment_id` from query string (Asaas redirect lands here), polls `paymentService.getStatus` every 3s for up to 2 minutes. Renders `processing | confirmed | expired | refunded | failed | timeout`. The `confirmed` view includes a "Baixar comprovante (PDF)" button that calls `paymentService.downloadReceipt`.
- **`AdminPage.jsx`** — `AsaasOnboardingDialog` for therapist sub-account creation. Per-therapist Asaas status badge. `commission_percentage` field on the therapist edit form.

### Conventions / footguns

- The Asaas hosted checkout often doesn't auto-redirect after Pix payments (gesture context loss / Pix-specific UX). The webhook is the source of truth — clients can also navigate back to `/dashboard` and the session shows as confirmed.
- The PDF receipt is fetched via `requestBlob` (auth-headers binary fetch), then opened in a new tab via `URL.createObjectURL`. On mobile Safari the post-await `window.open` may be popup-blocked; future hardening would use a synthetic `<a download>` click instead.
- The cancel handler on `ClientDashboardPage` shows a Sonner toast on success/failure. On error it includes a "Falar com suporte" action that opens WhatsApp pre-filled (since some cancellations — e.g. boleto refunds — can't be processed via API and need human help).
- Status labels for `pending_payment` ("Aguardando pagamento") and `expired` are defined in `TherapistDashboardPage.jsx` and `AdminPage.jsx` (appointments tab).

See `docs/epic-payment-flow-v2.md` for the design.

## Clinical Connection (Mutual Handshake)

Patient and therapist each have an 8-char "ID de Conexão Clínica" (case-insensitive `[A-Z0-9]`). Pairing flow:
1. Both sides see their own code on their dashboard (`ConexaoClinicaCard` on `ClientDashboardPage`, `ConexaoClinicaTherapistCard` in the sidebar of `TherapistDashboardPage`).
2. Both sides have an Input + Button to paste the other's code. First paste → `pending`, initiated_by caller. Second paste from the other party → `active`.
3. Patient's `ActivityFormPage` shows the "Compartilhar com [terapeuta]" checkbox only when at least one active `CareRelationship` exists; default is `false` (entry-by-entry consent).
4. Therapist reads shared entries at `/therapist/pacientes/:clientId/registros` (`PatientEntriesPage`). Backend writes `ClinicalAccessLog` on every read.

### Conventions
- Always render `Conexão Clínica` cards on dashboards — they handle their own loading via `connectionService.getStatus()` and fail soft when there's nothing to show.
- Rotation cancels pending pairings but preserves active ones — AlertDialog warns the user before rotating.
- Revocation does NOT alter the patient's `ActivityEntry.visibility`; the backend access gate just stops returning data. Old shared entries remain shared if a connection is later re-established with the same therapist (rare but possible).

## WhatsApp Fast-Lane

Central WhatsApp number `5511914214449` is the single contact entry point for guest leads. Don't hardcode the number — import from `utils/whatsapp.js`.

- `WhatsAppButton` component: full button with analytics + auto-tagged message. Pass `source` (Plausible event tag), optional `therapist` (name), and a base `message`
- `appendSourceTag(message, { therapist })`: helper that adds `[terapeuta: X • origem: /path]` to messages. Used by `WhatsAppButton` automatically and in handlers that call `openWhatsApp` directly
- UTMs are intentionally **not** appended to user-facing messages — Plausible captures them via pageview tracking instead
- Therapist cards branch on `therapist.acolhimentoPrice`: opt-in therapists → WhatsApp; others → `/form`. See `TherapistsList.jsx` and `therapist-finder/TherapistCard.jsx` for the pattern

## Exit-Intent Modal

- `useExitIntent` hook + `ExitIntentModal` component — reusable across pages
- Desktop: triggers on mouseleave to viewport top; mobile: scroll-up trigger (or disabled per page)
- LocalStorage gate per page (`storageKey`) to avoid re-triggering for the same visitor
- Used on `LandingPage` and `ArticlePage` (logged-out users)

## Article → Activity Preview Funnel

Articles can embed a static preview of a wellness activity at the bottom (`<ActivityPreview />` after the article body). The pattern is a marketing funnel: blog readers (typically logged out) see a real tool that addresses what they just read, then click a WhatsApp CTA.

- Pairings live in `ARTICLE_ACTIVITY_PREVIEWS` map at the top of `pages/ArticlePage.jsx`. To pair a new article with an activity, add an entry — no other code changes
- `<ActivityPreview />` is read-only: faux text/scale fields, never interactive (avoids the "fill it then hit a login wall" trap)
- Activities endpoint `/api/v1/activities/:slug` is intentionally public (`skip_before_action :authorize_request, only: [:show]`) so logged-out blog readers can fetch it
- Two Plausible events form the funnel:
  - `Article Activity Preview View` — fires once via IntersectionObserver when ≥50% of the preview enters the viewport. Props: `article_slug`, `activity_slug`, `source`
  - `WhatsApp Click` — already fired by `WhatsAppButton` on click; share the `source` tag with the View event so the funnel ratio is computable
- Reach rate = Views ÷ article pageviews; CTR = Clicks ÷ Views; end-to-end = Clicks ÷ pageviews

## Gamification (Reading Streaks)

- `gamificationService.js` is **localStorage-only** (per-device, no backend). Acceptable for V1
- `markArticleAsRead(id, title)` is called from `ArticlePage.handleTrackRead` after the activity entry is created. Returns `newAchievements[]` which `ArticlePage` toasts via Sonner
- `ClientDashboardPage` reads `getAllStats()` and renders the "Sua Jornada de Leitura" panel (streak + articles + 6-badge grid)
- Streak counter increments on consecutive-day reads, decays to 0 after a 2+ day gap

## Running Locally

```bash
cd frontend
npm install
npm run dev  # runs on port 5173
```

Environment: create `.env` with `VITE_API_URL=http://localhost:3000/api/v1`
