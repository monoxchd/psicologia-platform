/**
 * Thin wrapper around Plausible and GTM so pages never reach into
 * `window.plausible` or `window.dataLayer` directly. Plausible fires on all
 * routes (cookieless, no consent needed). GTM pushes only happen when
 * (a) user consented and (b) current route is part of the marketing surface
 * — therapy product pages are intentionally excluded.
 *
 * Plausible loads in `main.jsx` (production). GTM loads lazily on consent.
 * Marketing manages GA4 + other tags inside the GTM container.
 */

import { gtmPush, isGTMLoaded } from './gtm.js'
import { isMarketingRoute } from '../utils/marketingRoutes.js'

/**
 * Track a custom event.
 * @param {string} name - Event name (e.g. "WhatsApp Click")
 * @param {Object} [props] - Custom properties (flat: strings/numbers/bools)
 */
export function track(name, props) {
  if (typeof window === 'undefined') return

  if (typeof window.plausible === 'function') {
    if (props && Object.keys(props).length > 0) {
      window.plausible(name, { props })
    } else {
      window.plausible(name)
    }
  }

  if (isGTMLoaded() && isMarketingRoute(window.location.pathname)) {
    gtmPush(name, props)
  }
}
