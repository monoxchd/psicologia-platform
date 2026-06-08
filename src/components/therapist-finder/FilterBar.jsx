import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover.jsx'
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose,
} from '@/components/ui/sheet.jsx'
import {
  X, Video, MapPin, Compass, Users, UserRound, CalendarDays, Sparkles, ChevronDown, ChevronRight,
} from 'lucide-react'
import { useIsMobile } from '../../hooks/use-mobile'
import therapistService from '../../services/therapistService'
import { formatCep } from '../../utils/cep'

const GENDER_OPTIONS = [
  { value: 'female', label: 'Feminino' },
  { value: 'male', label: 'Masculino' },
]

const AUDIENCE_OPTIONS = [
  { value: 'children', label: 'Crianças' },
  { value: 'teens', label: 'Adolescentes' },
  { value: 'adults', label: 'Adultos' },
]

const MODALITY_OPTIONS = [
  { value: 'remote', label: 'Online', icon: Video },
  { value: 'presencial', label: 'Presencial', icon: MapPin },
]

const RADIUS_OPTIONS = [3, 5, 10, 20]

const DAY_OPTIONS = [
  { value: 'mon', label: 'Seg' },
  { value: 'tue', label: 'Ter' },
  { value: 'wed', label: 'Qua' },
  { value: 'thu', label: 'Qui' },
  { value: 'fri', label: 'Sex' },
  { value: 'sat', label: 'Sáb' },
  { value: 'sun', label: 'Dom' },
]

const PERIOD_OPTIONS = [
  { value: 'morning',   label: 'Manhã',  hint: '06h–12h' },
  { value: 'afternoon', label: 'Tarde',  hint: '12h–18h' },
  { value: 'evening',   label: 'Noite',  hint: '18h–22h' },
]

