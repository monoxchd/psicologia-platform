import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.jsx'
import { Ear, Lightbulb, Signpost, CheckCircle2, XCircle, Lock, MessageCircle, ArrowRight, Loader2, ExternalLink, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import therapistService from '../services/therapistService'
import horizontalLogo from '../assets/horizontal-logo.png'

export default function AcolhimentoLandingPage() {
  const { slug } = useParams()
  const [isScrolled, setIsScrolled] = useState(false)
  const [therapist, setTherapist] = useState(null)
  const [loading, setLoading] = useState(!!slug)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!slug) return

    const loadTherapist = async () => {
      try {
        setLoading(true)
        const data = await therapistService.getTherapistBySlug(slug)
        setTherapist(data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    loadTherapist()
  }, [slug])

  const handleWhatsAppClick = () => {
    const phoneNumber = '5511914214449'
    let message
    if (therapist) {
      const priceRef = therapist.acolhimento_price ? `R$${therapist.acolhimento_price}` : ''
      message = encodeURIComponent(
        `Olá, vi a página da ${therapist.name} e gostaria de saber mais sobre a Sessão de Acolhimento. [ref: ${slug}/${priceRef}]`
      )
    } else {
      message = encodeURIComponent('Olá, gostaria de saber mais sobre a Sessão de Acolhimento.')
    }
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profissional não encontrado</h1>
        <p className="text-gray-600 mb-8 text-center">
          Não encontramos o profissional que você está buscando. Ele pode ter sido desativado ou o link está incorreto.
        </p>
        <Button
          onClick={() => window.location.href = '/acolhimento'}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Ver página geral de Acolhimento
        </Button>
      </div>
    )
  }

  // Dynamic data when therapist is loaded
  const isDynamic = !!therapist
  const therapistName = therapist?.name || 'Denis Neves'
  const therapistCrp = therapist?.crp_number || '06/XXXXX'
  const therapistPhoto = therapist?.profile_photo_url
  const therapistQuote = therapist?.acolhimento_quote || therapist?.bio
  const therapistPrice = therapist?.acolhimento_price
  const therapistSiteUrl = therapist?.personal_site_url

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Minimalista */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img
              src={horizontalLogo}
              alt="Terapia Conecta Logo"
              className="h-8"
            />
          </div>
        </div>
      </header>

      {/* Bloco 1: Hero — Emotional hook, no price */}
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Não sabe por onde começar? <span className="text-green-600">Comece sendo ouvido.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
            Uma conversa de 30 minutos com um psicólogo para você entender o que está sentindo e descobrir se a terapia faz sentido pra você. Sem compromisso. Sem julgamento.
          </p>
          <Button
            onClick={handleWhatsAppClick}
            className="bg-green-600 hover:bg-green-700 text-white py-6 px-8 text-lg font-semibold rounded-lg inline-flex items-center gap-2"
          >
            Quero saber mais
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Bloco 2: Eu Te Entendo */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Se você se sente assim, saiba que não está sozinho
          </h2>

          <div className="space-y-6 text-center">
            <p className="text-lg text-gray-700 leading-relaxed">
              Talvez você sinta que <strong>algo não está bem</strong>, mas não sabe explicar o quê. Ou talvez a <strong>dificuldade para dormir</strong> e o <strong>cansaço constante</strong> já façam parte da sua rotina.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              Se você se sente <strong>irritado ou desanimado</strong> sem um motivo aparente, vivendo no <strong>"piloto automático"</strong>, saiba que não está sozinho.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              Se você já pensou em fazer terapia, mas a <strong>vergonha</strong> ou a <strong>incerteza de como começar</strong> te impediram, essa conversa é para você. <strong>Não é preciso resolver tudo de uma vez.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Bloco 3: A Oferta */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            O que é a Sessão de Acolhimento?
          </h2>

          {/* Cards de Benefícios */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center border-0 shadow-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Ear className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">30 Minutos de Escuta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Um espaço seguro para você falar e ser ouvido sem julgamentos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">Clareza Sobre Seus Sentimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Vamos juntos entender o que está acontecendo dentro de você.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Signpost className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Direcionamento Profissional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Descubra se a terapia é o caminho certo para você neste momento.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* É vs Não É */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg border border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 mr-2" />
                O que é:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Um primeiro passo, leve e sem compromisso.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Uma conversa para te dar clareza.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Uma oportunidade de conhecer o processo terapêutico.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg border border-red-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <XCircle className="h-6 w-6 text-red-600 mr-2" />
                O que NÃO é:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Uma sessão de terapia completa.</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Um compromisso de continuidade.</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Uma consulta para te vender algo.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bloco 4: Por Que Assim? */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Por que criamos a Sessão de Acolhimento?
          </h2>

          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Sabemos que dar o primeiro passo pode ser difícil. Começar um processo terapêutico sem saber como funciona, sem conhecer o profissional e sem entender se é o momento certo é um <strong>salto de confiança muito grande</strong>. Muita gente desiste antes mesmo de tentar.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            Por isso, criamos a Sessão de Acolhimento. É a sua chance de <strong>dar o primeiro passo com leveza</strong>, entender como a terapia funciona e tomar uma decisão informada, <strong>sem pressão</strong>.
          </p>
        </div>
      </section>

      {/* Bloco 5: Como Funciona */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Como funciona?
          </h2>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Fale conosco pelo WhatsApp</h3>
                <p className="text-gray-600">Nos conte um pouco sobre você e o que está buscando. Vamos te explicar como tudo funciona, tirar suas dúvidas e encontrar o melhor horário.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Tenha sua Sessão de Acolhimento</h3>
                <p className="text-gray-600">Em 30 minutos, você será ouvido por um psicólogo da nossa equipe. É um espaço para falar livremente e entender o que está sentindo.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Receba um direcionamento personalizado</h3>
                <p className="text-gray-600">Ao final, o psicólogo vai te orientar sobre os próximos passos — seja iniciar a terapia, explorar outras opções ou simplesmente refletir com mais clareza.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bloco 6: Quem vai te acolher? */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Quem vai te acolher?
          </h2>

          <Card className="border-0 shadow-md">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  {therapistPhoto ? (
                    <img
                      src={therapistPhoto}
                      alt={therapistName}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-green-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{therapistName}</h3>
                  <p className="text-gray-600 mb-4">Psicólogo(a) — CRP {therapistCrp}</p>
                  {therapistQuote && (
                    <p className="text-lg text-gray-700 italic">
                      "{therapistQuote}"
                    </p>
                  )}
                  {isDynamic && therapistSiteUrl && (
                    <a
                      href={therapistSiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm mt-3"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Conheça mais sobre {therapistName.split(' ')[0]}
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bloco 7: FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Dúvidas Frequentes
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-lg font-semibold text-gray-900">
                Preciso ter um problema "grave" para agendar?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Não. A maioria das pessoas que buscam este primeiro contato apenas sentem que poderiam estar mais felizes e querem se entender melhor.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-lg font-semibold text-gray-900">
                E se eu não quiser continuar depois da sessão?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Sem problema algum. A Sessão de Acolhimento é um encontro único e não gera nenhum compromisso de continuidade.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-lg font-semibold text-gray-900">
                Quanto tempo dura a sessão?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                A Sessão de Acolhimento dura 30 minutos. É tempo suficiente para uma conversa significativa, sem pressa.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-lg font-semibold text-gray-900">
                Como funciona o agendamento e o pagamento?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                {isDynamic && therapistPrice ? (
                  <>
                    A Sessão de Acolhimento com {therapistName.split(' ')[0]} tem o valor de <strong>{formatPrice(therapistPrice)}</strong>. Entre em contato pelo WhatsApp, escolha o melhor horário e nós te explicamos todos os detalhes sobre a forma de pagamento.
                  </>
                ) : (
                  <>
                    É simples: entre em contato pelo WhatsApp, escolha o melhor horário e nós te explicamos todos os detalhes, incluindo valores e forma de pagamento.
                  </>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6 bg-white">
              <AccordionTrigger className="text-lg font-semibold text-gray-900">
                A sessão é online ou presencial?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                A Sessão de Acolhimento é realizada de forma online, por videochamada. Assim você pode participar de onde estiver, com total conforto e privacidade.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Espaçador para o CTA fixo */}
      <div className="h-24"></div>

      {/* Bloco 8: CTA Fixo */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="max-w-3xl mx-auto">
          {isDynamic && therapistPrice && (
            <p className="text-center text-sm text-gray-600 mb-2">
              Sessão de Acolhimento com {therapistName.split(' ')[0]} — <strong>{formatPrice(therapistPrice)}</strong>
            </p>
          )}
          <Button
            onClick={handleWhatsAppClick}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm sm:text-lg">Quero agendar minha Sessão de Acolhimento</span>
          </Button>

          <div className="mt-3 text-center space-y-1">
            <p className="text-sm text-gray-600">
              Respondo em até 24h. Você escolhe o melhor horário.
            </p>
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" />
              Suas informações são 100% confidenciais.
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer for dynamic pages */}
      {isDynamic && therapistPrice && (
        <div className="bg-gray-100 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-gray-500 text-center">
              Os valores apresentados são exclusivos da plataforma TerapiaConecta e podem diferir dos valores praticados pelo profissional em atendimento particular.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8 mt-32">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm space-y-2">
          {isDynamic ? (
            <p>TerapiaConecta — {therapistName} — CRP {therapistCrp}</p>
          ) : (
            <p>TerapiaConecta — Psicólogo Responsável Técnico: Denis Neves — CRP 06/XXXXX</p>
          )}
          <p>&copy; 2026 TerapiaConecta. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
