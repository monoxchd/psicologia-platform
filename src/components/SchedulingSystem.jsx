import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Clock, CheckCircle, ArrowLeft, Loader2, Brain, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api.js'
import authService from '../services/authService.js'
import therapistService from '../services/therapistService.js'
import appointmentService from '../services/appointmentService.js'

const formatPrice = (price) => {
  return parseFloat(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function SchedulingSystem({
  selectedTherapistId,
  onBack,
  onScheduleComplete
}) {
  const navigate = useNavigate()
  const isLoggedIn = authService.isLoggedIn()

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedService, setSelectedService] = useState(null)
  const [step, setStep] = useState('service') // 'service', 'datetime', 'confirm'
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState(null)
  const [availability, setAvailability] = useState({})
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return

    const fetchTherapists = async () => {
      try {
        const response = await apiService.get('/therapists')
        setTherapists(response)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching therapists:', error)
        setLoading(false)
      }
    }

    fetchTherapists()
  }, [isLoggedIn])

  const therapist = selectedTherapistId
    ? therapists.find(t => t.id === selectedTherapistId)
    : therapists[0]

  const availableDates = useMemo(() => {
    return Object.keys(availability)
      .filter(date => {
        const slots = availability[date]
        return slots && slots.length > 0 && slots.some(s => s.available)
      })
      .sort()
  }, [availability])

  const availableTimes = useMemo(() => {
    if (!selectedDate || !availability[selectedDate]) return []
    return availability[selectedDate]
  }, [selectedDate, availability])

  if (!isLoggedIn) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Por favor, crie o seu cadastro para agendar</h2>
            <p className="text-gray-600">
              Para agendar uma sessão online, você precisa ter uma conta na TerapiaConecta.
              Preencha nosso formulário e entraremos em contato para finalizar seu cadastro.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate('/form')}
            >
              Quero me cadastrar
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => navigate('/login', { state: { from: '/scheduling' } })}
            >
              Já tenho conta — Entrar
            </Button>
          </div>
          {onBack && (
            <Button variant="link" onClick={onBack} className="text-gray-500">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando terapeutas...</p>
        </CardContent>
      </Card>
    )
  }

  if (!therapist) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>Erro: Nenhum terapeuta disponível</p>
          <Button onClick={onBack} className="mt-4">
            Voltar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const availableServices = (therapist.services || []).filter(s => s.requires_login)

  const fetchAvailability = async () => {
    setLoadingAvailability(true)
    try {
      const data = await therapistService.getTherapistAvailability(therapist.id, { duration: selectedService.duration })
      setAvailability(data.availability || {})
    } catch (error) {
      console.error('Error fetching availability:', error)
      setAvailability({})
    } finally {
      setLoadingAvailability(false)
    }
  }

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

  const handleGoToDatetime = () => {
    setSelectedDate('')
    setSelectedTime('')
    fetchAvailability()
    setStep('datetime')
  }

  const handleSchedule = async () => {
    setBooking(true)
    setBookingError(null)

    try {
      await appointmentService.createAppointment({
        therapist_id: therapist.id,
        scheduled_at: `${selectedDate} ${selectedTime}`,
        duration: selectedService.duration,
        mode: 'online',
        service_id: selectedService.id,
      })

      onScheduleComplete({
        therapist: therapist.name,
        therapistId: therapist.id,
        date: selectedDate,
        time: selectedTime,
        duration: selectedService.duration,
        cost: selectedService.price,
        service: selectedService.name,
        specialty: therapist.specialty,
        bookingConfirmed: true,
      })
    } catch (error) {
      const msg = error.errors?.[0] || 'Erro ao agendar sessão. Tente novamente.'
      setBookingError(msg)
    } finally {
      setBooking(false)
    }
  }

  if (step === 'service') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <div className="flex items-center gap-4">
            {therapist.profile_photo_url ? (
              <img
                src={therapist.profile_photo_url}
                alt={therapist.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Brain className="h-7 w-7 text-purple-600" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl">{therapist.name}</CardTitle>
              <CardDescription className="text-lg">{therapist.specialty}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Escolha o tipo de sessão:</h3>
            {availableServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Este terapeuta ainda não possui serviços disponíveis para agendamento online.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {availableServices.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedService?.id === service.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedService(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-gray-600">{service.description}</p>
                          )}
                          <p className="text-sm text-gray-500">{service.duration} minutos</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">
                            {formatPrice(service.price)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {availableServices.length > 0 && (
            <Button
              className="w-full"
              size="lg"
              disabled={!selectedService}
              onClick={handleGoToDatetime}
            >
              Continuar para Agendamento
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (step === 'datetime') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('service')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <CardTitle className="text-2xl">Escolha Data e Horário</CardTitle>
          <CardDescription>
            {selectedService.name} — {selectedService.duration} minutos — {formatPrice(selectedService.price)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAvailability ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-500">Carregando horários disponíveis...</p>
            </div>
          ) : availableDates.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum horário disponível no momento.</p>
              <p className="text-sm text-gray-400 mt-1">O terapeuta ainda não definiu sua disponibilidade.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Datas Disponíveis
                </h3>
                <div className="flex flex-wrap gap-3">
                  {availableDates.map((date) => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? "default" : "outline"}
                      className="h-auto p-3"
                      onClick={() => {
                        setSelectedDate(date)
                        setSelectedTime('')
                      }}
                    >
                      {formatDate(date)}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedDate && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Horários Disponíveis
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableTimes.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        disabled={!slot.available}
                        className={!slot.available ? "border-red-200 bg-red-50 text-red-400 line-through opacity-70 cursor-not-allowed hover:bg-red-50" : ""}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep('confirm')}
              >
                Revisar Agendamento
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  if (step === 'confirm') {
    const selectedDateObj = new Date(selectedDate + 'T00:00:00')
    const formattedDate = selectedDateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('datetime')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <CardTitle className="text-2xl">Confirmar Agendamento</CardTitle>
          <CardDescription>Revise os detalhes da sua sessão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                {therapist.profile_photo_url ? (
                  <img
                    src={therapist.profile_photo_url}
                    alt={therapist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Brain className="h-7 w-7 text-purple-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{therapist.name}</h3>
                  <p className="text-gray-600">{therapist.specialty}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Data</p>
                    <p className="text-sm text-gray-600">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Horário</p>
                    <p className="text-sm text-gray-600">{selectedTime} ({selectedService.duration} min)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-3">Resumo</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{selectedService.name}</span>
                  <span>{formatPrice(selectedService.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa da plataforma</span>
                  <span className="text-green-600">Incluída</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(selectedService.price)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">O que acontece agora:</p>
                  <ul className="mt-2 space-y-1 text-green-700">
                    <li>Você receberá um email de confirmação</li>
                    <li>Link da videochamada será enviado 15 min antes</li>
                    <li>Você pode cancelar até 24h antes sem cobrança</li>
                  </ul>
                </div>
              </div>
            </div>

            {bookingError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{bookingError}</p>
              </div>
            )}

            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
              onClick={handleSchedule}
              disabled={booking}
            >
              {booking ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Agendando...
                </>
              ) : (
                'Confirmar e Agendar'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
