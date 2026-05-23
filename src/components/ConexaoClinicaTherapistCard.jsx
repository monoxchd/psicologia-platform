import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog.jsx'
import { Link2, Copy, RotateCcw, Check, X, ShieldCheck, Loader2, ArrowRight, User } from 'lucide-react'
import { toast } from 'sonner'
import connectionService from '../services/connectionService'

// Therapist-side connection card. Full-width section below Próximo Agendamento.
// Header row: own code (with copy + rotate) + paste-partner-code form +
// pending requests. Below: responsive grid of connected patients.
export default function ConexaoClinicaTherapistCard() {
  const [loading, setLoading] = useState(true)
  const [myCode, setMyCode] = useState(null)
  const [pending, setPending] = useState([])
  const [active, setActive] = useState([])
  const [partnerCode, setPartnerCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [rotating, setRotating] = useState(false)

  const reload = async () => {
    try {
      const [codeRes, requestsRes, statusRes] = await Promise.all([
        connectionService.getMyCode(),
        connectionService.getPendingRequests(),
        connectionService.getStatus(),
      ])
      setMyCode(codeRes?.connection_code || null)
      setPending(requestsRes?.requests || [])
      const all = statusRes?.relationships || []
      setActive(all.filter(r => r.status === 'active'))
    } catch (err) {
      console.error('Connection card load failed', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  const handleCopy = async () => {
    if (!myCode) return
    try {
      await navigator.clipboard.writeText(myCode)
      toast.success('Código copiado')
    } catch {
      toast.error('Não foi possível copiar — selecione manualmente')
    }
  }

  const handleConnect = async (e) => {
    e?.preventDefault?.()
    if (!partnerCode.trim()) return
    setSubmitting(true)
    try {
      const res = await connectionService.connectWithCode(partnerCode.trim())
      setPartnerCode('')
      if (res?.status === 'active') {
        toast.success(`Conectado com ${res.partner?.name || 'paciente'}`)
      } else if (res?.status === 'pending') {
        toast.success('Solicitação enviada. Aguardando confirmação do paciente.')
      }
      reload()
    } catch (err) {
      toast.error(err.errors?.[0] || err.message || 'Não foi possível conectar.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRotate = async () => {
    setRotating(true)
    try {
      const res = await connectionService.rotateCode()
      setMyCode(res?.connection_code || null)
      toast.success('Código renovado')
      reload()
    } catch (err) {
      toast.error(err.errors?.[0] || err.message || 'Não foi possível renovar.')
    } finally {
      setRotating(false)
    }
  }

  const handleRespond = async (relationshipId, accept) => {
    try {
      await connectionService.respondToRequest(relationshipId, accept)
      toast.success(accept ? 'Conexão aceita' : 'Solicitação recusada')
      reload()
    } catch (err) {
      toast.error(err.errors?.[0] || err.message || 'Não foi possível responder.')
    }
  }

  const handleRevoke = async (relationshipId) => {
    try {
      await connectionService.revoke(relationshipId)
      toast.success('Conexão encerrada')
      reload()
    } catch (err) {
      toast.error(err.errors?.[0] || err.message || 'Não foi possível encerrar.')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-5 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando conexões clínicas...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          Conexão Clínica
        </CardTitle>
        <CardDescription>
          Pareie com seus pacientes para acessar atividades que eles decidirem compartilhar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Pending requests — banner */}
        {pending.length > 0 && (
          <div className="space-y-2">
            {pending.map(req => (
              <div key={req.id} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-amber-900">
                  <strong>{req.partner?.name}</strong> solicitou conexão clínica.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleRespond(req.id, true)}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Aceitar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRespond(req.id, false)}>
                    <X className="h-3.5 w-3.5 mr-1" /> Recusar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top row: own code + paste partner code, side by side */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-gray-500">Seu ID de Conexão Clínica</Label>
            <div className="mt-1 flex items-center gap-2">
              <code className="font-mono tracking-widest text-base bg-gray-50 border border-gray-200 rounded-md px-3 py-2 select-all flex-1 text-center">
                {myCode || '——'}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopy} disabled={!myCode}>
                <Copy className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={rotating}>
                    <RotateCcw className={`h-4 w-4 ${rotating ? 'animate-spin' : ''}`} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Renovar ID?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Solicitações pendentes serão canceladas. Conexões ativas continuam.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRotate}>Renovar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <form onSubmit={handleConnect}>
            <Label htmlFor="partner-code-t" className="text-xs text-gray-500">
              Conectar com paciente — cole o ID dele(a)
            </Label>
            <div className="mt-1 flex gap-2">
              <Input
                id="partner-code-t"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                placeholder="ABCD1234"
                className="font-mono tracking-widest"
                maxLength={8}
                autoComplete="off"
              />
              <Button type="submit" disabled={submitting || partnerCode.length !== 8}>
                <Link2 className="h-4 w-4 mr-1" /> Conectar
              </Button>
            </div>
          </form>
        </div>

        {/* Connected patients — responsive grid */}
        {active.length > 0 && (
          <div>
            <Label className="text-xs text-gray-500 mb-2 block">
              Pacientes conectados ({active.length})
            </Label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {active.map(rel => (
                <div key={rel.id} className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 flex flex-col gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-emerald-700" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate flex-1 mt-1">
                      {rel.partner?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link to={`/therapist/pacientes/${rel.partner?.id}/registros`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                        Ver registros <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-400 hover:text-red-600">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Encerrar conexão com {rel.partner?.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Você perderá acesso aos registros compartilhados deste paciente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleRevoke(rel.id)}
                          >
                            Encerrar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
