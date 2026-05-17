const MARKETING_ROUTE_PATTERNS = [
  /^\/$/,
  /^\/blog(\/.*)?$/,
  /^\/acolhimento(\/.*)?$/,
  /^\/form$/,
  /^\/triagem$/,
  /^\/enigma$/,
  /^\/empresa\/[^/]+$/,
]

export function isMarketingRoute(pathname) {
  return MARKETING_ROUTE_PATTERNS.some((p) => p.test(pathname))
}
