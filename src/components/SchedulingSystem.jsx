import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Clock, CheckCircle, ArrowLeft, Loader2, Brain, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api.js'
import authService from '../services/authService.js'

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

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedService, setSelectedService] = useState(null)
  const [step, setStep] = useState('service') // 'service', 'datetime', 'confirm'
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState(null)

  useEffect(() => {
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
  }, [])

  const therapist = selectedTherapistId
    ? therapists.find(t => t.id === selectedTherapistId)
    : therapists[0]

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

  // Generate next 7 weekdays with availability
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 1; i <= 14 && dates.length < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push({
          date: dateStr,
          display: date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          }),
          fullDisplay: date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })
        })
      }
    }
    return dates
  }

  const getAvailableTimes = () => {
    if (!selectedDate) return []
    return ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
  }

  const handleSchedule = async () => {
    setBooking(true)
    setBookingError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const appointment = {
        therapist: therapist.name,
        therapistId: therapist.id,
        date: selectedDate,
        time: selectedTime,
        duration: selectedService.duration,
        cost: selectedService.price,
        service: selectedService.name,
        specialty: therapist.specialty,
        bookingConfirmed: true,
      }

      onScheduleComplete(appointment)
    } catch (error) {
      console.error('Error booking session:', error)
      setBookingError('Erro ao agendar sessão. Tente novamente.')
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
              onClick={() => setStep('datetime')}
            >
              Continuar para Agendamento
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (step === 'datetime') {
    const availableDates = getAvailableDates()
    const availableTimes = getAvailableTimes()

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
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Datas Disponíveis
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {availableDates.map((dateObj) => (
                <Button
                  key={dateObj.date}
                  variant={selectedDate === dateObj.date ? "default" : "outline"}
                  className="h-auto p-3 text-left"
                  onClick={() => {
                    setSelectedDate(dateObj.date)
                    setSelectedTime('')
                  }}
                >
                  <div>
                    <div className="font-medium">{dateObj.display}</div>
                    <div className="text-xs opacity-70">{dateObj.fullDisplay}</div>
                  </div>
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
              <div className="grid grid-cols-3 gap-3">
                {availableTimes.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
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
