export function formatCep(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function stripCep(value) {
  return String(value || '').replace(/\D/g, '')
}

export function isValidCep(value) {
  return /^\d{8}$/.test(stripCep(value))
}
