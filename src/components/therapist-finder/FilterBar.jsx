import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input.jsx'
import { Button } from '@/components/ui/button.jsx'
import { X, Video, MapPin, Filter as FilterIcon, Compass } from 'lucide-react'
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

export default function FilterBar({ filters, onChange, onClear, totalCount }) {
  const [availableThemes, setAvailableThemes] = useState([])
  const [availableAbordagens, setAvailableAbordagens] = useState([])

  useEffect(() => {
    let cancelled = false
    therapistService.getPublicThemes()
      .then(themes => { if (!cancelled) setAvailableThemes(themes) })
      .catch(() => {})
    therapistService.getAbordagens()
      .then(abordagens => { if (!cancelled) setAvailableAbordagens(abordagens) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

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
  const toggleAbordagem = (slug) => {
    const current = filters.abordagem_slugs || []
    const next = current.includes(slug) ? current.filter(x => x !== slug) : [...current, slug]
    onChange({ ...filters, abordagem_slugs: next })
  }

  const hasAnyFilter = Object.entries(filters).some(([k, v]) => {
    if (k === 'theme_ids' || k === 'tag_ids' || k === 'abordagem_slugs') return Array.isArray(v) && v.length > 0
    if (k === 'radius_km') return false
    return v != null && v !== ''
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <FilterIcon className="h-4 w-4" />
          <span className="font-semibold">Filtros</span>
          {totalCount != null && (
            <span className="text-gray-500">· {totalCount} {totalCount === 1 ? 'resultado' : 'resultados'}</span>
          )}
        </div>
        {hasAnyFilter && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-gray-500 hover:text-gray-700">
            <X className="h-3 w-3 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <FilterRow label="Gênero do profissional">
          {GENDER_OPTIONS.map(opt => (
            <Chip key={opt.value} active={filters.gender === opt.value} onClick={() => toggleField('gender', opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Atende">
          {AUDIENCE_OPTIONS.map(opt => (
            <Chip key={opt.value} active={filters.audience === opt.value} onClick={() => toggleField('audience', opt.value)}>
              {opt.label}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Modalidade">
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
        </FilterRow>

        {filters.modality === 'presencial' && (
          <FilterRow label="Proximidade">
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
          </FilterRow>
        )}

        {availableThemes.length > 0 && (
          <FilterRow label="O que te trouxe aqui">
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
          </FilterRow>
        )}

        {availableAbordagens.length > 0 && (
          <FilterRow label="Abordagem terapêutica">
            {availableAbordagens.map(abordagem => (
              <Chip
                key={abordagem.slug}
                active={(filters.abordagem_slugs || []).includes(abordagem.slug)}
                onClick={() => toggleAbordagem(abordagem.slug)}
                title={abordagem.name}
              >
                {abordagem.name}
              </Chip>
            ))}
          </FilterRow>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
        <Link
          to="/triagem"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-700 underline underline-offset-4"
        >
          <Compass className="h-3.5 w-3.5" />
          Nenhum desses te descreve? Responda 3 perguntas →
        </Link>
      </div>
    </div>
  )
}

function FilterRow({ label, children }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
