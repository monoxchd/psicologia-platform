import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import therapistService from '../../services/therapistService'
import TherapistCard from '../therapist-finder/TherapistCard.jsx'
import TriageFeedback from './TriageFeedback.jsx'
import WhatsAppButton from '../WhatsAppButton.jsx'
import { THEME_DISPLAY_NAME, THEME_SLUG_MAP, shuffleForEquity } from '../../utils/triage-matrix'
import { track } from '../../services/analytics'

const MAX_RESULTS = 3

export default function TriageResultMatch({ result }) {
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const themes = await therapistService.getPublicThemes()
        const slugToId = {}
        themes.forEach(t => { slugToId[t.slug] = t.id })

        const principalSlug = THEME_SLUG_MAP[result.temaPrincipal]
        const secondarySlug = result.temaSecundario ? THEME_SLUG_MAP[result.temaSecundario] : null

        const themeIds = [
          slugToId[principalSlug],
          secondarySlug ? slugToId[secondarySlug] : null,
        ].filter(Boolean)

        if (themeIds.length === 0) {
          if (!cancelled) setTherapists([])
          return
        }

        const data = await therapistService.getFilteredTherapists({ theme_ids: themeIds })
        const formatted = therapistService.formatTherapistsForUI(data)

        // Backend returns the union of therapists matching principal OR
        // secondary theme. Shuffle with jitter for equity and slice. Full
        // per-theme scoring lands with the P3 ranking follow-up.
        const ranked = shuffleForEquity(formatted).slice(0, MAX_RESULTS)

        if (!cancelled) {
          setTherapists(ranked)
          track('Triage Result Shown', {
            tema_principal: result.temaPrincipal,
            tema_secundario: result.temaSecundario || null,
            result_count: ranked.length,
          })
        }
      } catch (e) {
        if (!cancelled) setError('Não conseguimos carregar os psicólogos agora. Tente novamente em instantes.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [result])

  const temaNome = THEME_DISPLAY_NAME[result.temaPrincipal] || result.temaPrincipal

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Acho que esses profissionais podem te ajudar
        </h2>
        <p className="text-gray-600">
          Com base no que você compartilhou, reuni profissionais que trabalham com{' '}
          <span className="font-semibold text-gray-900">{temaNome}</span>.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-14">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : therapists.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
          <p className="text-base font-semibold text-gray-900 mb-2">
            Ainda não temos psicólogos cadastrados nesse tema
          </p>
          <p className="text-sm text-gray-500 mb-5">
            Fale com a gente no WhatsApp — ajudamos você a encontrar quem combina.
          </p>
          <WhatsAppButton
            source="triagem_empty"
            label="Falar no WhatsApp"
            message={`Oi! Fiz a triagem no site e cheguei no tema "${temaNome}", mas não vi psicólogos. Pode me ajudar?`}
            variant="outline"
          />
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-3">
            {therapists.map((t, idx) => (
              <TherapistCard key={t.id} therapist={t} index={idx} />
            ))}
          </div>
          <TriageFeedback tema={result.temaPrincipal} />
        </>
      )}
    </div>
  )
}
