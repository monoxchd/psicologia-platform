// Detects the meeting platform from a URL. Used to show the right
// provider chip (icon + label) next to the meeting URL field on the
// profile form and next to "Entrar na sala" buttons in dashboards.

const PROVIDERS = [
  {
    id: 'google_meet',
    name: 'Google Meet',
    match: (host) => host === 'meet.google.com' || host.endsWith('.meet.google.com'),
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    match: (host) =>
      host === 'teams.microsoft.com' ||
      host === 'teams.live.com' ||
      host.endsWith('.teams.microsoft.com'),
  },
  {
    id: 'zoom',
    name: 'Zoom',
    match: (host) => host === 'zoom.us' || host.endsWith('.zoom.us'),
  },
  {
    id: 'whereby',
    name: 'Whereby',
    match: (host) => host === 'whereby.com' || host.endsWith('.whereby.com'),
  },
]

const GENERIC = { id: 'generic', name: 'Sala de reunião' }

export function getMeetingProvider(url) {
  if (!url || typeof url !== 'string') return null
  try {
    const host = new URL(url).host.toLowerCase()
    const provider = PROVIDERS.find((p) => p.match(host))
    return provider ? { id: provider.id, name: provider.name } : GENERIC
  } catch {
    return null
  }
}
