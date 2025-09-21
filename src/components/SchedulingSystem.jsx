import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Clock, User, CreditCard, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import apiService from '../services/api.js'
import creditsService from '../services/creditsService.js'


const sessionDurations = [
  { minutes: 30, label: "Check-in Rápido", description: "Ideal para acompanhamento" },
  { minutes: 50, label: "Sessão Padrão", description: "Duração tradicional", popular: true },
  { minutes: 90, label: "Sessão Estendida", description: "Para trabalho profundo" }
]

export default function SchedulingSystem({
  selectedTherapist,
  userCredits,
  onBack,
  onScheduleComplete
}) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState(50)
  const [step, setStep] = useState('duration') // 'duration', 'datetime', 'confirm'
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState(null)

  // Fetch therapists from API
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

  // Get therapist data - either from selectedTherapist prop or use first available
  const therapist = selectedTherapist
    ? therapists.find(t => t.id === selectedTherapist.id || t.name === selectedTherapist.name)
    : therapists[0]

  // Handle loading and missing therapist states
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

  const sessionCost = selectedDuration * (therapist.credits_per_minute || 1.0)
  const canAfford = userCredits >= sessionCost

  // Generate next 7 days with availability
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      // Show weekdays as available (skip weekends for now)
      const dayOfWeek = date.getDay()
      if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
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
    // Available time slots during business hours
    return ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
  }

  const handleSchedule = async () => {
    setBooking(true)
    setBookingError(null)

    try {
      // For now, simulate credit deduction since we don't have a booking endpoint yet
      // In production, this would call an API endpoint that:
      // 1. Creates the appointment
      // 2. Deducts credits automatically
      // 3. Returns the booking confirmation

      console.log(`🔄 Simulating booking session for ${sessionCost} credits...`)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // For demo purposes, we'll just proceed with the booking
      // In real implementation: await apiService.post('/appointments', appointmentData)

      const appointment = {
        therapist: therapist.name,
        therapistId: therapist.id,
        date: selectedDate,
        time: selectedTime,
        duration: selectedDuration,
        cost: sessionCost,
        specialty: therapist.specialty,
        bookingConfirmed: true,
        creditsDeducted: sessionCost
      }

      console.log(`✅ Session booked! ${sessionCost} credits deducted.`)

      // Pass the appointment data to parent with success flag
      onScheduleComplete(appointment)
    } catch (error) {
      console.error('Error booking session:', error)
      setBookingError('Erro ao agendar sessão. Tente novamente.')
    } finally {
      setBooking(false)
    }
  }

  if (step === 'duration') {
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
            <div className="text-4xl">{therapist.profile_image_url || '👩‍⚕️'}</div>
            <div>
              <CardTitle className="text-2xl">{therapist.name}</CardTitle>
              <CardDescription className="text-lg">{therapist.specialty}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Escolha a duração da sessão:</h3>
            <div className="grid gap-4">
              {sessionDurations.map((duration) => {
                const cost = duration.minutes * (therapist.credits_per_minute || 1.0)
                const affordable = userCredits >= cost
                return (
                  <Card 
                    key={duration.minutes}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      selectedDuration === duration.minutes ? 'ring-2 ring-blue-500' : ''
                    } ${!affordable ? 'opacity-50' : ''}`}
                    onClick={() => affordable && setSelectedDuration(duration.minutes)}
                  >
                    {duration.popular && (
                      <Badge className="absolute -top-2 left-4 bg-blue-600">
                        Mais Popular
                      </Badge>
                    )}
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{duration.label}</h4>
                          <p className="text-sm text-gray-600">{duration.description}</p>
                          <p className="text-sm text-gray-500">{duration.minutes} minutos</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">
                            {cost} créditos
                          </div>
                          <div className="text-sm text-gray-500">
                            R${(cost * 2).toFixed(0)} valor
                          </div>
                          {!affordable && (
                            <div className="text-xs text-red-500 mt-1">
                              Créditos insuficientes
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="font-medium">Seus créditos disponíveis:</span>
              <span className="text-xl font-bold text-blue-600">{userCredits} créditos</span>
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            disabled={!canAfford}
            onClick={() => setStep('datetime')}
          >
            Continuar para Agendamento
          </Button>
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
            <Button variant="ghost" size="sm" onClick={() => setStep('duration')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <CardTitle className="text-2xl">Escolha Data e Horário</CardTitle>
          <CardDescription>
            Sessão de {selectedDuration} minutos • {sessionCost} créditos
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
    const selectedDateObj = new Date(selectedDate)
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
                <div className="text-4xl">{therapist.profile_image_url || '👩‍⚕️'}</div>
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
                    <p className="text-sm text-gray-600">{selectedTime} ({selectedDuration} min)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-3">Resumo do Pagamento</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sessão de {selectedDuration} minutos</span>
                  <span>{sessionCost} créditos</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa da plataforma</span>
                  <span className="text-green-600">Incluída</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-blue-600">{sessionCost} créditos</span>
                </div>
                <div className="text-sm text-gray-600">
                  Créditos restantes após sessão: {userCredits - sessionCost}
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">O que acontece agora:</p>
                  <ul className="mt-2 space-y-1 text-green-700">
                    <li>• Você receberá um email de confirmação</li>
                    <li>• Link da videochamada será enviado 15 min antes</li>
                    <li>• Créditos serão debitados apenas após a sessão</li>
                    <li>• Você pode cancelar até 2h antes sem cobrança</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {bookingError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
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
                  Agendando Sessão...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Confirmar e Agendar Sessão
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}

