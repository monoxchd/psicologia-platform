import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { Toaster } from '@/components/ui/sonner.jsx'
import './index.css'
import './App.css'
import { router } from './router.jsx'
import CookieConsent from './components/CookieConsent.jsx'
import { readConsent, CONSENT_ACCEPTED } from './utils/cookieConsent.js'
import { loadGTM } from './services/gtm.js'

// Sentry — only in production AND when DSN is configured. Quiet in dev.
// PII is off by default to avoid capturing sensitive client data on a
// mental-health platform; opt in per-event when richer context is needed.
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0,            // turn on later if you want APM
    replaysSessionSampleRate: 0,    // session replay can capture sensitive UI; off
    replaysOnErrorSampleRate: 0,
    // The anonymous questionnaire access code (?codigo= / /resume/<code> /
    // /progress/<code>) is the only pseudonymous link between a respondent and
    // their answers — it must never leave the device via error telemetry.
    beforeSend(event) {
      const url = event.request?.url
      if (url) {
        try {
          const u = new URL(url)
          if (u.searchParams.has('codigo')) {
            u.searchParams.delete('codigo')
            event.request.url = u.toString()
          }
        } catch {
          // non-absolute URL — leave as-is
        }
      }
      return event
    },
    beforeBreadcrumb(breadcrumb) {
      // Scrub the code from XHR/fetch breadcrumbs (it sits in the API path).
      const url = breadcrumb.data?.url
      if (typeof url === 'string') {
        breadcrumb.data.url = url
          .replace(/\/(resume|progress)\/[a-f0-9]+/i, '/$1/[REDACTED]')
      }
      return breadcrumb
    },
    ignoreErrors: [
      // Browser extension noise + harmless client-side rejections
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
  })
}

// GTM — loaded only when the user has already consented in a prior visit.
// First-time visitors load GTM from the CookieConsent banner after Aceitar.
// Marketing manages GA4 + other tags inside the GTM container.
if (import.meta.env.PROD && readConsent() === CONSENT_ACCEPTED) {
  loadGTM()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div style={{ padding: '2rem', textAlign: 'center', color: '#374151' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Algo deu errado.</h2>
          <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
            Já fomos avisados. Por favor, recarregue a página.
          </p>
        </div>
      }
    >
      <RouterProvider router={router} />
      <CookieConsent />
      <Toaster />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
