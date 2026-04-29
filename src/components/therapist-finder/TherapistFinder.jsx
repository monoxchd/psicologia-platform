import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import therapistService from '../../services/therapistService'
import { track } from '../../services/analytics'
import WhatsAppButton from '../WhatsAppButton.jsx'
import PromptTiles from './PromptTiles.jsx'
import FilterBar from './FilterBar.jsx'
import TherapistCard from './TherapistCard.jsx'

const EMPTY_FILTERS = {
  gender: null,
  audience: null,
  modality: null,
  theme_ids: [],
  abordagem_slugs: [],
  cep: '',
  radius_km: 5,
}

function cleanFilters(filters) {
  const out = {}
  if (filters.gender) out.gender = filters.gender
  if (filters.audience) out.audience = filters.audience
  if (filters.modality) out.modality = filters.modality
  if (filters.theme_ids && filters.theme_ids.length) out.theme_ids = filters.theme_ids
  if (filters.abordagem_slugs && filters.abordagem_slugs.length) out.abordagem_slugs = filters.abordagem_slugs
  if (filters.modality === 'presencial' && filters.cep && /^\d{8}$/.test(filters.cep.replace(/\D/g, ''))) {
    out.cep = filters.cep
    out.radius_km = filters.radius_km || 5
  }
  return out
}

export default function TherapistFinder({
  initialFilters = EMPTY_FILTERS,
  showPrompt = true,
  priorityTherapistId = null,
  heading = 'Nossos Psicólogos',
  subheading = 'Conheça nossa equipe de profissionais',
  initialDisplay = null,   // if set, show only first N until user clicks "Ver todos"
  pageSize = 6,
}) {
  const [mode, setMode] = useState(showPrompt ? 'prompt' : 'results')
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, ...initialFilters })
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(!initialDisplay)
  const [page, setPage] = useState(1)
  const debounceRef = useRef(null)
  const lastFilterKeyRef = useRef('')
  const fetchSeqRef = useRef(0)

  const effectiveFilters = useMemo(() => cleanFilters(filters), [filters])
  const filterKey = useMemo(() => JSON.stringify(effectiveFilters), [effectiveFilters])

  useEffect(() => {
    if (mode !== 'results') return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const mySeq = ++fetchSeqRef.current
      fetchTherapists(effectiveFilters, filterKey, mySeq)
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, mode])

  // Reset pagination whenever filters change
  useEffect(() => {
    setPage(1)
  }, [filterKey])

  async function fetchTherapists(appliedFilters, capturedFilterKey, mySeq) {
    setLoading(true)
    setError(null)
    try {
      const data = await therapistService.getFilteredTherapists(appliedFilters)
      // Discard results from superseded fetches — the user changed filters mid-flight.
      if (mySeq !== fetchSeqRef.current) return
      let formatted = therapistService.formatTherapistsForUI(data)

      if (priorityTherapistId) {
        const idx = formatted.findIndex(t => t.id === priorityTherapistId)
        if (idx > 0) {
          const [priority] = formatted.splice(idx, 1)
          formatted.unshift(priority)
        }
      }

      setTherapists(formatted)

      if (Object.keys(appliedFilters).length > 0 && capturedFilterKey !== lastFilterKeyRef.current) {
        track('Filter Applied', {
          ...appliedFilters,
          theme_count: appliedFilters.theme_ids ? appliedFilters.theme_ids.length : 0,
          abordagem_count: appliedFilters.abordagem_slugs ? appliedFilters.abordagem_slugs.length : 0,
          result_count: formatted.length,
          path: window.location.pathname,
        })
        lastFilterKeyRef.current = capturedFilterKey
      }

      if (formatted.length === 0 && Object.keys(appliedFilters).length > 0) {
        track('Empty Results', {
          ...appliedFilters,
          theme_count: appliedFilters.theme_ids ? appliedFilters.theme_ids.length : 0,
          abordagem_count: appliedFilters.abordagem_slugs ? appliedFilters.abordagem_slugs.length : 0,
          path: window.location.pathname,
        })
      }
    } catch (err) {
      if (mySeq !== fetchSeqRef.current) return
      console.error('Failed to fetch therapists:', err)
      setError(err?.errors?.[0] || 'Não foi possível carregar os psicólogos. Tente novamente em instantes.')
      setTherapists([])
    } finally {
      if (mySeq === fetchSeqRef.current) {
        setLoading(false)
      }
    }
  }

  const handlePromptSelect = (prefilled, tileKey) => {
    track('Prompt Tile Click', { tile: tileKey, path: window.location.pathname })
    setFilters({ ...EMPTY_FILTERS, ...prefilled })
    setMode('results')
  }

  const handleSeeAll = () => {
    track('Prompt Tile Click', { tile: 'see_all', path: window.location.pathname })
    setFilters(EMPTY_FILTERS)
    setMode('results')
  }

  const handleClear = () => {
    setFilters(EMPTY_FILTERS)
    lastFilterKeyRef.current = ''
  }

  const handleSeeAllResults = () => {
    track('See All Therapists Click', { total: therapists.length, path: window.location.pathname })
    setShowAll(true)
    setPage(1)
  }

  const totalResults = therapists.length
  const useInitialCap = !!initialDisplay && !showAll
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize))
  const currentPage = Math.min(page, totalPages)

  let visibleTherapists
  if (useInitialCap) {
    visibleTherapists = therapists.slice(0, initialDisplay)
  } else {
    visibleTherapists = therapists.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  }

  if (mode === 'prompt') {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PromptTiles onSelect={handlePromptSelect} onSeeAll={handleSeeAll} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {(heading || subheading) && (
        <div className="mb-6">
          {heading && <h2 className="text-3xl font-bold text-gray-900 mb-1">{heading}</h2>}
          {subheading && <p className="text-gray-600">{subheading}</p>}
        </div>
      )}

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onClear={handleClear}
        totalCount={loading ? null : therapists.length}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : therapists.length === 0 ? (
        <EmptyState hasFilters={Object.keys(effectiveFilters).length > 0} onClear={handleClear} />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleTherapists.map((therapist, idx) => (
              <TherapistCard key={therapist.id} therapist={therapist} index={(useInitialCap ? 0 : (currentPage - 1) * pageSize) + idx} />
            ))}
          </div>

          {useInitialCap && totalResults > initialDisplay && (
            <div className="mt-8 text-center">
              <Button variant="outline" size="lg" onClick={handleSeeAllResults}>
                <Users className="h-4 w-4 mr-2" />
                Ver todos os {totalResults} psicólogos
              </Button>
            </div>
          )}

          {!useInitialCap && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página <span className="font-semibold text-gray-900">{currentPage}</span> de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
      <p className="text-lg font-semibold text-gray-900 mb-1">Nenhum psicólogo encontrado</p>
      <p className="text-sm text-gray-500 mb-5">
        {hasFilters
          ? 'Tente relaxar um filtro ou fale com a gente no WhatsApp — ajudamos você a encontrar quem combina.'
          : 'Ainda estamos preparando a lista. Volte em instantes.'}
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4"
          >
            Limpar filtros
          </button>
        )}
        <WhatsAppButton
          source="empty_results"
          label="Falar no WhatsApp"
          message="Oi, usei os filtros no site e não encontrei um psicólogo que encaixa. Pode me ajudar a escolher?"
          variant="outline"
        />
      </div>
    </div>
  )
}
