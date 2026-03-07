import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { MessageCircle, ArrowRight, Lock, Eye, Gift, Sparkles } from 'lucide-react'
import api from '../services/api'
import horizontalLogo from '../assets/horizontal-logo.png'

const CORRECT_ANSWER = 'a'
const WHATSAPP_NUMBER = '5511914214449'
const COUPON_CODE = 'ENIGMA30'

const fonts = {
  serif: "'EB Garamond', Georgia, serif",
  sans: "'DM Sans', system-ui, sans-serif",
}

const colors = {
  accent: '#B07855',
  accentLight: '#D4A882',
  accentGlow: 'rgba(176, 120, 85, 0.5)',
  accentGlowFaint: 'rgba(176, 120, 85, 0.15)',
  bg: '#F4F1ED',
  bgWarm: '#EDE9E3',
  ink: '#1E1C1A',
  inkMid: '#5A5450',
  inkSoft: '#9A9390',
  white: '#FDFCFB',
}

function GlowingMarker({ children }) {
  return (
    <span
      className="relative inline-block font-mono font-bold"
      style={{
        color: colors.accent,
        textShadow: `0 0 8px ${colors.accentGlow}, 0 0 24px ${colors.accentGlowFaint}`,
      }}
    >
      {children}
    </span>
  )
}

function ExcerptCard({ before, marker, after, fullWord, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="border rounded-none p-6 sm:p-8"
      style={{
        background: colors.white,
        borderColor: 'rgba(0,0,0,0.06)',
        borderLeft: `2px solid ${colors.accent}`,
      }}
    >
      <p className="text-lg sm:text-xl leading-relaxed" style={{ fontFamily: fonts.serif, color: colors.ink }}>
        "...{before}<GlowingMarker>{marker}</GlowingMarker>{after}..."
      </p>
      <p
        className="mt-3 text-xs tracking-[0.16em] uppercase"
        style={{ fontFamily: fonts.sans, color: colors.inkSoft }}
      >
        {fullWord}
      </p>
    </motion.div>
  )
}

