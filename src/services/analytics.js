/**
 * Thin wrapper around Plausible so pages never reach into `window.plausible`
 * directly. Safe no-op when Plausible isn't loaded (dev, ad-blockers, offline).
 *
 * Plausible is loaded in `main.jsx` in production only — see that file.
 */

/**
 * Track a custom event.
 * @param {string} name - Event name (e.g. "Exit Modal Shown")
 * @param {Object} [props] - Custom properties object (flat: strings/numbers/bools)
 */
export function track(name, props) {
  if (typeof window === 'undefined') return
  if (typeof window.plausible !== 'function') return
  if (props && Object.keys(props).length > 0) {
    window.plausible(name, { props })
  } else {
    window.plausible(name)
  }
}
