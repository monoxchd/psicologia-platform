import { ShieldCheck, BarChart3, Handshake } from 'lucide-react'

const PROMISES = [
  {
    icon: ShieldCheck,
    title: 'Sem anúncios no seu sofrimento',
    body: 'Você não vê anúncios de depressão depois de ler sobre depressão. Aqui não tem isso.',
  },
  {
    icon: BarChart3,
    title: 'Sem Google Analytics',
    body: 'Usamos Plausible: métricas anônimas, hospedadas na Europa. Respeitamos o seu anonimato.',
  },
  {
    icon: Handshake,
    title: 'Seus dados não são vendidos',
    body: 'Nunca foram, nunca serão. Sua busca por cuidado não vira produto de ninguém.',
  },
]

export default function PrivacyStrip() {
  return (
    <section
      aria-labelledby="privacy-strip-heading"
      className="bg-white border-y border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">
            Privacidade de verdade
          </p>
          <h2
            id="privacy-strip-heading"
            className="text-2xl sm:text-3xl font-semibold text-gray-900"
          >
            Buscar ajuda é um ato íntimo, e a gente trata assim.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PROMISES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex gap-4 p-5 rounded-xl bg-emerald-50/40 border border-emerald-100"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-white border border-emerald-100 flex items-center justify-center">
                <Icon className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
