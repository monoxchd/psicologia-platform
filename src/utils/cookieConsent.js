const STORAGE_KEY = 'tc_cookie_consent'
const TTL_MS = 365 * 24 * 60 * 60 * 1000

export const CONSENT_ACCEPTED = 'accepted'
export const CONSENT_ESSENTIAL_ONLY = 'essential_only'

export function readConsent() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { choice, timestamp } = JSON.parse(raw)
    if (!choice || !timestamp) return null
    if (Date.now() - timestamp > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return choice
  } catch {
    return null
  }
}

export function writeConsent(choice) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ choice, timestamp: Date.now() })
    )
  } catch {
    // localStorage unavailable (private mode, quota) — silent fail is intentional
  }
}
