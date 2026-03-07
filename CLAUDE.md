# Frontend — React 19 + Vite

## Stack

- React 19.1 with Vite 6.3
- React Router DOM 7.6 (createBrowserRouter)
- Tailwind CSS 4.1 + Shadcn/ui (Radix UI primitives)
- React Hook Form 7.56 + Zod validation
- Recharts 2.15 (charts), Framer Motion 12.15 (animations)
- Editor.js (blog editor), Lucide React (icons), Sonner (toasts)
- date-fns for date formatting

## Project Layout

```
src/
  main.jsx              # App entry point
  App.jsx               # Root component
  router.jsx            # All routes (createBrowserRouter)
  pages/                # 31 page components (one per route)
  components/
    ui/                 # Shadcn/ui components (~40+ primitives)
    auth/               # Auth-related components
    dashboard/          # Dashboard widgets
    *.jsx               # Feature components (SchedulingSystem, TherapistsList, etc.)
  services/             # API service layer (12 service files)
  hooks/                # Custom hooks (use-mobile.js)
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
- `therapistService.js` — list, profile, availability
- `appointmentService.js` — CRUD appointments
- `availabilityService.js` — manage therapist slots
- `creditsService.js` — balance, transactions, purchase
- `blogService.js` — articles CRUD
- `questionnaireService.js` — questionnaires and responses
- `activityService.js` — wellness activities
- `leadService.js` — lead capture forms
- `gamificationService.js` — gamification features

## Auth Pattern

```javascript
// Check login state
authService.isLoggedIn()   // has token + user in storage
authService.isTherapist()  // user.user_type === 'therapist'
authService.isClient()     // user.user_type === 'client'
authService.getUser()      // returns cached user or from localStorage

// Login response sets token + user
const { success, user } = await authService.login(email, password)
```

No route guards — pages check auth internally and redirect if needed.

## Route Map

### Public
- `/` — LandingPage
- `/login`, `/register` — Auth pages
- `/blog`, `/blog/:slug` — Blog
- `/acolhimento` — Welcome/intake landing
- `/enigma` — Assessment quiz
- `/form` — Intake form

### Client (auth required)
- `/dashboard` — ClientDashboardPage (main)
- `/matching` — Find therapist
- `/scheduling` — Book appointment
- `/confirmation` — Post-booking
- `/credits` — Purchase credits
- `/atividades/:slug` — Wellness activities

### Therapist (auth required)
- `/therapist/dashboard` — TherapistDashboardPage
- `/therapist/profile/edit` — Profile editor
- `/therapist/questionarios/:slug/respostas` — Questionnaire responses
- `/therapist/respostas/:id` — Response detail
- `/blog-admin` — Article management
- `/blog-admin/new`, `/blog-admin/:slug/edit` — Article editor

### B2B Company (public, slug-based)
- `/empresa/:slug` — Company landing page
- `/empresa/:slug/cadastro` — Employee registration
- `/empresa/:slug/psicologos` — Company therapist list
- `/empresa/:slug/agendar/:therapistId` — Book with company therapist
- `/empresa/:slug/rh` — HR dashboard (analytics)
- `/empresa/:slug/questionario/:questionnaire_slug` — Assessment form

## Component Conventions

- Shadcn/ui components in `components/ui/` — use these for all UI primitives
- `cn()` from `lib/utils.js` for conditional class merging
- Forms: React Hook Form + Zod schemas
- Toasts: Sonner (`toast.success()`, `toast.error()`)
- Icons: Lucide React
- Pages are self-contained — each imports its own services and components

## Running Locally

```bash
cd frontend
npm install
npm run dev  # runs on port 5173
```

Environment: create `.env` with `VITE_API_URL=http://localhost:3000/api/v1`
