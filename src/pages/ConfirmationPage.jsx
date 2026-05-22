import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { CheckCircle, Clock, Calendar, Loader2, AlertCircle, XCircle, Download } from 'lucide-react'
import paymentService from '../services/paymentService'

const POLL_INTERVAL_MS = 3000
const POLL_MAX_ATTEMPTS = 40 // ~2 minutes
const BR_TZ = 'America/Sao_Paulo'

const formatPrice = (price) =>
  parseFloat(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatScheduledAt = (iso) => {
  if (!iso) return { date: '—', time: '—' }
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: BR_TZ }),
    time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: BR_TZ }),
  }
}

export default function ConfirmationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { scheduledAppointment } = location.state || {}

  const appointmentIdFromQuery = searchParams.get('appointment_id')
  const isPaidFlow = !!appointmentIdFromQuery

  // 'processing' | 'confirmed' | 'expired' | 'refunded' | 'failed' | 'timeout'
  const [renderState, setRenderState] = useState(isPaidFlow ? 'processing' : 'confirmed')
  const [statusPayload, setStatusPayload] = useState(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!isPaidFlow) return undefined

    cancelledRef.current = false
    let attempts = 0
    let timeoutId = null

    const stop = (next, payload) => {
      cancelledRef.current = true
      if (timeoutId) clearTimeout(timeoutId)
      setRenderState(next)
      if (payload) setStatusPayload(payload)
    }

    const tick = async () => {
      if (cancelledRef.current) return
      attempts += 1

      try {
        const data = await paymentService.getStatus(appointmentIdFromQuery)
        if (cancelledRef.current) return
        setStatusPayload(data)

        const pStatus = data.payment?.status
        if (pStatus === 'confirmed') return stop('confirmed', data)
        if (pStatus === 'refunded') return stop('refunded', data)
        if (pStatus === 'expired')  return stop('expired', data)
        if (pStatus === 'failed')   return stop('failed', data)
      } catch (err) {
        // Transient network issue — keep trying until the cap.
      }

      if (attempts >= POLL_MAX_ATTEMPTS) return stop('timeout')
      timeoutId = setTimeout(tick, POLL_INTERVAL_MS)
    }

    tick()
    return () => {
      cancelledRef.current = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isPaidFlow, appointmentIdFromQuery])

  // ───── Free / B2B flow — keep existing presentational behavior ─────
  if (!isPaidFlow) {
    return <ConfirmedView appointment={scheduledAppointment} navigate={navigate} variant="free" />
  }

  // ───── Paid flow — render based on poll outcome ─────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderState === 'processing' && <ProcessingCard payload={statusPayload} />}
        {renderState === 'confirmed'  && <ConfirmedFromPayload payload={statusPayload} navigate={navigate} />}
        {renderState === 'expired'    && <ErrorCard
          title="Tempo de pagamento expirado"
          description="O pagamento não foi concluído dentro do tempo limite. O horário foi liberado — você pode tentar agendar novamente."
          navigate={navigate}
        />}
        {renderState === 'refunded'   && <ErrorCard
          title="Pagamento reembolsado"
          description="Detectamos um reembolso para esta sessão. Se isso foi inesperado, entre em contato com a TerapiaConecta."
          navigate={navigate}
        />}
        {renderState === 'failed'     && <ErrorCard
          title="Pagamento não concluído"
          description="Não conseguimos processar o pagamento. O horário será liberado e você pode tentar novamente."
          navigate={navigate}
        />}
        {renderState === 'timeout'    && <TimeoutCard navigate={navigate} />}
      </div>
    </div>
  )
}

function ProcessingCard({ payload }) {
  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center">
        <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-3 animate-spin" />
        <CardTitle className="text-2xl">Processando pagamento...</CardTitle>
        <CardDescription>
          Aguardando confirmação do Asaas. Geralmente leva alguns segundos para Pix e cartão. Não feche esta página.
        </CardDescription>
      </CardHeader>
      {payload?.appointment && (
        <CardContent>
          <ProcessingDetails appointment={payload.appointment} />
        </CardContent>
      )}
    </Card>
  )
}

