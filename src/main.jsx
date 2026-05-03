import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { Toaster } from '@/components/ui/sonner.jsx'
import './index.css'
import './App.css'
import { router } from './router.jsx'

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
    ignoreErrors: [
      // Browser extension noise + harmless client-side rejections
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
  })
}

// Plausible Analytics — production only, keeps dev traffic out of stats.
if (import.meta.env.PROD) {
  // Queue shim so `window.plausible(...)` calls made before the script loads
  // (e.g. during the first render) are captured and flushed on init.
  window.plausible =
    window.plausible ||
    function () {
      ;(window.plausible.q = window.plausible.q || []).push(arguments)
    }
  window.plausible.init = window.plausible.init || function (i) { window.plausible.o = i || {} }

  const script = document.createElement('script')
  script.defer = true
  script.src = 'https://plausible.io/js/pa-8XfqnrqJTaIkaJvOh9KdR.js'
  script.onload = () => window.plausible.init()
  document.head.appendChild(script)
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
      <Toaster />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
