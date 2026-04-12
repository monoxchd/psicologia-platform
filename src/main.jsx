import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner.jsx'
import './index.css'
import './App.css'
import { router } from './router.jsx'

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
    <RouterProvider router={router} />
    <Toaster />
  </StrictMode>,
)
