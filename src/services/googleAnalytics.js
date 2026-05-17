const MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID
let loaded = false

function ensureGtag() {
  if (typeof window === 'undefined') return null
  if (!window.dataLayer) window.dataLayer = []
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }
  }
  return window.gtag
}

export function loadGA4() {
  if (loaded) return
  if (typeof window === 'undefined') return
  if (!import.meta.env.PROD) return
  if (!MEASUREMENT_ID) return

  const gtag = ensureGtag()
  if (!gtag) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)

  gtag('js', new Date())
  // send_page_view:false because RouteTracker fires pageviews manually so SPA route changes are captured.
  gtag('config', MEASUREMENT_ID, { send_page_view: false })

  loaded = true
}

function normalizeEventName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
}

export function ga4Track(name, params) {
  if (!loaded) return
  const gtag = ensureGtag()
  if (!gtag) return
  gtag('event', normalizeEventName(name), params || {})
}

export function ga4Pageview(path) {
  if (!loaded) return
  const gtag = ensureGtag()
  if (!gtag) return
  gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

export function isGA4Loaded() {
  return loaded
}
