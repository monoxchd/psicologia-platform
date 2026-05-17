/**
 * Thin wrapper around Plausible and GA4 so pages never reach into
 * `window.plausible` or `window.gtag` directly. Plausible fires on all routes
 * (cookieless, no consent needed). GA4 only fires when (a) user consented and
 * (b) current route is part of the marketing surface — therapy product pages
 * are intentionally excluded.
 *
 * Plausible loads in `main.jsx` (production). GA4 loads lazily on consent.
 */

import { ga4Track, isGA4Loaded } from './googleAnalytics.js'
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

  if (isGA4Loaded() && isMarketingRoute(window.location.pathname)) {
    ga4Track(name, props)
  }
}
