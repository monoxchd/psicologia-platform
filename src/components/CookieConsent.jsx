import { useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import useCookieConsent from '../hooks/useCookieConsent.js'
import { loadGTM, gtmPageview } from '../services/gtm.js'
import { isMarketingRoute } from '../utils/marketingRoutes.js'

export default function CookieConsent() {
  const { consent, accept, rejectNonEssential, isPending } = useCookieConsent()

  useEffect(() => {
    if (consent !== 'accepted') return
    loadGTM()
    if (isMarketingRoute(window.location.pathname)) {
      gtmPageview(window.location.pathname + window.location.search)
    }
  }, [consent])

  if (!isPending) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-4 sm:max-w-[260px] z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-3"
    >
      <p className="text-xs text-gray-600 leading-snug mb-3">
        Usamos cookies para medir como você chegou ao site. Sua terapia segue privada.
      </p>
      <div className="flex flex-col gap-2">
        <Button
          onClick={accept}
          className="h-11 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Aceitar
        </Button>
        <Button
          variant="outline"
          onClick={rejectNonEssential}
          className="h-11"
        >
          Apenas essenciais
        </Button>
      </div>
    </div>
  )
}
