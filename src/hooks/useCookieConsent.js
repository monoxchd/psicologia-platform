import { useState, useCallback } from 'react'
import {
  readConsent,
  writeConsent,
  CONSENT_ACCEPTED,
  CONSENT_ESSENTIAL_ONLY,
} from '../utils/cookieConsent.js'

export default function useCookieConsent() {
  const [consent, setConsent] = useState(() => readConsent())

  const accept = useCallback(() => {
    writeConsent(CONSENT_ACCEPTED)
    setConsent(CONSENT_ACCEPTED)
  }, [])

  const rejectNonEssential = useCallback(() => {
    writeConsent(CONSENT_ESSENTIAL_ONLY)
    setConsent(CONSENT_ESSENTIAL_ONLY)
  }, [])

  return {
    consent,
    accept,
    rejectNonEssential,
    isPending: consent === null,
  }
}
