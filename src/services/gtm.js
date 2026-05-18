const GTM_CONTAINER_ID = 'GTM-NKG36L55'
let loaded = false

function ensureDataLayer() {
  if (typeof window === 'undefined') return null
  if (!window.dataLayer) window.dataLayer = []
  return window.dataLayer
}

export function loadGTM() {
  if (loaded) return
  if (typeof window === 'undefined') return
  if (!import.meta.env.PROD) return

  const dataLayer = ensureDataLayer()
  if (!dataLayer) return

  dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`
  document.head.appendChild(script)

  loaded = true
}

function normalizeEventName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
}

export function gtmPush(eventName, params) {
  if (!loaded) return
  const dataLayer = ensureDataLayer()
  if (!dataLayer) return
  dataLayer.push({
    event: normalizeEventName(eventName),
    ...(params || {}),
  })
}

export function gtmPageview(path) {
  if (!loaded) return
  const dataLayer = ensureDataLayer()
  if (!dataLayer) return
  dataLayer.push({
    event: 'page_view',
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

export function isGTMLoaded() {
  return loaded
}
