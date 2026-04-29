import { useNavigate } from 'react-router-dom'
import { User, Baby, Video, MapPin, Users, Compass } from 'lucide-react'
import { track } from '../../services/analytics'

const TILES = [
  {
    key: 'self_adult',
    label: 'Terapia para mim',
    caption: 'Adulto buscando cuidado',
    icon: User,
    filters: { audience: 'adults' },
  },
  {
    key: 'child',
    label: 'Para uma criança',
    caption: 'Psicologia infantil',
    icon: Baby,
    filters: { audience: 'children' },
  },
  {
    key: 'online',
    label: 'Atendimento online',
    caption: 'Terapia remota',
    icon: Video,
    filters: { modality: 'remote', audience: 'adults' },
  },
  {
    key: 'presencial_sp',
    label: 'Presencial em São Paulo',
    caption: 'Sessões no meu bairro',
    icon: MapPin,
    filters: { modality: 'presencial', audience: 'adults' },
  },
  {
    key: 'triage',
    label: 'Não sei por onde começar',
    caption: 'A gente te ajuda em 3 perguntas',
    icon: Compass,
    navigateTo: '/triagem',
    highlight: true,
  },
]

export default function PromptTiles({ onSelect, onSeeAll }) {
  const navigate = useNavigate()

  const handleTileClick = (tile) => {
    if (tile.navigateTo) {
      track('Prompt Tile Click', { tile: tile.key, path: window.location.pathname })
      navigate(tile.navigateTo)
    } else {
      onSelect(tile.filters, tile.key)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          O que você está procurando?
        </h2>
        <p className="text-gray-600">
          Comece por aqui, aí gente afina o resultado com você.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TILES.map(tile => {
          const Icon = tile.icon
          const highlighted = tile.highlight
          return (
            <button
              key={tile.key}
              type="button"
              onClick={() => handleTileClick(tile)}
              className={
                'group flex items-center gap-4 p-5 rounded-xl border transition-all text-left ' +
                (highlighted
                  ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-500 hover:shadow-md sm:col-span-2'
                  : 'border-gray-200 bg-white hover:border-blue-500 hover:shadow-md')
              }
            >
              <div className={
                'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ' +
                (highlighted
                  ? 'bg-white group-hover:bg-emerald-100'
                  : 'bg-blue-50 group-hover:bg-blue-100')
              }>
                <Icon className={'h-6 w-6 ' + (highlighted ? 'text-emerald-700' : 'text-blue-600')} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{tile.label}</p>
                <p className="text-sm text-gray-500">{tile.caption}</p>
              </div>
            </button>
          )
        })}
      </div>
      <div className="text-center mt-8">
        <button
          type="button"
          onClick={onSeeAll}
          className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4"
        >
          <Users className="h-4 w-4 inline mr-1" />
          Ver todos os psicólogos
        </button>
      </div>
    </div>
  )
}
