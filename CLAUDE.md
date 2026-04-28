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
  services/             # API service layer (14 service files)
  hooks/                # Custom hooks (use-mobile, useExitIntent)
  utils/
    whatsapp.js         # WHATSAPP_NUMBER + buildWhatsAppUrl + appendSourceTag + openWhatsApp
  lib/
    utils.js            # cn() utility (clsx + tailwind-merge)
  assets/               # Static assets
```

## API Layer

- `services/api.js` — `ApiService` singleton: base fetch wrapper with JWT auth
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
- `adminService.js` — admin CRUD (companies, therapists, clients, services, leads, themes)
- `gamificationService.js` — localStorage-only reading streaks + badges (no backend)
- `analytics.js` — Plausible `track()` wrapper. Never import `window.plausible` directly — always use `track()`

## Auth Pattern

```javascript
// Check login state
authService.isLoggedIn()   // has token + user in storage
authService.isTherapist()  // user.user_type === 'therapist'
authService.isClient()     // user.user_type === 'client'
authService.getUser()      // returns cached user or from localStorage

// Login response sets token + user (incl. company_slug for B2B clients)
const { success, user } = await authService.login(email, password)
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
