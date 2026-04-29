export const WHATSAPP_NUMBER = '5511914214449'

// Appends a contextual tag to a WhatsApp message so incoming leads are
// attributable to a page/therapist. Ad-source attribution lives in Plausible
// (pageview UTMs), not in the message — keeps the lead-facing text light.
// Format: "Olá... [terapeuta: X • origem: /path]"
export function appendSourceTag(message, extras = {}) {
  if (typeof window === 'undefined') return message
  const parts = []
  if (extras.therapist) parts.push(`terapeuta: ${extras.therapist}`)
  parts.push(`origem: ${window.location.pathname}`)
  const tag = `[${parts.join(' • ')}]`
  return message ? `${message} ${tag}` : tag
}

export function buildWhatsAppUrl({ message } = {}) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  if (!message) return base
  const encoded = typeof message === 'string' ? encodeURIComponent(message) : message
  return `${base}?text=${encoded}`
}

export function openWhatsApp({ message } = {}) {
  window.open(buildWhatsAppUrl({ message }), '_blank')
}
