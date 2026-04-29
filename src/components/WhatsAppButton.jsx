import { Button } from '@/components/ui/button.jsx'
import { MessageCircle } from 'lucide-react'
import { appendSourceTag, buildWhatsAppUrl } from '../utils/whatsapp'
import { track } from '../services/analytics'

export default function WhatsAppButton({
  message,
  label = 'Falar no WhatsApp',
  source,
  therapist,
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  children,
  onClick,
}) {
  const taggedMessage = appendSourceTag(message, { therapist })

  const handleClick = (event) => {
    // Skip analytics for right-click, middle-click, or modifier clicks —
    // those open in new tab / copy link, not a primary WhatsApp intent.
    const isPrimaryClick =
      event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
    if (isPrimaryClick) {
      track('WhatsApp Click', {
        source: source || 'unknown',
        path: typeof window !== 'undefined' ? window.location.pathname : '',
        therapist: therapist || null,
      })
    }
    if (onClick) onClick(event)
  }

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      <a
        href={buildWhatsAppUrl({ message: taggedMessage })}
        target="_blank"
        rel="noopener noreferrer"
      >
        {showIcon && <MessageCircle className="h-4 w-4" />}
        {children ?? label}
      </a>
    </Button>
  )
}
