import { useEffect, useState } from 'react'
import { track } from '../services/analytics'

/**
 * useExitIntent
 *
 * Fires an "exit intent" signal to open a modal. The trigger differs by device:
 *
 * - **Desktop:** cursor leaves through the top edge of the window (`mouseout` + `clientY <= 10`).
 * - **Mobile:** user scrolls past a content-engagement threshold (default 85%).
 *   This is a proxy for "finished reading / seen the content" — gentler than a
 *   timer, and only fires for readers who actually engaged.
 *
 * Both paths share a single cooldown window so the user sees the modal at most
 * once per `cooldownMs` across visits.
 *
 * @param {Object} options
 * @param {String} options.storageKey - localStorage key for the cooldown timestamp
 * @param {Number} [options.cooldownMs=86400000] - Cooldown in ms (default 24h)
 * @param {Boolean} [options.enabled=true] - Set false to disable (e.g. for logged-in users)
 * @param {Number} [options.scrollThreshold=0.85] - Mobile scroll ratio (0..1) that triggers the modal
 * @returns {{ isOpen: boolean, close: () => void }}
 */
export default function useExitIntent({
  storageKey,
  cooldownMs = 24 * 60 * 60 * 1000,
  enabled = true,
  scrollThreshold = 0.85,
} = {}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return

    // Respect cooldown (shared between desktop + mobile paths)
    try {
      const lastShown = window.localStorage.getItem(storageKey)
      if (lastShown && Date.now() - parseInt(lastShown, 10) < cooldownMs) return
    } catch (e) {
      // localStorage unavailable — fall through and allow trigger
    }

    let fired = false

    const isMobile = window.matchMedia('(max-width: 768px)').matches

    const trigger = () => {
      if (fired) return
      fired = true
      setIsOpen(true)
      try {
        window.localStorage.setItem(storageKey, Date.now().toString())
      } catch (err) {
        // ignore
      }
      track('Exit Modal Shown', {
        path: window.location.pathname,
        device: isMobile ? 'mobile' : 'desktop',
      })
    }

    if (isMobile) {
      // Mobile: scroll past engagement threshold → trigger once.
      const handleScroll = () => {
        if (fired) return
        const doc = document.documentElement
        const scrollable = doc.scrollHeight - window.innerHeight
        if (scrollable <= 0) return
        const ratio = (window.scrollY + window.innerHeight) / doc.scrollHeight
        if (ratio >= scrollThreshold) {
          trigger()
          window.removeEventListener('scroll', handleScroll)
        }
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }

    // Desktop: exit-intent via cursor leaving through the top edge.
    const handleMouseOut = (e) => {
      if (fired) return
      if (e.relatedTarget) return
      if (e.clientY > 10) return
      trigger()
    }

    document.addEventListener('mouseout', handleMouseOut)
    return () => document.removeEventListener('mouseout', handleMouseOut)
  }, [storageKey, cooldownMs, enabled, scrollThreshold])

  const close = () => setIsOpen(false)

  return { isOpen, close }
}
