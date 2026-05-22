import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MessageCircle } from 'lucide-react'
import leadService from '../services/leadService'
import { openWhatsApp } from '../utils/whatsapp'
import { track } from '../services/analytics'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Brazil-only phone format: (XX) XXXXX-XXXX (mobile, 11 digits) or
// (XX) XXXX-XXXX (landline, 10 digits). Mask progressively as the user types.
function formatBrPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 11)
  const len = digits.length
  if (len === 0) return ''
  if (len <= 2) return `(${digits}`
  if (len <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (len === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
}

function isValidBrPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits.length === 10 || digits.length === 11
}

function buildWhatsAppMessage(therapist) {
  if (!therapist?.name) return 'Olá, gostaria de saber mais sobre o Terapia Conecta.'
  return therapist.acolhimentoPrice
    ? `Olá, gostaria de agendar uma sessão de acolhimento com ${therapist.name}.`
    : `Olá, gostaria de saber mais sobre como agendar uma sessão com ${therapist.name}.`
}

function buildLeadNotes(therapist) {
  const parts = []
  if (therapist?.name) {
    parts.push(`Terapeuta: ${therapist.name}${therapist.id ? ` (id: ${therapist.id})` : ''}`)
  }
  parts.push(`Origem: ${window.location.pathname}`)
  return parts.join(' · ')
}

export default function WhatsAppLeadModal({ open, onOpenChange, therapist, source = 'whatsapp_modal', whatsappMessage }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validateField = (field, value) => {
    const v = (value ?? '').trim()
    if (field === 'name') return v ? null : 'Informe seu nome'
    if (field === 'email') {
      if (!v) return 'Informe seu email'
      if (!EMAIL_RE.test(v)) return 'Email inválido'
      return null
    }
    if (field === 'phone') {
      if (!v) return 'Informe seu telefone'
      if (!isValidBrPhone(v)) return 'Informe DDD + número (ex: (11) 91234-5678)'
      return null
    }
    return null
  }

  const validateAll = () => {
    const next = {}
    for (const f of ['name', 'email', 'phone']) {
      const err = validateField(f, form[f])
      if (err) next[f] = err
    }
    return next
  }

  const handleChange = (field) => (e) => {
    const raw = e.target.value
    const value = field === 'phone' ? formatBrPhone(raw) : raw
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBlur = (field) => () => {
    const err = validateField(field, form[field])
    setErrors((prev) => ({ ...prev, [field]: err || undefined }))
  }

  const resetAndClose = () => {
    setForm({ name: '', email: '', phone: '' })
    setErrors({})
    setSubmitting(false)
    onOpenChange(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    const eMap = validateAll()
    if (Object.keys(eMap).length > 0) {
      setErrors(eMap)
      return
    }

    setSubmitting(true)
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      source,
      notes: buildLeadNotes(therapist),
    }

    try {
      await leadService.createLead(payload)
      track('WhatsApp Lead Submitted', {
        source,
        path: window.location.pathname,
        therapist: therapist?.name,
      })
    } catch (err) {
      console.error('WhatsApp lead capture failed', err)
      track('WhatsApp Lead Failed', {
        source,
        path: window.location.pathname,
        therapist: therapist?.name,
      })
    } finally {
      openWhatsApp({ message: whatsappMessage || buildWhatsAppMessage(therapist) })
      resetAndClose()
    }
  }

  const handleOpenChange = (next) => {
    if (!next && submitting) return
    if (!next) {
      resetAndClose()
      return
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vamos conversar</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para iniciar a conversa no WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="wa-lead-name">Nome *</Label>
            <Input
              id="wa-lead-name"
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              onBlur={handleBlur('name')}
              placeholder="Como podemos te chamar?"
              autoComplete="name"
              disabled={submitting}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wa-lead-email">Email *</Label>
            <Input
              id="wa-lead-email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              placeholder="seu@email.com"
              autoComplete="email"
              disabled={submitting}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wa-lead-phone">Telefone (WhatsApp) *</Label>
            <Input
              id="wa-lead-phone"
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={handleChange('phone')}
              onBlur={handleBlur('phone')}
              placeholder="(11) 91234-5678"
              autoComplete="tel-national"
              maxLength={16}
              disabled={submitting}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Iniciando conversa...
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4 mr-2" />
                Iniciar a conversa
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
