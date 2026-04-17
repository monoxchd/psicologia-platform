import { User, Baby, Video, MapPin, Users } from 'lucide-react'

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
]

export default function PromptTiles({ onSelect, onSeeAll }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          O que você está procurando?
        </h2>
        <p className="text-gray-600">
          Começa por aqui — a gente afina o resultado com você.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TILES.map(tile => {
          const Icon = tile.icon
          return (
            <button
              key={tile.key}
              type="button"
              onClick={() => onSelect(tile.filters, tile.key)}
              className="group flex items-center gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                <Icon className="h-6 w-6 text-blue-600" />
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
