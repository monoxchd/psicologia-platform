import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.jsx'
import { Ear, Lightbulb, Signpost, CheckCircle2, XCircle, Lock, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import horizontalLogo from '../assets/horizontal-logo.png'

export default function AcolhimentoLandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWhatsAppClick = () => {
    const phoneNumber = '5511914214449'
    const message = encodeURIComponent('Olá, gostaria de agendar minha Sessão de Acolhimento.')
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
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

      {/* Bloco 1: Hero + Headline */}
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Não sabe por onde começar? Converse com um psicólogo por <span className="text-green-600">R$30</span> e descubra o caminho certo para você.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
            Uma conversa de 30 minutos para você ser ouvido, entender o que está sentindo, e descobrir se a terapia faz sentido pra você. Sem compromisso. Sem julgamento.
          </p>
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
              Se você já pensou em fazer terapia, mas o <strong>preço</strong>, a <strong>vergonha</strong> ou a <strong>incerteza de como começar</strong> te impediram, essa conversa é para você. <strong>Não é preciso resolver tudo de uma vez.</strong>
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
                  <span className="text-gray-700">Um primeiro passo, leve e acessível.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Uma conversa para te dar clareza.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Uma oportunidade de conhecer o processo.</span>
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
            Sabemos que dar o primeiro passo pode ser difícil. Investir R$150 ou R$200 em uma primeira consulta sem saber se vai gostar do terapeuta ou do processo é um <strong>salto de confiança muito grande</strong>. Muita gente desiste antes mesmo de tentar.
          </p>
          
          <p className="text-lg text-gray-700 leading-relaxed">
            Por isso, criamos a Sessão de Acolhimento. É a sua chance de <strong>"testar a água"</strong> por um valor acessível, entender como a terapia funciona e tomar uma decisão informada, <strong>sem pressão</strong>.
          </p>
        </div>
      </section>

      {/* Bloco 5: Quem Sou Eu */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Quem vai te acolher?
          </h2>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <img 
                    src="https://via.placeholder.com/150" 
                    alt="Denis Neves"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Denis Neves</h3>
                  <p className="text-gray-600 mb-4">Psicólogo, CRP 06/123456</p>
                  <p className="text-lg text-gray-700 italic">
                    "Acredito que todo mundo merece ser ouvido, especialmente quando não sabe nem o que dizer."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bloco 7: FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Dúvidas Frequentes
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold text-gray-900">
                Preciso ter um problema "grave" para agendar?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Não. A maioria das pessoas que buscam este primeiro contato apenas sentem que poderiam estar mais felizes e querem se entender melhor.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold text-gray-900">
                E se eu não quiser continuar depois da sessão?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Sem problema algum. A Sessão de Acolhimento é um encontro único e não gera nenhum compromisso de continuidade.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-lg font-semibold text-gray-900">
                Como funciona o pagamento?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                O valor de R$30 é pago via Pix antes do nosso encontro, de forma simples e rápida.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Espaçador para o CTA fixo */}
      <div className="h-24"></div>

      {/* Bloco 6: CTA Fixo */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="max-w-3xl mx-auto">
          <Button
            onClick={handleWhatsAppClick}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            Quero agendar minha Sessão de Acolhimento
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

      {/* Footer Minimalista */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8 mt-32">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>&copy; 2026 TerapiaConecta. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