function Chip({ active, onClick, children, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={
        "px-3 py-1.5 rounded-full text-sm border transition-colors " +
        (active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-300 hover:border-gray-500")
      }
    >
      {children}
    </button>
  )
}

// One category trigger that opens only its own group of options.
// Popover on desktop, bottom Sheet on mobile (bigger touch targets + sticky close).
function FilterDropdown({ icon, label, title, description, summary, count, active, totalCount, contentClassName, children }) {
  const isMobile = useIsMobile()
  const Icon = icon

  const trigger = (
    <button
      type="button"
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm transition-colors " +
        (active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-300 hover:border-gray-500")
      }
    >
      <Icon className="h-4 w-4" />
      <span className="font-medium">{summary || label}</span>
      {count != null && (
        <span
          className={
            "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold " +
            (active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600")
          }
        >
          {count}
        </span>
      )}
      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
    </button>
  )

  if (isMobile) {
    const ctaLabel = totalCount != null
      ? `Ver ${totalCount} ${totalCount === 1 ? 'psicólogo' : 'psicólogos'}`
      : 'Ver resultados'
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>{title || label}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className="overflow-y-auto px-4">{children}</div>
          <SheetFooter>
            <SheetClose asChild>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">{ctaLabel}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className={contentClassName || 'w-80'}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">{title || label}</p>
        {children}
        {description && <p className="mt-3 text-xs text-gray-500">{description}</p>}
      </PopoverContent>
    </Popover>
  )
}

export default function FilterBar({ filters, onChange, onClear, totalCount }) {
  const [availableThemes, setAvailableThemes] = useState([])
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    let cancelled = false
    therapistService.getPublicThemes()
      .then(themes => { if (!cancelled) setAvailableThemes(themes) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // Show edge fades only while there's more of the filter row to swipe to.
  const updateScrollHints = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateScrollHints()
    window.addEventListener('resize', updateScrollHints)
    return () => window.removeEventListener('resize', updateScrollHints)
  }, [availableThemes])

  const setField = (key, value) => onChange({ ...filters, [key]: value })
  const toggleField = (key, value) => {
    const next = filters[key] === value ? null : value
    onChange({ ...filters, [key]: next })
  }
  const toggleTheme = (id) => {
    const current = filters.theme_ids || []
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id]
    onChange({ ...filters, theme_ids: next })
  }
  const toggleArrayValue = (key, value) => {
    const current = filters[key] || []
    const next = current.includes(value) ? current.filter(x => x !== value) : [...current, value]
    onChange({ ...filters, [key]: next })
  }

  const hasAnyFilter = Object.entries(filters).some(([k, v]) => {
    if (k === 'theme_ids' || k === 'tag_ids' || k === 'days' || k === 'periods') {
      return Array.isArray(v) && v.length > 0
    }
    if (k === 'radius_km') return false
    return v != null && v !== ''
  })

  const audienceLabel = AUDIENCE_OPTIONS.find(o => o.value === filters.audience)?.label
  const modalityLabel = MODALITY_OPTIONS.find(o => o.value === filters.modality)?.label
  const genderLabel = GENDER_OPTIONS.find(o => o.value === filters.gender)?.label
  const availabilityCount = (filters.days || []).length + (filters.periods || []).length
  const themeCount = (filters.theme_ids || []).length

  return (
    <div className="mb-6">
      {/* Scrollable category triggers — each opens only its own group */}
      <div className="relative -mx-1">
        <div
          ref={scrollRef}
          onScroll={updateScrollHints}
          role="group"
          aria-label="Filtros — deslize para ver mais"
          className="flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
        <FilterDropdown
          icon={Users}
          label="Atende"
          title="Atende"
          summary={audienceLabel || 'Atende'}
          active={!!filters.audience}
          totalCount={totalCount}
        >
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_OPTIONS.map(opt => (
              <Chip key={opt.value} active={filters.audience === opt.value} onClick={() => toggleField('audience', opt.value)}>
                {opt.label}
              </Chip>
            ))}
          </div>
        </FilterDropdown>

        <FilterDropdown
          icon={Video}
          label="Modalidade"
          title="Modalidade"
          summary={modalityLabel || 'Modalidade'}
          active={!!filters.modality}
          totalCount={totalCount}
        >
          <div className="flex flex-wrap gap-2">
            {MODALITY_OPTIONS.map(opt => {
              const Icon = opt.icon
              return (
                <Chip key={opt.value} active={filters.modality === opt.value} onClick={() => toggleField('modality', opt.value)}>
                  <span className="inline-flex items-center gap-1">
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </span>
                </Chip>
              )
            })}
          </div>

          {filters.modality === 'presencial' && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Proximidade</p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={formatCep(filters.cep || '')}
                  onChange={e => setField('cep', formatCep(e.target.value))}
                  placeholder="00000-000"
                  className="w-32"
                  maxLength={9}
                  inputMode="numeric"
                />
                <div className="flex gap-1">
                  {RADIUS_OPTIONS.map(km => (
                    <Chip
                      key={km}
                      active={(filters.radius_km || 5) === km}
                      onClick={() => setField('radius_km', km)}
                    >
                      {km} km
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}
        </FilterDropdown>

        {availableThemes.length > 0 && (
          <FilterDropdown
            icon={Sparkles}
            label="Temas"
            title="O que te trouxe aqui"
            summary="Temas"
            count={themeCount || null}
            active={themeCount > 0}
            totalCount={totalCount}
            contentClassName="w-80"
          >
            <div className="flex flex-wrap gap-2">
              {availableThemes.map(theme => (
                <Chip
                  key={theme.id}
                  active={(filters.theme_ids || []).includes(theme.id)}
                  onClick={() => toggleTheme(theme.id)}
                  title={theme.description || undefined}
                >
                  {theme.name}
                </Chip>
              ))}
            </div>
          </FilterDropdown>
        )}

        <FilterDropdown
          icon={UserRound}
          label="Gênero"
          title="Gênero do profissional"
          summary={genderLabel || 'Gênero'}
          active={!!filters.gender}
          totalCount={totalCount}
        >
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map(opt => (
              <Chip key={opt.value} active={filters.gender === opt.value} onClick={() => toggleField('gender', opt.value)}>
                {opt.label}
              </Chip>
            ))}
          </div>
        </FilterDropdown>

        <FilterDropdown
          icon={CalendarDays}
          label="Disponibilidade"
          title="Disponibilidade"
          description="Mostramos profissionais que costumam atender nesses períodos. A disponibilidade real aparece ao agendar."
          summary="Disponibilidade"
          count={availabilityCount || null}
          active={availabilityCount > 0}
          totalCount={totalCount}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Dias</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {DAY_OPTIONS.map(opt => (
              <Chip
                key={opt.value}
                active={(filters.days || []).includes(opt.value)}
                onClick={() => toggleArrayValue('days', opt.value)}
              >
                {opt.label}
              </Chip>
            ))}
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Horários</p>
          <div className="flex flex-wrap gap-2">
            {PERIOD_OPTIONS.map(opt => (
              <Chip
                key={opt.value}
                active={(filters.periods || []).includes(opt.value)}
                onClick={() => toggleArrayValue('periods', opt.value)}
                title={opt.hint}
              >
                {opt.label} <span className="text-xs opacity-70">· {opt.hint}</span>
              </Chip>
            ))}
          </div>
        </FilterDropdown>
        </div>

        {canScrollLeft && (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" aria-hidden="true" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-end bg-gradient-to-l from-white via-white/80 to-transparent" aria-hidden="true">
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Result count + clear */}
      {(totalCount != null || hasAnyFilter) && (
        <div className="mt-2 flex items-center justify-between px-1">
          <span className="text-sm text-gray-500">
            {totalCount != null && `${totalCount} ${totalCount === 1 ? 'resultado' : 'resultados'}`}
          </span>
          {hasAnyFilter && (
            <Button variant="ghost" size="sm" onClick={onClear} className="h-auto p-0 text-gray-500 hover:text-gray-700 hover:bg-transparent">
              <X className="mr-1 h-3 w-3" />
              Limpar filtros
            </Button>
          )}
        </div>
      )}

      {/* Triage fallback */}
      <div className="mt-3 text-center">
        <Link
          to="/triagem"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 underline underline-offset-4 hover:text-emerald-700"
        >
          <Compass className="h-3.5 w-3.5" />
          Nenhum desses te descreve? Responda 3 perguntas →
        </Link>
      </div>
    </div>
  )
}
