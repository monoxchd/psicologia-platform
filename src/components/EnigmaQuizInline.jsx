import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { MessageCircle, ArrowRight, Lock, Eye, Heart, Sparkles } from 'lucide-react'
import api from '../services/api'

const CORRECT_ANSWER = '33'
const WHATSAPP_NUMBER = '5511914214449'

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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-5 sm:p-6"
      style={{
        background: colors.white,
        borderLeft: `2px solid ${colors.accent}`,
        border: '1px solid rgba(0,0,0,0.06)',
        borderLeftWidth: '2px',
        borderLeftColor: colors.accent,
      }}
    >
      <p className="text-base sm:text-lg leading-relaxed" style={{ fontFamily: fonts.serif, color: colors.ink }}>
        "...{before}<GlowingMarker>{marker}</GlowingMarker>{after}..."
      </p>
      <p
        className="mt-2 text-xs tracking-[0.14em] uppercase"
        style={{ fontFamily: fonts.sans, color: colors.inkSoft }}
      >
        {fullWord}
      </p>
    </motion.div>
  )
}

export default function EnigmaQuizInline() {
  const [quizAnswer, setQuizAnswer] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)
  const [isWrong, setIsWrong] = useState(false)
  const [loading, setLoading] = useState(false)
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
      await api.post('/leads', {
        lead: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          source: 'enigma_inline',
          notes: `Resposta do enigma: ${quizAnswer.trim()} (correta)`,
        }
      })
    } catch (err) {
      console.error('Failed to save enigma lead:', err)
    }

    setSubmitted(true)
    setLoading(false)
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Oi! Descobri o enigma escondido no artigo sobre luto no trabalho. O texto me tocou e gostaria de conversar com um psicólogo.`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
  }

  // ── Success state ──
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mt-10 pt-10 border-t-2"
        style={{ borderColor: colors.accent }}
      >
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap" rel="stylesheet" />

        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
            style={{ background: colors.accentGlowFaint }}
          >
            <Sparkles className="h-6 w-6" style={{ color: colors.accent }} />
          </div>
          <h3
            className="text-2xl sm:text-3xl font-normal mb-3"
            style={{ fontFamily: fonts.serif, color: colors.ink }}
          >
            Você desvendou o enigm<GlowingMarker>.:&thinsp;</GlowingMarker>
          </h3>
          <p className="text-base leading-relaxed" style={{ fontFamily: fonts.sans, color: colors.inkMid }}>
            A letr<GlowingMarker>.:&thinsp;</GlowingMarker>que desaparece é a letra <strong>"a"</strong>.
          </p>
        </div>

        <div
          className="p-6 sm:p-8 mb-8"
          style={{ background: colors.white, border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <p
            className="text-xs font-medium tracking-[0.18em] uppercase mb-5"
            style={{ fontFamily: fonts.sans, color: colors.accent }}
          >
            O significado
          </p>
          <div className="space-y-4 leading-[1.85]" style={{ fontFamily: fonts.sans, color: colors.inkMid, fontSize: '0.95rem' }}>
            <p>
              São 33 marcas de <GlowingMarker>.:</GlowingMarker> espalhadas pelo texto: 33 ausências.
              Cada uma ocupa o lugar onde a letra <strong style={{ color: colors.ink }}>"a"</strong> deveria estar.
            </p>
            <p>
              No início do artigo, o texto está intacto. Tudo parece normal. Mas aos poucos, uma a uma,
              as letras começam a desaparecer. Devagar no começo, como quem ainda resiste. Nos últimos
              parágrafos, quase todas se foram. O texto em si <em>entra em luto</em>. Ele perde uma parte
              de si mesmo, da mesma forma que perdemos algo quando alguém que fazia parte do nosso dia a dia se vai.
            </p>
            <p>
              E a palavra mais afetada? <strong style={{ color: colors.ink }}>S.:ud.:de</strong>... duplamente quebrada.
              A palavra que nomeia a dor da ausência é, ela mesma, a que mais sofre com essa ausência.
            </p>
            <p
              className="italic pl-5 mt-4"
              style={{ borderLeft: `2px solid ${colors.accent}`, color: colors.inkSoft }}
            >
              O <GlowingMarker>.:</GlowingMarker> não é um erro. É a ausência tornada visível...
              a marca de quem esteve ali e agora só existe na falta que deixou.
            </p>
          </div>
        </div>

        <div
          className="p-6 sm:p-8 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${colors.white}, #f0e6dc)` }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Heart className="h-5 w-5" style={{ color: colors.accent }} />
            <p
              className="text-xs font-medium tracking-[0.18em] uppercase"
              style={{ fontFamily: fonts.sans, color: colors.accent }}
            >
              Um convite
            </p>
          </div>

          <p
            className="text-center mb-6 text-sm leading-relaxed"
            style={{ fontFamily: fonts.sans, color: colors.inkMid }}
          >
            Você olhou com cuidado para algo que a maioria deixa passar.
            Esse mesmo olhar atento é o que a terapia ajuda a cultivar — para dentro.
            Se o texto tocou você de alguma forma, saiba que esse é um bom sinal.
          </p>

          <button
            onClick={handleWhatsAppClick}
            className="w-full text-white py-4 text-sm font-medium tracking-[0.06em] uppercase flex items-center justify-center gap-2"
            style={{ background: colors.accent, fontFamily: fonts.sans }}
          >
            <MessageCircle className="h-5 w-5" />
            Conversar com um psicólogo
          </button>

          <p
            className="text-xs text-center mt-4 flex items-center justify-center gap-1"
            style={{ fontFamily: fonts.sans, color: colors.inkSoft }}
          >
            <Lock className="h-3 w-3" />
            Suas informações são 100% confidenciais.
          </p>
        </div>
      </motion.div>
    )
  }

  // ── Quiz flow ──
  return (
    <div className="mt-10 pt-10 border-t-2" style={{ borderColor: colors.accent }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300;1,9..40,400&display=swap" rel="stylesheet" />

      {/* Hook */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-6"
          style={{ background: colors.accentGlowFaint, border: `1px solid ${colors.accentLight}40` }}
        >
          <Eye className="h-4 w-4" style={{ color: colors.accent }} />
          <span
            className="text-xs font-medium tracking-[0.12em] uppercase"
            style={{ fontFamily: fonts.sans, color: colors.accent }}
          >
            Você reparou?
          </span>
        </div>

        <h3
          className="text-2xl sm:text-3xl font-normal mb-3"
          style={{ fontFamily: fonts.serif, color: colors.ink }}
        >
          Existe um enigm<GlowingMarker>.:&thinsp;</GlowingMarker> escondido neste texto
        </h3>
        <p className="text-sm" style={{ fontFamily: fonts.sans, color: colors.inkSoft }}>
          Algo no artigo que você acabou de ler não está exatamente como deveria.
        </p>
      </motion.div>

      {/* Excerpts */}
      <div className="space-y-4 mb-10">
        <p
          className="text-xs font-medium tracking-[0.18em] uppercase mb-4"
          style={{ fontFamily: fonts.sans, color: colors.accent }}
        >
          Trechos do artigo
        </p>
        <ExcerptCard before="estava mais irrit" marker=".:" after="da, dormindo mal" fullWord="irritada" delay={0} />
        <ExcerptCard before="A s" marker=".:" after={<>ud<GlowingMarker>.:</GlowingMarker>de</>} fullWord="saudade" delay={0.1} />
        <ExcerptCard before="reconhecer que você é hum" marker=".:" after="no" fullWord="humano" delay={0.15} />
        <ExcerptCard before="a potência do " marker=".:" after="colhimento" fullWord="acolhimento" delay={0.2} />
      </div>

      {/* Quiz */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="p-6 sm:p-10 text-center mb-8"
        style={{ background: colors.white, border: '1px solid rgba(0,0,0,0.06)' }}
      >
        <p
          className="text-xs font-medium tracking-[0.18em] uppercase mb-3"
          style={{ fontFamily: fonts.sans, color: colors.accent }}
        >
          O desafio
        </p>
        <p
          className="text-xl sm:text-2xl mb-3"
          style={{ fontFamily: fonts.serif, color: colors.ink }}
        >
          Quantas vezes o símbolo <GlowingMarker>.:</GlowingMarker> aparece no texto?
        </p>
        <p className="text-sm mb-8" style={{ fontFamily: fonts.sans, color: colors.inkSoft }}>
          Volte ao artigo, conte com atenção e descubra.
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
            type="number"
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
              className="mt-5 text-sm italic"
              style={{ fontFamily: fonts.serif, color: colors.accent }}
            >
              Não é esse o número. Volte ao artigo e conte cada <GlowingMarker>.:</GlowingMarker> com calma.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Lead form — after correct answer */}
      <AnimatePresence>
        {isCorrectAnswer && !submitted && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden"
          >
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-4"
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
              <h3
                className="text-2xl font-normal mb-2"
                style={{ fontFamily: fonts.serif, color: colors.ink }}
              >
                Você tem um olhar atento
              </h3>
              <p className="text-sm" style={{ fontFamily: fonts.sans, color: colors.inkMid }}>
                Nos conte quem você é para revelar o significado por trás do enigma.
              </p>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="space-y-5 p-6 sm:p-8"
              style={{ background: colors.white, border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <div>
                <Label
                  htmlFor="enigma-inline-name"
                  className="text-xs font-medium tracking-[0.06em] uppercase"
                  style={{ fontFamily: fonts.sans, color: colors.inkMid }}
                >
                  Nome
                </Label>
                <Input
                  id="enigma-inline-name"
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
                  htmlFor="enigma-inline-email"
                  className="text-xs font-medium tracking-[0.06em] uppercase"
                  style={{ fontFamily: fonts.sans, color: colors.inkMid }}
                >
                  Email
                </Label>
                <Input
                  id="enigma-inline-email"
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
                  htmlFor="enigma-inline-phone"
                  className="text-xs font-medium tracking-[0.06em] uppercase"
                  style={{ fontFamily: fonts.sans, color: colors.inkMid }}
                >
                  WhatsApp
                </Label>
                <Input
                  id="enigma-inline-phone"
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
                className="w-full text-white py-4 text-sm font-medium tracking-[0.06em] uppercase transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ background: colors.accent, fontFamily: fonts.sans }}
              >
                {loading ? 'Revelando...' : 'Revelar o significado do enigma'}
              </button>

              <p
                className="text-xs text-center flex items-center justify-center gap-1 pt-1"
                style={{ fontFamily: fonts.sans, color: colors.inkSoft }}
              >
                <Lock className="h-3 w-3" />
                Suas informações são 100% confidenciais.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