export default function EnigmaQuizPage() {
  const [quizAnswer, setQuizAnswer] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)
  const [isWrong, setIsWrong] = useState(false)
  const [loading, setLoading] = useState(false)
  const quizRef = useRef(null)
  const formRef = useRef(null)

  const isCorrectAnswer = quizAnswer.trim().toLowerCase() === CORRECT_ANSWER

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleQuizSubmit = () => {
    if (!quizAnswer.trim()) return
    if (!isCorrectAnswer) {
      setIsWrong(true)
      return
    }
    setIsWrong(false)
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!isCorrectAnswer) return

    setLoading(true)

    try {
      await api.post('/enigma-leads', {
        enigma_lead: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          quiz_answer: quizAnswer.trim(),
          correct: true,
          coupon_code: COUPON_CODE,
        }
      })
    } catch (err) {
      console.error('Failed to save enigma lead:', err)
    }

    setSubmitted(true)
    setLoading(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Oi! Descobri o enigma do artigo e ganhei o cupom ${COUPON_CODE}. Gostaria de agendar minha sessao!`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
  }

  const scrollToQuiz = () => {
    quizRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // ── Success state ──
  if (submitted) {
    return (
      <div className="min-h-screen" style={{ background: colors.bg }}>
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap" rel="stylesheet" />

        <header
          className="sticky top-0 z-50 backdrop-blur-sm"
          style={{ background: 'rgba(244, 241, 237, 0.88)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-12 py-5">
            <img src={horizontalLogo} alt="Terapia Conecta" className="h-8" />
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-14"
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
              style={{ background: colors.accentGlowFaint }}
            >
              <Sparkles className="h-7 w-7" style={{ color: colors.accent }} />
            </div>
            <h1
              className="text-3xl sm:text-4xl font-normal mb-4"
              style={{ fontFamily: fonts.serif, color: colors.ink }}
            >
              Voce desvendou o enigm<GlowingMarker>.:&thinsp;</GlowingMarker>
            </h1>
            <p className="text-lg leading-relaxed" style={{ fontFamily: fonts.sans, color: colors.inkMid }}>
              A letr<GlowingMarker>.:&thinsp;</GlowingMarker>que desaparece e a letra <strong>"a"</strong>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="rounded-none p-6 sm:p-10 mb-10"
            style={{ background: colors.white, border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <p
              className="text-xs font-medium tracking-[0.18em] uppercase mb-6"
              style={{ fontFamily: fonts.sans, color: colors.accent }}
            >
              O significado
            </p>
            <div className="space-y-5 leading-[1.85]" style={{ fontFamily: fonts.sans, color: colors.inkMid, fontSize: '0.95rem' }}>
              <p>
                O artigo sobre luto no trabalho carrega um segredo: a letra <strong style={{ color: colors.ink }}>"a"</strong> vai
                desaparecendo do texto, substituida pelo simbolo <GlowingMarker>.:</GlowingMarker> — uma marca visual
                da ausencia.
              </p>
              <p>
                No inicio, o texto esta intacto. Mas conforme avanca, mais e mais letras se perdem.
                O texto em si <em>entra em luto</em> — perde uma parte de si mesmo, assim como perdemos algo quando
                alguem que fazia parte do nosso dia a dia se vai.
              </p>
              <p>
                E a palavra mais afetada? <strong style={{ color: colors.ink }}>S.:ud.:de</strong> — duplamente quebrada.
                A palavra que nomeia a dor da ausencia e, ela mesma, a que mais sofre com essa ausencia.
              </p>
              <p
                className="italic mt-6 pl-5"
                style={{ borderLeft: `2px solid ${colors.accent}`, color: colors.inkSoft }}
              >
                O <GlowingMarker>.:</GlowingMarker> nao e um erro. E uma presenca que se foi,
                deixando apenas a marca de onde esteve.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            <Card
              className="border-0 rounded-none overflow-hidden shadow-md"
              style={{ background: `linear-gradient(135deg, ${colors.white}, #f0e6dc)` }}
            >
              <CardContent className="p-6 sm:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <Gift className="h-5 w-5" style={{ color: colors.accent }} />
                  <p
                    className="text-xs font-medium tracking-[0.18em] uppercase"
                    style={{ fontFamily: fonts.sans, color: colors.accent }}
                  >
                    Seu presente
                  </p>
                </div>

                <div
                  className="rounded-none p-8 text-center mb-8"
                  style={{
                    background: colors.white,
                    border: `2px dashed ${colors.accentLight}`,
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-[0.2em] mb-3"
                    style={{ fontFamily: fonts.sans, color: colors.inkSoft }}
                  >
                    Cupom de desconto
                  </p>
                  <p
                    className="text-3xl sm:text-4xl tracking-[0.08em] mb-2"
                    style={{ fontFamily: fonts.serif, color: colors.accent, fontWeight: 500 }}
                  >
                    {COUPON_CODE}
                  </p>
                  <p
                    className="text-base font-medium"
                    style={{ fontFamily: fonts.sans, color: colors.ink }}
                  >
                    R$ 30 de desconto na sua sessao
                  </p>
                </div>

                <p
                  className="text-center mb-8 text-sm leading-relaxed"
                  style={{ fontFamily: fonts.sans, color: colors.inkMid }}
                >
                  Voce olhou com cuidado para algo que a maioria deixa passar.
                  Esse mesmo olhar atento e o que a terapia ajuda a cultivar — para dentro.
                </p>

                <Button
                  onClick={handleWhatsAppClick}
                  className="w-full text-white py-6 text-sm font-medium tracking-wide uppercase rounded-none flex items-center justify-center gap-2"
                  style={{ background: colors.accent, letterSpacing: '0.06em' }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Agendar com desconto pelo WhatsApp
                </Button>

                <p
                  className="text-xs text-center mt-5 flex items-center justify-center gap-1"
                  style={{ fontFamily: fonts.sans, color: colors.inkSoft }}
                >
                  <Lock className="h-3 w-3" />
                  Suas informacoes sao 100% confidenciais.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <footer style={{ background: colors.ink }} className="text-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center text-sm space-y-2" style={{ color: colors.inkSoft }}>
            <p>TerapiaConecta — Psicologo Responsavel Tecnico: Denis Neves — CRP 06/XXXXX</p>
            <p>&copy; 2026 TerapiaConecta. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    )
  }

  // ── Main quiz page ──
  return (
    <div className="min-h-screen" style={{ background: colors.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap" rel="stylesheet" />

      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-sm"
        style={{ background: 'rgba(244, 241, 237, 0.88)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-5">
          <img src={horizontalLogo} alt="Terapia Conecta" className="h-8" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 sm:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 48px,
              ${colors.accent} 48px,
              ${colors.accent} 49px
            )`,
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center relative"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 rounded-none px-4 py-1.5 mb-10"
            style={{ background: colors.accentGlowFaint, border: `1px solid ${colors.accentLight}40` }}
          >
            <Eye className="h-4 w-4" style={{ color: colors.accent }} />
            <span
              className="text-xs font-medium tracking-[0.12em] uppercase"
              style={{ fontFamily: fonts.sans, color: colors.accent }}
            >
              Voce reparou?
            </span>
          </motion.div>

          <h1
            className="text-4xl sm:text-5xl lg:text-[3.5rem] font-normal mb-8 leading-[1.2]"
            style={{ fontFamily: fonts.serif, color: colors.ink }}
          >
            Existe um enigm<GlowingMarker>.:&thinsp;</GlowingMarker>
            <br className="hidden sm:block" />
            escondido n<GlowingMarker>.:&thinsp;</GlowingMarker>s
            {' '}p<GlowingMarker>.:&thinsp;</GlowingMarker>l<GlowingMarker>.:&thinsp;</GlowingMarker>vr<GlowingMarker>.:&thinsp;</GlowingMarker>s
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-base sm:text-lg mb-12 leading-[1.8] max-w-lg mx-auto"
            style={{ fontFamily: fonts.sans, color: colors.inkMid }}
          >
            Se voce leu o artigo sobre luto no trabalho, talvez tenha percebido que algo
            no texto nao esta exatamente como deveria.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <button
              onClick={scrollToQuiz}
              className="inline-flex items-center gap-2 text-sm font-medium tracking-[0.06em] uppercase transition-opacity hover:opacity-70 pb-px"
              style={{
                fontFamily: fonts.sans,
                color: colors.accent,
                borderBottom: `1px solid ${colors.accent}`,
              }}
            >
              Quero descobrir
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Excerpts */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" style={{ background: colors.bgWarm }}>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p
              className="text-xs font-medium tracking-[0.18em] uppercase mb-4"
              style={{ fontFamily: fonts.sans, color: colors.accent }}
            >
              Trechos do artigo
            </p>
            <h2
              className="text-2xl sm:text-3xl font-normal mb-4"
              style={{ fontFamily: fonts.serif, color: colors.ink }}
            >
              Olhe com atencao
            </h2>
            <p className="text-sm" style={{ fontFamily: fonts.sans, color: colors.inkSoft }}>
              O que estes trechos tem em comum?
            </p>
          </motion.div>

          <div className="space-y-5">
            <ExcerptCard
              before="estava mais irrit"
              marker=".:"
              after="da, dormindo mal"
              fullWord="irritada"
              delay={0}
            />
            <ExcerptCard
              before="A s"
              marker=".:"
              after={"ud.:de"}
              fullWord="saudade"
              delay={0.1}
            />
            <ExcerptCard
              before="reconhecer que voce e hum"
              marker=".:"
              after="no"
              fullWord="humano"
              delay={0.2}
            />
            <ExcerptCard
              before="a potencia do "
              marker=".:"
              after="colhimento"
              fullWord="acolhimento"
              delay={0.3}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mt-12 italic text-sm"
            style={{ fontFamily: fonts.serif, color: colors.inkSoft }}
          >
            Percebeu o padrao? Algo esta faltando...
          </motion.p>
        </div>
      </section>

      {/* Quiz */}
      <section ref={quizRef} className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8" style={{ background: colors.bg }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto text-center"
        >
          <p
            className="text-xs font-medium tracking-[0.18em] uppercase mb-4"
            style={{ fontFamily: fonts.sans, color: colors.accent }}
          >
            O desafio
          </p>
          <h2
            className="text-2xl sm:text-3xl font-normal mb-3"
            style={{ fontFamily: fonts.serif, color: colors.ink }}
          >
            O enigma
          </h2>
          <p className="text-sm mb-12" style={{ fontFamily: fonts.sans, color: colors.inkSoft }}>
            O simbolo <GlowingMarker>.:</GlowingMarker> esta substituindo algo ao longo de todo o texto.
          </p>

          <div
            className="rounded-none p-8 sm:p-12"
            style={{ background: colors.white, border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <p
              className="text-xl sm:text-2xl mb-10"
              style={{ fontFamily: fonts.serif, color: colors.ink }}
            >
              Qual letra esta desaparecendo do texto?
            </p>

            <div className="flex gap-3 max-w-xs mx-auto">
              <Input
                value={quizAnswer}
                onChange={(e) => {
                  setQuizAnswer(e.target.value)
                  setIsWrong(false)
                }}
                placeholder="..."
                maxLength={3}
                className="text-center text-2xl font-medium h-14 rounded-none bg-white"
                style={{
                  fontFamily: fonts.serif,
                  borderColor: isWrong ? '#dc2626' : 'rgba(0,0,0,0.12)',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuizSubmit()
                }}
              />
              <button
                onClick={handleQuizSubmit}
                disabled={!quizAnswer.trim()}
                className="h-14 px-6 text-white transition-all disabled:opacity-40 flex items-center justify-center"
                style={{ background: colors.accent }}
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <AnimatePresence>
              {isWrong && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 text-sm italic"
                  style={{ fontFamily: fonts.serif, color: colors.accent }}
                >
                  Olhe com mais atencao para o simbolo <GlowingMarker>.:</GlowingMarker> — o que deveria estar ali?
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* Lead Form — visible after correct answer */}
      <AnimatePresence>
        {isCorrectAnswer && !submitted && (
          <motion.section
            ref={formRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.6 }}
            className="pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
            style={{ background: colors.bg }}
          >
            <div className="max-w-lg mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="text-center mb-10">
                  <div
                    className="inline-flex items-center gap-2 rounded-none px-4 py-1.5 mb-5"
                    style={{ background: '#e8f5e9', border: '1px solid #c8e6c9' }}
                  >
                    <Sparkles className="h-4 w-4 text-green-700" />
                    <span
                      className="text-xs font-medium tracking-[0.12em] uppercase text-green-800"
                      style={{ fontFamily: fonts.sans }}
                    >
                      Resposta correta
                    </span>
                  </div>
                  <h2
                    className="text-2xl sm:text-3xl font-normal mb-3"
                    style={{ fontFamily: fonts.serif, color: colors.ink }}
                  >
                    Voce tem um olhar atento
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: fonts.sans, color: colors.inkMid }}>
                    Nos conte quem voce e para revelar o significado do enigma
                    e receber um presente especial.
                  </p>
                </div>

                <form
                  onSubmit={handleFormSubmit}
                  className="space-y-5 p-8 sm:p-10 rounded-none"
                  style={{ background: colors.white, border: '1px solid rgba(0,0,0,0.06)' }}
                >
                  <div>
                    <Label
                      htmlFor="enigma-name"
                      className="text-xs font-medium tracking-[0.06em] uppercase"
                      style={{ fontFamily: fonts.sans, color: colors.inkMid }}
                    >
                      Nome
                    </Label>
                    <Input
                      id="enigma-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome"
                      required
                      className="mt-1.5 h-11 rounded-none bg-white"
                      style={{ borderColor: 'rgba(0,0,0,0.12)', fontFamily: fonts.sans }}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="enigma-email"
                      className="text-xs font-medium tracking-[0.06em] uppercase"
                      style={{ fontFamily: fonts.sans, color: colors.inkMid }}
                    >
                      Email
                    </Label>
                    <Input
                      id="enigma-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="mt-1.5 h-11 rounded-none bg-white"
                      style={{ borderColor: 'rgba(0,0,0,0.12)', fontFamily: fonts.sans }}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="enigma-phone"
                      className="text-xs font-medium tracking-[0.06em] uppercase"
                      style={{ fontFamily: fonts.sans, color: colors.inkMid }}
                    >
                      WhatsApp
                    </Label>
                    <Input
                      id="enigma-phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                      className="mt-1.5 h-11 rounded-none bg-white"
                      style={{ borderColor: 'rgba(0,0,0,0.12)', fontFamily: fonts.sans }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-white py-4 text-sm font-medium tracking-[0.06em] uppercase transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                    style={{ background: colors.accent, fontFamily: fonts.sans }}
                  >
                    {loading ? 'Revelando...' : 'Revelar o enigma e ganhar meu presente'}
                  </button>

                  <p
                    className="text-xs text-center flex items-center justify-center gap-1 pt-2"
                    style={{ fontFamily: fonts.sans, color: colors.inkSoft }}
                  >
                    <Lock className="h-3 w-3" />
                    Suas informacoes sao 100% confidenciais.
                  </p>
                </form>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer style={{ background: colors.ink }} className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm space-y-2" style={{ color: colors.inkSoft }}>
          <p>TerapiaConecta — Psicologo Responsavel Tecnico: Denis Neves — CRP 06/XXXXX</p>
          <p>&copy; 2026 TerapiaConecta. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
