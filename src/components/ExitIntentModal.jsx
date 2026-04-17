import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import horizontalLogo from '../assets/horizontal-logo.png'
import { track } from '../services/analytics'

/**
 * ExitIntentModal
 *
 * Gentle "before you leave" modal. Designed to pair with useExitIntent.
 * Renders a badge, headline, short body, primary CTA, optional secondary CTA,
 * and a soft dismiss link.
 *
 * @param {Object} props
 * @param {Boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {String} [props.badge='Antes de ir']
 * @param {String} props.title
 * @param {String} props.subtitle
 * @param {String} props.ctaLabel
 * @param {String} props.ctaTo - react-router `to` for the primary CTA
 * @param {Object} [props.ctaState] - optional `state` passed to the Link
 * @param {React.ReactNode} [props.secondary] - optional secondary CTA slot (e.g., WhatsAppButton)
 * @param {String} [props.dismissLabel='Não, obrigado']
 */
export default function ExitIntentModal({
  open,
  onOpenChange,
  badge = 'Antes de ir',
  title,
  subtitle,
  ctaLabel,
  ctaTo,
  ctaState,
  secondary,
  dismissLabel = 'Não, obrigado',
}) {
  // Track whether the close was triggered by a CTA click vs a dismissal
  // (ESC, backdrop, X button, "Não, obrigado" link). Ref, not state — we
  // don't want to re-render on this flip.
  const ctaClickedRef = useRef(false)

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && !ctaClickedRef.current) {
      track('Exit Modal Dismissed', { path: window.location.pathname })
    }
    onOpenChange(nextOpen)
  }

  const handleCtaClick = () => {
    ctaClickedRef.current = true
    track('Exit Modal CTA Click', {
      path: window.location.pathname,
      has_priority_therapist: !!ctaState?.priorityTherapistId,
    })
    onOpenChange(false)
  }

  const handleDismiss = (e) => {
    e.preventDefault()
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md text-center p-8">
        <img
          src={horizontalLogo}
          alt="Terapia Conecta"
          className="mx-auto h-10 w-auto mb-5"
        />
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
          {badge}
        </div>
        <DialogHeader className="mt-4 sm:text-center">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            {subtitle}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            to={ctaTo}
            state={ctaState}
            onClick={handleCtaClick}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {secondary && (
            <div className="w-full">{secondary}</div>
          )}
          <a
            href="#"
            onClick={handleDismiss}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {dismissLabel}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
