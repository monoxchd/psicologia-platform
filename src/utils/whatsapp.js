export const WHATSAPP_NUMBER = '5511914214449'

export function buildWhatsAppUrl({ message } = {}) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  if (!message) return base
  const encoded = typeof message === 'string' ? encodeURIComponent(message) : message
  return `${base}?text=${encoded}`
}

export function openWhatsApp({ message } = {}) {
  window.open(buildWhatsAppUrl({ message }), '_blank')
}
