import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import {
  Loader2,
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  Star,
  ChevronRight
} from 'lucide-react'
import companyService from '@/services/companyService'
import therapistService from '@/services/therapistService'
import appointmentService from '@/services/appointmentService'
import horizontalLogo from '../assets/horizontal-logo.png'

const SESSION_TYPES = [
  {
    duration: 20,
    title: 'Entrevista Psicológica',
    description: 'Sessão rápida de triagem',
    popular: false,
  },
  {
    duration: 30,
    title: 'Check-in',
    description: 'Acompanhamento e follow-up',
    popular: false,
  },
  {
    duration: 50,
    title: 'Sessão Padrão',
    description: 'Sessão completa de terapia',
    popular: true,
  },
]

export default function CompanySchedulingPage() {
  const { slug, therapistId } = useParams()
  const [company, setCompany] = useState(null)
  const [therapist, setTherapist] = useState(null)
  const [availability, setAvailability] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Flow state
  const [step, setStep] = useState(1)
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [booked, setBooked] = useState(false)
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [companyData, therapistData, availData] = await Promise.all([
          companyService.getCompanyBySlug(slug),
          therapistService.getTherapistById(therapistId),
          therapistService.getTherapistAvailability(therapistId),
        ])
        setCompany(companyData.company)
        setTherapist(therapistData)
        setAvailability(availData.availability || {})
      } catch (err) {
        setError('Não foi possível carregar os dados.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug, therapistId])

  // Filter dates that have enough time for the selected duration
  const availableDates = useMemo(() => {
    if (!selectedDuration) return []
    return Object.keys(availability)
      .filter((date) => {
        const slots = availability[date]
        return slots && slots.length > 0
      })
      .sort()
  }, [availability, selectedDuration])

  // Filter times for selected date that can fit the duration
  const availableTimes = useMemo(() => {
    if (!selectedDate || !availability[selectedDate]) return []
    return availability[selectedDate]
  }, [selectedDate, availability])

  const handleSelectDuration = (duration) => {
    setSelectedDuration(duration)
    setSelectedDate(null)
    setSelectedTime(null)
    setStep(2)
  }

  const handleSelectDate = (date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleSelectTime = (time) => {
    setSelectedTime(time)
    setStep(3)
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    setBookingError('')
    try {
      await appointmentService.createAppointment({
        therapist_id: parseInt(therapistId),
        scheduled_at: `${selectedDate} ${selectedTime}`,
        duration: selectedDuration,
        mode: 'online',
      })
      setBooked(true)
    } catch (err) {
      const errorMsg = err.errors?.[0] || 'Erro ao agendar. Tente novamente.'
      setBookingError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const primaryColor = company?.primary_color || '#4f46e5'

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.getTime() === today.getTime()) return 'Hoje'
    if (date.getTime() === tomorrow.getTime()) return 'Amanhã'
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const selectedSessionType = SESSION_TYPES.find((t) => t.duration === selectedDuration)

  // Success screen
  if (booked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link to={`/empresa/${slug}`}>
                <img
                  src={company?.logo_url || horizontalLogo}
                  alt={company?.logo_url ? `${company.name} Logo` : 'Terapia Conecta Logo'}
                  className="h-8 object-contain"
                />
              </Link>
              <span
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {company?.name}
              </span>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-16 px-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <CheckCircle2 className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sessão Agendada!</h2>
              <p className="text-gray-600 mb-6">
                Sua sessão com <strong>{therapist?.name}</strong> foi confirmada.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Data</span>
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Horário</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duração</span>
                  <span className="font-medium">{selectedDuration} minutos</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Modalidade</span>
                  <span className="font-medium">Online</span>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 text-sm text-indigo-800">
                <strong>Próximos passos:</strong> Você receberá o link da sessão por email.
                Caso precise cancelar, faça com pelo menos 24h de antecedência.
              </div>

              <div className="space-y-3">
                <Link to="/dashboard">
                  <Button
                    className="w-full text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Ir para Minha Conta
                  </Button>
                </Link>
                <Link to={`/empresa/${slug}/psicologos`}>
                  <Button variant="outline" className="w-full">
                    Ver Outros Psicólogos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to={`/empresa/${slug}`}>
              <img
                src={company?.logo_url || horizontalLogo}
                alt={company?.logo_url ? `${company.name} Logo` : 'Terapia Conecta Logo'}
                className="h-8 object-contain"
              />
            </Link>
            <span
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              {company?.name}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          to={`/empresa/${slug}/psicologos`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos psicólogos
        </Link>

        {/* Therapist info */}
        <div className="flex items-center gap-4 mb-8">
          {therapist?.profile_photo_url ? (
            <img
              src={therapist.profile_photo_url}
              alt={therapist.name}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {therapist?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{therapist?.name}</h2>
            <p className="text-sm text-gray-500">{therapist?.specialty}</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
                style={s <= step ? { backgroundColor: primaryColor } : {}}
              >
                {s}
              </div>
              {s < 3 && (
                <ChevronRight className="h-4 w-4 text-gray-300" />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {step === 1 && 'Tipo de sessão'}
            {step === 2 && 'Data e horário'}
            {step === 3 && 'Confirmação'}
          </span>
        </div>

        {/* Step 1: Duration */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Escolha o tipo de sessão</h3>
            {SESSION_TYPES.map((type) => (
              <Card
                key={type.duration}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDuration === type.duration ? 'ring-2' : ''
                }`}
                style={selectedDuration === type.duration ? { borderColor: primaryColor, boxShadow: `0 0 0 2px ${primaryColor}30` } : {}}
                onClick={() => handleSelectDuration(type.duration)}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      <Clock className="h-5 w-5" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{type.title}</h4>
                        {type.popular && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{type.duration} min</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: Date + Time */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Escolha a data e horário</h3>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Alterar tipo
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {selectedSessionType?.title} — {selectedDuration} minutos
            </div>

            {availableDates.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum horário disponível no momento.</p>
                <p className="text-sm text-gray-400 mt-1">O terapeuta ainda não definiu sua disponibilidade.</p>
              </div>
            ) : (
              <>
                {/* Date buttons */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Data</p>
                  <div className="flex flex-wrap gap-2">
                    {availableDates.map((date) => (
                      <button
                        key={date}
                        onClick={() => handleSelectDate(date)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedDate === date
                            ? 'text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                        style={selectedDate === date ? { backgroundColor: primaryColor } : {}}
                      >
                        {formatDate(date)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time buttons */}
                {selectedDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Horário</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleSelectTime(time)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedTime === time
                              ? 'text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                          style={selectedTime === time ? { backgroundColor: primaryColor } : {}}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Confirmar Agendamento</h3>

            <Card>
              <CardContent className="p-6 space-y-4">
                {/* Therapist */}
                <div className="flex items-center gap-3 pb-4 border-b">
                  {therapist?.profile_photo_url ? (
                    <img
                      src={therapist.profile_photo_url}
                      alt={therapist.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {therapist?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{therapist?.name}</p>
                    <p className="text-sm text-gray-500">{therapist?.specialty}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tipo</span>
                    <span className="font-medium">{selectedSessionType?.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Data</span>
                    <span className="font-medium">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Horário</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duração</span>
                    <span className="font-medium">{selectedDuration} minutos</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Modalidade</span>
                    <span className="font-medium">Online</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-800">
                    Sessão coberta pelo convênio corporativo da {company?.name}. Sem custo para você.
                  </div>
                </div>
              </CardContent>
            </Card>

            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {bookingError}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  'Confirmar Agendamento'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
