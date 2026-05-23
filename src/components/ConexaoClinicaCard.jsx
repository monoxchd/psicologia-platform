import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog.jsx'
import { Link2, Copy, RotateCcw, Check, X, ShieldCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import connectionService from '../services/connectionService'

// Patient-side connection card. Shows the user's own code, lets them paste a
// therapist's code, accept/reject pending therapist requests, and revoke
// active connections. Self-contained — loads its own data on mount.
export default function ConexaoClinicaCard() {
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

  useEffect(() => {
    reload()
  }, [])

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
        toast.success(`Conectado com ${res.partner?.name || 'terapeuta'}`)
      } else if (res?.status === 'pending') {
        toast.success('Solicitação enviada. Aguardando confirmação.')
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
      <Card className="border-0 shadow-md">
        <CardContent className="p-5 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando conexões clínicas...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          Conexão Clínica
        </CardTitle>
        <CardDescription>
          Use seu ID para autorizar seu psicólogo a ver atividades que você decidir compartilhar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {pending.length > 0 && (
          <div className="space-y-2">
            {pending.map(req => (
              <div key={req.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-900">
                  <strong>{req.partner?.name}</strong> solicitou conexão clínica.
                </p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleRespond(req.id, true)}>
                    <Check className="h-4 w-4 mr-1" /> Aceitar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRespond(req.id, false)}>
                    <X className="h-4 w-4 mr-1" /> Recusar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <Label className="text-xs text-gray-500">Seu ID de Conexão Clínica</Label>
          <div className="mt-1 flex items-center gap-2">
            <code className="font-mono tracking-widest text-lg bg-gray-50 border border-gray-200 rounded-md px-3 py-2 select-all">
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
                  <AlertDialogTitle>Renovar ID de Conexão?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O ID atual deixará de funcionar e solicitações pendentes serão canceladas.
                    Conexões já ativas continuam.
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

        <form onSubmit={handleConnect} className="space-y-2">
          <Label htmlFor="partner-code" className="text-xs text-gray-500">
            Conectar com terapeuta — cole o ID dele(a)
          </Label>
          <div className="flex gap-2">
            <Input
              id="partner-code"
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

        {active.length > 0 && (
          <div>
            <Label className="text-xs text-gray-500">Conexões ativas</Label>
            <div className="mt-2 space-y-2">
              {active.map(rel => (
                <div key={rel.id} className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50/40 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{rel.partner?.name}</p>
                    {rel.partner?.specialty && (
                      <p className="text-xs text-gray-500">{rel.partner.specialty}</p>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">Encerrar</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Encerrar conexão com {rel.partner?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          O acesso aos seus registros compartilhados será revogado imediatamente.
                          Os registros antigos permanecem com você.
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
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
