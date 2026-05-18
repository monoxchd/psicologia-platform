/**
 * No-op tracking wrapper. Custom analytics events are no longer pushed from
 * code — marketing's GTM container handles event tracking via its own
 * click/form triggers. Existing `track(...)` call sites remain so they can
 * be cleaned up incrementally when those components are touched for other
 * reasons.
 *
 * Pageview tracking lives separately in `RouteTracker` (scoped to marketing
 * routes, gated on consent).
 */

export function track() {
  // intentional no-op
}
