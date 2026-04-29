import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Star, User, ExternalLink, Brain, Clock, LogIn, Video, MapPin, MessageCircle } from 'lucide-react'
import authService from '../../services/authService'
import { track } from '../../services/analytics'
import { appendSourceTag, openWhatsApp } from '../../utils/whatsapp'

function getLowestPrice(therapist) {
  if (!therapist.services || therapist.services.length === 0) return null
  const prices = therapist.services.map(s => parseFloat(s.price)).filter(n => !Number.isNaN(n))
  if (prices.length === 0) return null
  return Math.min(...prices)
}

function ModalityBadges({ modalities }) {
  if (!modalities) return null
  const remote = !!modalities.remote
  const presencial = !!modalities.presencial
  if (!remote && !presencial) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {remote && (
        <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
          <Video className="h-3 w-3 mr-1" />
          Online
        </Badge>
      )}
      {presencial && (
        <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
          <MapPin className="h-3 w-3 mr-1" />
          Presencial
        </Badge>
      )}
    </div>
  )
}

function OfficesLine({ offices, nearestOffice }) {
  const activeOffices = (offices || []).filter(o => o && (o.active !== false))
  if (activeOffices.length === 0) return null

  // When a CEP filter is applied, backend surfaces the nearest office with distance.
  if (nearestOffice && nearestOffice.distance_km != null) {
    const label = nearestOffice.label || nearestOffice.neighborhood || 'Local'
    const extraCount = activeOffices.length - 1
    return (
      <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
        <MapPin className="h-3 w-3 flex-shrink-0" />
        {activeOffices.length > 1 && (
          <span className="font-medium text-gray-700">{activeOffices.length} locais · </span>
        )}
        <span>mais próximo: {label}</span>
        <span className="text-gray-400">· {nearestOffice.distance_km.toFixed(1)} km</span>
        {extraCount > 0 && (
          <span className="text-gray-400">(+{extraCount} {extraCount === 1 ? 'outro' : 'outros'})</span>
        )}
      </p>
    )
  }

  // No CEP filter: list up to 3 office labels
  const labels = activeOffices
    .slice(0, 3)
    .map(o => o.label || o.neighborhood)
    .filter(Boolean)
  if (labels.length === 0) return null
  const extra = activeOffices.length - labels.length
  return (
    <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
      <MapPin className="h-3 w-3 flex-shrink-0" />
      {labels.join(' · ')}
      {extra > 0 && <span className="text-gray-400">+{extra}</span>}
    </p>
  )
}

export default function TherapistCard({ therapist, index }) {
  const navigate = useNavigate()
  const loggedIn = authService.isLoggedIn()
  const lowestPrice = getLowestPrice(therapist)

  const handleScheduleClick = () => {
    track('Therapist Card Click', {
      therapist_id: therapist.id,
      position: index ?? 0,
      path: window.location.pathname,
    })
    if (loggedIn) {
      navigate('/scheduling', { state: { therapistId: therapist.id } })
      return
    }
    if (therapist.acolhimentoPrice) {
      track('WhatsApp Click', {
        source: 'therapist_card',
        path: window.location.pathname,
        therapist: therapist.name,
      })
      const message = appendSourceTag(
        `Olá, gostaria de agendar uma sessão de acolhimento com ${therapist.name}.`,
        { therapist: therapist.name }
      )
      openWhatsApp({ message })
      return
    }
    navigate('/form')
  }

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            {therapist.image && therapist.image !== '👨‍⚕️' ? (
              <img
                src={therapist.image}
                alt={therapist.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Brain className="h-7 w-7 text-purple-600" />
              </div>
            )}
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">{therapist.name}</CardTitle>
              <CardDescription className="truncate">{therapist.specialty}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="ml-2 flex-shrink-0">
            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
            {therapist.rating}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 flex flex-col">
        <ModalityBadges modalities={therapist.modalities} />
        <OfficesLine offices={therapist.offices} nearestOffice={therapist.nearestOffice} />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-1" />
            <span>{therapist.experience}</span>
          </div>
          {lowestPrice != null && (
            <div className="flex items-center text-green-600 font-medium">
              <span>a partir de R$ {lowestPrice.toFixed(0)}</span>
            </div>
          )}
        </div>

        {therapist.tags && therapist.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {therapist.tags.slice(0, 4).map(tag => (
              <span key={tag.id} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {tag.name}
              </span>
            ))}
            {therapist.tags.length > 4 && (
              <span className="text-[10px] text-gray-400 px-1">+{therapist.tags.length - 4}</span>
            )}
          </div>
        )}

        {therapist.bio && (
          <p
            className="text-sm text-gray-600 line-clamp-4 cursor-pointer"
            onClick={(e) => e.currentTarget.classList.toggle('line-clamp-4')}
          >
            {therapist.bio}
          </p>
        )}

        {therapist.crpNumber && (
          <div className="text-xs text-gray-500 text-center py-2 border-t">
            CRP: {therapist.crpNumber}
          </div>
        )}

        <div className="space-y-2 pt-2 mt-auto">
          {!loggedIn && therapist.acolhimentoPrice && (
            <div className="text-xs text-emerald-700 bg-emerald-50 rounded-md px-2 py-1.5 text-center">
              Sessão de Acolhimento: R$ {therapist.acolhimentoPrice.toFixed(2).replace('.', ',')} · via WhatsApp
            </div>
          )}
          <Button className="w-full" onClick={handleScheduleClick}>
            {loggedIn ? (
              <><Clock className="h-4 w-4 mr-2" />Agendar Sessão</>
            ) : therapist.acolhimentoPrice ? (
              <><MessageCircle className="h-4 w-4 mr-2" />Conversar no WhatsApp</>
            ) : (
              <><LogIn className="h-4 w-4 mr-2" />Agendar Sessão</>
            )}
          </Button>
          {therapist.personalSiteUrl && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(therapist.personalSiteUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Site
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
