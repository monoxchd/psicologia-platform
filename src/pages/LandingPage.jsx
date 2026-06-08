import { Button } from '@/components/ui/button.jsx'
import { Heart, ShieldCheck, Users, ArrowRight, MessageCircle, User, Menu, LayoutDashboard } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet.jsx'
import TherapistFinder from '../components/therapist-finder/TherapistFinder.jsx'
import ExitIntentModal from '../components/ExitIntentModal.jsx'
import WhatsAppButton from '../components/WhatsAppButton.jsx'
import WhatsAppLeadModal from '../components/WhatsAppLeadModal.jsx'
import SEOHead from '../components/SEOHead.jsx'
import useExitIntent from '../hooks/useExitIntent.js'
import authService from '../services/authService.js'
import { track } from '../services/analytics.js'
import horizontalLogo from '../assets/horizontal-logo.png'
import heroImage from '../assets/hero-image.jpg'

export default function LandingPage() {
  const navigate = useNavigate()
  const [heroWhatsAppOpen, setHeroWhatsAppOpen] = useState(false)

  const isLoggedIn = authService.isLoggedIn()
  const dashboardPath = authService.isTherapist() ? '/therapist/dashboard' : '/dashboard'
  const accountLinkTo = isLoggedIn ? dashboardPath : '/login'
  const accountLinkLabel = isLoggedIn ? 'Meu painel' : 'Login'
  const AccountIcon = isLoggedIn ? LayoutDashboard : User

  const { isOpen: exitIntentOpen, close: closeExitIntent } = useExitIntent({
    storageKey: 'tc_exit_intent_landing',
    enabled: !isLoggedIn,
    scrollThreshold: 0.7,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <SEOHead
        title="O seu hub de atendimento psicológico"
        description="Encontre o psicólogo certo para você em poucos passos. Atendimento online ou presencial, profissionais licenciados (CRP), filtros por abordagem, gênero e modalidade."
      />
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img
                class="h-6" 
                src={horizontalLogo} 
                alt="Terapia Conecta Logo"
              />
            </div>
            <div className="hidden md:flex space-x-6 items-center">
              <a href="#terapeutas" className="text-gray-600 hover:text-blue-600">Terapeutas</a>
              <Link to="/blog" className="text-gray-600 hover:text-blue-600">Blog</Link>
              <Link to={accountLinkTo} className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600">
                <AccountIcon className="h-4 w-4" />
                {accountLinkLabel}
              </Link>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="md:hidden p-2 -mr-2 text-gray-600 hover:text-blue-600"
                  aria-label="Abrir menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader className="text-left">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4 mt-2">
                  <SheetClose asChild>
                    <a
                      href="#terapeutas"
                      className="py-3 px-2 text-gray-700 hover:text-blue-600 border-b border-gray-100"
                    >
                      Terapeutas
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/blog"
                      className="py-3 px-2 text-gray-700 hover:text-blue-600 border-b border-gray-100"
                    >
                      Blog
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to={accountLinkTo}
                      className="py-3 px-2 text-gray-700 hover:text-blue-600 inline-flex items-center gap-2"
                    >
                      <AccountIcon className="h-4 w-4" />
                      {accountLinkLabel}
                    </Link>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Encontre o psicólogo <span className="text-blue-600">certo</span> para você.
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Suas sessões, anotações e registros de humor ficam entre você e seu psicólogo.
                Cuidado profissional, no seu ritmo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                  onClick={() => {
                    document.getElementById('terapeutas')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Encontrar meu psicólogo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg"
                  onClick={() => {
                    track('WhatsApp Click', {
                      source: 'hero',
                      path: window.location.pathname,
                      therapist: null,
                    })
                    setHeroWhatsAppOpen(true)
                  }}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Falar no WhatsApp
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1 text-emerald-600" />
                  Terapia confidencial
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-blue-600" />
                  Psicólogos registrados
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1 text-emerald-600" />
                  Atendimento humano
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Terapia Online"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Cuidado Profissional</p>
                    <p className="text-sm text-gray-500">Onde precisar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Therapists Finder Section */}
      <section id="terapeutas" className="py-16 bg-white">
        <TherapistFinder
          heading="Encontre seu psicólogo"
          subheading="Filtre por demanda. O match perfeito pra você."
          pageSize={3}
        />
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ainda em dúvida?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Fale com a gente. Te ajudamos a entender qual é o próximo passo, sem compromisso.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            onClick={() => navigate('/form')}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Contate-nos
          </Button>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src={horizontalLogo}
                  alt="Terapia Conecta Logo"
                />
              </div>
              <p className="text-gray-400">
                Democratizando o acesso à saúde mental no Brasil através da tecnologia e flexibilidade.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/blog" className="hover:text-gray-300">Blog</Link></li>
                <li><Link to="/form" className="hover:text-gray-300">Contato</Link></li>
                <li><Link to="/acolhimento" className="hover:text-gray-300">Sessão de Acolhimento</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 TerapiaConecta. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      <WhatsAppLeadModal
        open={heroWhatsAppOpen}
        onOpenChange={setHeroWhatsAppOpen}
        source="landing_hero_whatsapp"
        whatsappMessage="Oi, cheguei pelo site e queria conversar antes de marcar uma sessão."
      />

      {/* Exit-intent modal (desktop, non-logged-in users) */}
      <ExitIntentModal
        open={exitIntentOpen}
        onOpenChange={(open) => { if (!open) closeExitIntent() }}
        title="Às vezes o primeiro passo é só conversar."
        subtitle="A Sessão de Acolhimento foi pensada para quem ainda não sabe por onde começar."
        ctaLabel="Conhecer a Sessão de Acolhimento"
        ctaTo="/acolhimento"
        secondary={
          <WhatsAppButton
            source="exit_modal"
            label="Falar no WhatsApp"
            message="Oi, cheguei pelo site e queria saber mais antes de marcar."
            variant="outline"
            className="w-full"
          />
        }
      />
    </div>
  )
}