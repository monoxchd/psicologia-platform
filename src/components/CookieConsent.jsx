import { useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import useCookieConsent from '../hooks/useCookieConsent.js'
import { loadGA4, ga4Pageview } from '../services/googleAnalytics.js'
import { isMarketingRoute } from '../utils/marketingRoutes.js'

export default function CookieConsent() {
  const { consent, accept, rejectNonEssential, isPending } = useCookieConsent()

  useEffect(() => {
    if (consent !== 'accepted') return
    loadGA4()
    if (isMarketingRoute(window.location.pathname)) {
      ga4Pageview(window.location.pathname + window.location.search)
    }
  }, [consent])

  if (!isPending) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-4 sm:max-w-md z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-5"
    >
      <h2 className="text-base font-semibold text-gray-900 mb-2">
        Cookies e medição
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Usamos cookies para entender como você chegou até a gente e melhorar a experiência no site.
        Sua jornada de terapia continua privada — sessões, anotações e registros de humor
        ficam fora dessas medições.
      </p>
      <div className="flex flex-col-reverse sm:flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={rejectNonEssential}
          className="flex-1"
        >
          Apenas essenciais
        </Button>
        <Button
          size="sm"
          onClick={accept}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Aceitar
        </Button>
      </div>
    </div>
  )
}
