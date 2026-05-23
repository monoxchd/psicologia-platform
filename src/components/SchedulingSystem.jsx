import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Calendar, Clock, CheckCircle, ArrowLeft, Loader2, Brain } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/api.js'
import authService from '../services/authService.js'
import therapistService from '../services/therapistService.js'
import appointmentService from '../services/appointmentService.js'
import paymentService from '../services/paymentService.js'

const formatPrice = (price) => {
  return parseFloat(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function SchedulingSystem({
  selectedTherapistId,
  onBack,
  onScheduleComplete
}) {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn())

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
  const [cpfInput, setCpfInput] = useState('')
  // Guest checkout fields — only used when the user reaches the confirm step
  // without an account. On submit we create the Client via
  // /auth/guest_checkout, then continue with the existing booking flow.
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestPassword, setGuestPassword] = useState('')
  // Inline login modal — opens from the "Já tenho conta" link in the guest
  // block. Logging in here preserves the user's service/date/time selections
  // (which would be lost by navigating away to /login).
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [loginError, setLoginError] = useState(null)
  // Holds the appointment id between the first (create-appointment) and second
  // (create-payment) backend calls so we can retry payment without
  // double-booking the slot.
  const [pendingAppointmentId, setPendingAppointmentId] = useState(null)

  const currentUser = isLoggedIn ? authService.getUser() : null
  const needsCpf = !currentUser?.cpf

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

  const isPaidBooking = parseFloat(selectedService?.price) > 0
  // Logged-in clients with a CPF on file skip the CPF input; guests fill it
  // in the guest block below.
  const showCpfInput = isPaidBooking && isLoggedIn && needsCpf
  const showGuestFields = !isLoggedIn

  const validateCpf = (raw) => {
    const digits = (raw || '').replace(/\D/g, '')
    return digits.length === 11 ? digits : null
  }

  const validateEmail = (raw) => /\S+@\S+\.\S+/.test((raw || '').trim())

  const handleLoginSubmit = async (e) => {
    e?.preventDefault?.()
    setLoginError(null)
    if (!validateEmail(loginEmail) || !loginPassword) {
      setLoginError('Informe email e senha.')
      return
    }
    setLoginSubmitting(true)
    const result = await authService.login(loginEmail.trim().toLowerCase(), loginPassword)
    setLoginSubmitting(false)
    if (result.success) {
      setLoginModalOpen(false)
      setLoginPassword('')
      setIsLoggedIn(true)
    } else {
      setLoginError(result.error || 'Falha no login.')
    }
  }

  const handleSchedule = async () => {
    setBooking(true)
    setBookingError(null)

    try {
      // Retry-only branch: appointment already created on a previous attempt,
      // just re-request payment to get a fresh invoiceUrl.
      if (pendingAppointmentId) {
        const payment = await paymentService.createPayment(pendingAppointmentId)
        window.location.href = payment.invoice_url
        return
      }

      let normalizedCpf = null

      // Guest checkout: create the Client first, then continue with the same
      // booking flow as a logged-in user. The token is stored by guestCheckout
      // so subsequent requests carry the Authorization header.
      if (showGuestFields) {
        if (!guestName.trim()) {
          setBookingError('Informe seu nome completo.')
          setBooking(false)
          return
        }
        if (!validateEmail(guestEmail)) {
          setBookingError('Informe um email válido.')
          setBooking(false)
          return
        }
        if (!guestPhone.trim() || guestPhone.replace(/\D/g, '').length < 10) {
          setBookingError('Informe um telefone com DDD.')
          setBooking(false)
          return
        }
        if (guestPassword.length < 6) {
          setBookingError('A senha deve ter pelo menos 6 caracteres.')
          setBooking(false)
          return
        }
        if (isPaidBooking) {
          normalizedCpf = validateCpf(cpfInput)
          if (!normalizedCpf) {
            setBookingError('Informe um CPF válido (11 dígitos).')
            setBooking(false)
            return
          }
        }

        const result = await authService.guestCheckout({
          name: guestName.trim(),
          email: guestEmail.trim().toLowerCase(),
          phone: guestPhone.trim(),
          cpf: normalizedCpf,
          password: guestPassword,
        })

        if (!result.success) {
          if (result.status === 409) {
            setBookingError(`${result.error} Acesse /login para continuar.`)
          } else {
            setBookingError(result.error)
          }
          setBooking(false)
          return
        }

        setIsLoggedIn(true)
        // Logged-in clients with no CPF yet still need to fill it inline. We
        // already collected it above for paid bookings, so feed it in.
      } else if (showCpfInput) {
        normalizedCpf = validateCpf(cpfInput)
        if (!normalizedCpf) {
          setBookingError('Informe um CPF válido (11 dígitos).')
          setBooking(false)
          return
        }
      }

      const appointmentResp = await appointmentService.createAppointment(
        {
          therapist_id: therapist.id,
          scheduled_at: `${selectedDate} ${selectedTime}`,
          duration: selectedService.duration,
          mode: 'online',
          service_id: selectedService.id,
        },
        normalizedCpf ? { cpf: normalizedCpf } : {}
      )

      const appt = appointmentResp.appointment
      setPendingAppointmentId(appt.id)
      if (normalizedCpf) authService.updateCachedUser({ cpf: normalizedCpf })

      if (appt.status === 'pending_payment') {
        const payment = await paymentService.createPayment(appt.id)
        window.location.href = payment.invoice_url
        return
      }

      // Free booking (B2B / zero-cost): hand back to the existing
      // ConfirmationPage navigation.
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
      const msg = error.errors?.[0] || error.message || 'Erro ao agendar sessão. Tente novamente.'
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

            {showGuestFields && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-semibold text-amber-900">Seus dados</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Sua conta é criada agora e fica pronta no painel após o pagamento.
                    {' '}
                    <button
                      type="button"
                      className="underline hover:text-amber-900"
                      onClick={() => { setLoginError(null); setLoginModalOpen(true) }}
                    >
                      Já tenho conta
                    </button>
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2 space-y-1">
                    <Label htmlFor="guest-name" className="text-amber-900">Nome completo</Label>
                    <Input
                      id="guest-name"
                      type="text"
                      autoComplete="name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="guest-email" className="text-amber-900">Email</Label>
                    <Input
                      id="guest-email"
                      type="email"
                      autoComplete="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="guest-phone" className="text-amber-900">Telefone (DDD)</Label>
                    <Input
                      id="guest-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="bg-white"
                    />
                  </div>
                  {isPaidBooking && (
                    <div className="space-y-1">
                      <Label htmlFor="guest-cpf" className="text-amber-900">CPF</Label>
                      <Input
                        id="guest-cpf"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={cpfInput}
                        onChange={(e) => setCpfInput(e.target.value)}
                        placeholder="000.000.000-00"
                        className="bg-white"
                      />
                    </div>
                  )}
                  <div className={isPaidBooking ? 'space-y-1' : 'sm:col-span-2 space-y-1'}>
                    <Label htmlFor="guest-password" className="text-amber-900">Crie uma senha</Label>
                    <Input
                      id="guest-password"
                      type="password"
                      autoComplete="new-password"
                      value={guestPassword}
                      onChange={(e) => setGuestPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {showCpfInput && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-2">
                <Label htmlFor="scheduling-cpf" className="text-amber-900">
                  CPF (para emissão do pagamento)
                </Label>
                <Input
                  id="scheduling-cpf"
                  type="text"
                  inputMode="numeric"
                  value={cpfInput}
                  onChange={(e) => setCpfInput(e.target.value)}
                  placeholder="000.000.000-00"
                  className="bg-white"
                />
                <p className="text-xs text-amber-700">
                  Usado apenas para gerar a cobrança no Asaas (Pix, cartão ou boleto). Salvamos para que você não precise digitar de novo.
                </p>
              </div>
            )}

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">O que acontece agora:</p>
                  <ul className="mt-2 space-y-1 text-green-700">
                    {isPaidBooking ? (
                      <>
                        <li>Você será redirecionado para o checkout do Asaas para pagar (Pix, cartão ou boleto)</li>
                        <li>Após o pagamento, a sessão é confirmada automaticamente</li>
                        <li>Você pode cancelar até 24h antes da sessão com reembolso integral</li>
                      </>
                    ) : (
                      <>
                        <li>Você receberá um email de confirmação</li>
                        <li>Link da videochamada será enviado 15 min antes</li>
                        <li>Você pode cancelar até 24h antes sem cobrança</li>
                      </>
                    )}
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
                  {isPaidBooking ? 'Redirecionando...' : 'Agendando...'}
                </>
              ) : (
                pendingAppointmentId
                  ? 'Tentar pagamento novamente'
                  : (isPaidBooking ? 'Confirmar e Pagar' : 'Confirmar e Agendar')
              )}
            </Button>
          </div>
        </CardContent>

        <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Entrar na sua conta</DialogTitle>
              <DialogDescription>
                Você continua de onde parou — seu horário e serviço seguem selecionados.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="login-modal-email">Email</Label>
                <Input
                  id="login-modal-email"
                  type="email"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-modal-password">Senha</Label>
                <Input
                  id="login-modal-password"
                  type="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm">{loginError}</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loginSubmitting}>
                {loginSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : 'Entrar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    )
  }

  return null
}