function ProcessingDetails({ appointment }) {
  const { date, time } = formatScheduledAt(appointment.scheduled_at)
  return (
    <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-1">
      <p><strong>Psicólogo:</strong> {appointment.therapist?.name}</p>
      {appointment.service && <p><strong>Serviço:</strong> {appointment.service.name}</p>}
      <p><strong>Data:</strong> {date}</p>
      <p><strong>Horário:</strong> {time}</p>
      <p><strong>Valor:</strong> {formatPrice(appointment.cost)}</p>
    </div>
  )
}

function ConfirmedFromPayload({ payload, navigate }) {
  const { date, time } = formatScheduledAt(payload?.appointment?.scheduled_at)
  const view = {
    therapist: payload?.appointment?.therapist?.name,
    specialty: payload?.appointment?.therapist?.specialty,
    service: payload?.appointment?.service?.name,
    date,
    time,
    duration: payload?.appointment?.duration,
    cost: payload?.appointment?.cost,
  }
  return (
    <ConfirmedView
      appointment={view}
      navigate={navigate}
      variant="paid"
      appointmentId={payload?.appointment?.id}
    />
  )
}

function ReceiptButton({ appointmentId }) {
  const [downloading, setDownloading] = useState(false)

  const handleClick = async () => {
    setDownloading(true)
    try {
      const blob = await paymentService.downloadReceipt(appointmentId)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (err) {
      // The user already sees the page loaded; surface as console for now.
      console.error('Failed to download receipt:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={downloading}>
      {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
      Baixar comprovante (PDF)
    </Button>
  )
}

function ConfirmedView({ appointment, navigate, variant, appointmentId }) {
  return (
    <div className={variant === 'free' ? 'min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12' : ''}>
      <div className={variant === 'free' ? 'max-w-2xl mx-auto px-4 sm:px-6 lg:px-8' : ''}>
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle className="text-3xl text-green-600">
              {variant === 'paid' ? 'Pagamento confirmado!' : 'Sessão Agendada com Sucesso!'}
            </CardTitle>
            <CardDescription className="text-lg">
              {variant === 'paid'
                ? 'Sua sessão está confirmada. Você receberá os detalhes por email.'
                : 'Sua sessão foi confirmada e você receberá todas as informações por email'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointment && (
              <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-4">Detalhes da Sessão:</h3>
                  <div className="space-y-2 text-green-800">
                    <p><strong>Psicólogo:</strong> {appointment.therapist}</p>
                    {appointment.specialty && <p><strong>Especialidade:</strong> {appointment.specialty}</p>}
                    {appointment.service && <p><strong>Serviço:</strong> {appointment.service}</p>}
                    {variant === 'free' ? (
                      <>
                        <p><strong>Data:</strong> {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: BR_TZ })}</p>
                        <p><strong>Horário:</strong> {appointment.time}</p>
                      </>
                    ) : (
                      <>
                        <p><strong>Data:</strong> {appointment.date}</p>
                        <p><strong>Horário:</strong> {appointment.time}</p>
                      </>
                    )}
                    <p><strong>Duração:</strong> {appointment.duration} minutos</p>
                    <p><strong>Valor:</strong> {formatPrice(appointment.cost)}</p>
                  </div>
                </div>

                {variant === 'paid' && appointmentId && (
                  <div className="flex justify-end">
                    <ReceiptButton appointmentId={appointmentId} />
                  </div>
                )}

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Próximos Passos:</h4>
                  <ul className="text-blue-800 space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                      Email de confirmação enviado
                    </li>
                    <li className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                      Link da videochamada será enviado 15 minutos antes
                    </li>
                    <li className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                      Adicione ao seu calendário para não esquecer
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                    Voltar ao Início
                  </Button>
                  <Button onClick={() => navigate('/dashboard')} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Minha Conta
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ErrorCard({ title, description, navigate }) {
  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <CardTitle className="text-2xl text-red-700">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
            Minha Conta
          </Button>
          <Button onClick={() => navigate('/scheduling')} className="flex-1">
            Tentar novamente
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TimeoutCard({ navigate }) {
  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
        <CardTitle className="text-2xl">Pagamento ainda em processamento</CardTitle>
        <CardDescription className="text-base">
          Estamos aguardando o Asaas confirmar o pagamento. Você pode verificar o status da sessão no seu painel a qualquer momento — assim que confirmarmos, ela aparecerá lá.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => navigate('/dashboard')} className="w-full">
          Ir para Minha Conta
        </Button>
      </CardContent>
    </Card>
  )
}
