import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, Send, Shield, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Label } from '@/components/ui/label.jsx'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.jsx'
import companyService from '@/services/companyService'
import questionnaireService from '@/services/questionnaireService'
import authService from '@/services/authService'
import CompanyHeader from '@/components/CompanyHeader.jsx'

function buildZodSchema(questions) {
  const shape = {}
  for (const q of questions) {
    switch (q.type) {
      case 'single_select':
        shape[q.id] = q.required
          ? z.string().min(1, 'Selecione uma opção')
          : z.string().optional()
        break
      case 'multi_select':
        shape[q.id] = q.required
          ? z.array(z.string()).min(1, 'Selecione pelo menos uma opção')
          : z.array(z.string()).optional()
        break
      case 'text':
        shape[q.id] = q.required
          ? z.string().min(1, 'Este campo é obrigatório')
          : z.string().optional()
        break
      case 'scale': {
        const scaleMin = q.config?.min ?? 1
        shape[q.id] = q.required
          ? z.number({ required_error: 'Selecione um valor' }).min(scaleMin)
          : z.number().optional()
        break
      }
      case 'symptom_matrix':
        // Object mapping symptom name -> frequency string
        if (q.required) {
          const symptoms = q.config?.symptoms || []
          shape[q.id] = z.record(z.string(), z.string()).refine(
            (val) => symptoms.every((s) => val[s] && val[s].length > 0),
            { message: 'Responda todas as opções' }
          )
        } else {
          shape[q.id] = z.record(z.string(), z.string()).optional()
        }
        break
      default:
        shape[q.id] = z.any().optional()
    }
  }
  return z.object(shape)
}

function getDefaultValues(questions) {
  const defaults = {}
  for (const q of questions) {
    switch (q.type) {
      case 'multi_select':
        defaults[q.id] = []
        break
      case 'symptom_matrix':
        defaults[q.id] = {}
        break
      case 'text':
        defaults[q.id] = ''
        break
      case 'single_select':
        defaults[q.id] = ''
        break
      default:
        defaults[q.id] = undefined
    }
  }
  return defaults
}

function ScaleInput({ value, onChange, config }) {
  const min = config?.min ?? 1
  const max = config?.max ?? 5
  const labels = config?.labels || {}
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        {numbers.map((n) => (
          <div key={n} className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => onChange(n)}
              className={`w-12 h-12 rounded-full border-2 font-semibold text-lg transition-all
                ${value === n
                  ? 'border-primary bg-primary text-white shadow-md scale-110'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-primary/50 hover:bg-primary/5'
                }`}
            >
              {n}
            </button>
            {labels[String(n)] && (
              <span className="text-xs text-gray-500 text-center max-w-16">
                {labels[String(n)]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function QuestionRenderer({ question, control }) {
  switch (question.type) {
    case 'single_select':
      return (
        <FormField
          control={control}
          name={question.id}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="mt-3 space-y-2"
                >
                  {question.options.map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                        ${field.value === option
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <RadioGroupItem value={option} />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )

    case 'multi_select':
      return (
        <FormField
          control={control}
          name={question.id}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
              <div className="mt-3 space-y-2">
                {question.options.map((option) => {
                  const checked = (field.value || []).includes(option)
                  return (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                        ${checked
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(isChecked) => {
                          const current = field.value || []
                          field.onChange(
                            isChecked
                              ? [...current, option]
                              : current.filter((v) => v !== option)
                          )
                        }}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )

    case 'text':
      return (
        <FormField
          control={control}
          name={question.id}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={question.config?.placeholder || 'Digite sua resposta...'}
                  className="mt-2 min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )

    case 'scale':
      return (
        <FormField
          control={control}
          name={question.id}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <div className="mt-3">
                  <ScaleInput
                    value={field.value}
                    onChange={field.onChange}
                    config={question.config}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )

    case 'symptom_matrix':
      return (
        <FormField
          control={control}
          name={question.id}
          render={({ field }) => {
            const symptoms = question.config?.symptoms || []
            const frequencies = question.options || []
            const value = field.value || {}

            return (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <div className="mt-3 space-y-1">
                  {/* Header row - only on desktop */}
                  <div className="hidden md:grid md:gap-2 py-2 border-b border-gray-200" style={{ gridTemplateColumns: `1.5fr repeat(${frequencies.length}, 1fr)` }}>
                    <div />
                    {frequencies.map((freq) => (
                      <span key={freq} className="text-xs font-medium text-gray-500 text-center">{freq}</span>
                    ))}
                  </div>
                  {/* Symptom rows */}
                  {symptoms.map((symptom) => (
                    <div key={symptom} className="py-3 border-b border-gray-100 last:border-0">
                      <p className="text-sm font-medium text-gray-700 mb-2 md:hidden">{symptom}</p>
                      <div className="md:grid md:gap-2 md:items-center" style={{ gridTemplateColumns: `1.5fr repeat(${frequencies.length}, 1fr)` }}>
                        <span className="text-sm text-gray-700 hidden md:block">{symptom}</span>
                        <RadioGroup
                          value={value[symptom] || ''}
                          onValueChange={(v) => field.onChange({ ...value, [symptom]: v })}
                          className="flex flex-wrap gap-2 md:contents"
                        >
                          {frequencies.map((freq) => (
                            <label
                              key={freq}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-xs md:justify-center
                                ${value[symptom] === freq
                                  ? 'border-primary bg-primary/5 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              <RadioGroupItem value={freq} className="sr-only md:not-sr-only" />
                              <span className="md:hidden">{freq}</span>
                            </label>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )
          }}
        />
      )

    default:
      return null
  }
}

export default function QuestionnaireFormPage() {
  const { slug, questionnaire_slug } = useParams()
  const [company, setCompany] = useState(null)
  const [questionnaire, setQuestionnaire] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const sections = useMemo(() => {
    if (!questionnaire?.questions) return []
    const sectionMap = new Map()
    for (const q of questionnaire.questions) {
      const section = q.section || 'Geral'
      if (!sectionMap.has(section)) {
        sectionMap.set(section, [])
      }
      sectionMap.get(section).push(q)
    }
    return Array.from(sectionMap.entries()).map(([name, questions]) => ({
      name,
      questions,
      description: questions[0]?.config?.section_description || null
    }))
  }, [questionnaire])

  const schema = useMemo(() => {
    if (!questionnaire?.questions) return z.object({})
    return buildZodSchema(questionnaire.questions)
  }, [questionnaire])

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: questionnaire?.questions ? getDefaultValues(questionnaire.questions) : {},
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [companyData, questionnaireData] = await Promise.all([
          companyService.getCompanyBySlug(slug),
          questionnaireService.getQuestionnaire(questionnaire_slug)
        ])
        setCompany(companyData.company)
        setQuestionnaire(questionnaireData.questionnaire)
      } catch (err) {
        setError('Não foi possível carregar o questionário.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug, questionnaire_slug])

  // Reset form when questionnaire loads
  useEffect(() => {
    if (questionnaire?.questions) {
      form.reset(getDefaultValues(questionnaire.questions))
    }
  }, [questionnaire])

  const currentSection = sections[currentSectionIndex]
  const isFirstSection = currentSectionIndex === 0
  const isLastSection = currentSectionIndex === sections.length - 1

  // Check if current section has a consent question and if user declined
  const consentQuestion = currentSection?.questions?.find(q => q.config?.is_consent)
  const consentValue = form.watch(consentQuestion?.id)
  const consentDeclined = consentQuestion && consentValue && consentValue !== consentQuestion.options?.[0]
  const progressPercent = sections.length > 0
    ? Math.round(((currentSectionIndex + 1) / sections.length) * 100)
    : 0

  const handleNext = async () => {
    // Guard against rapid re-triggers: a fast double-click could land on the
    // Enviar button after React swaps the button's type on section change,
    // causing the form to submit before the user sees the final section.
    if (isAdvancing || !currentSection) return
    setIsAdvancing(true)
    try {
      const fieldNames = currentSection.questions.map((q) => q.id)
      const isValid = await form.trigger(fieldNames)
      if (isValid) {
        setCurrentSectionIndex((i) => i + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } finally {
      // Short window absorbs any trailing click from the same gesture.
      setTimeout(() => setIsAdvancing(false), 350)
    }
  }

  const handleBack = () => {
    setCurrentSectionIndex((i) => Math.max(0, i - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (values) => {
    setIsSubmitting(true)
    try {
      await questionnaireService.submitResponse(questionnaire_slug, values)
      setSubmitted(true)
    } catch (err) {
      form.setError('root', { message: 'Erro ao enviar respostas. Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const primaryColor = company?.primary_color || '#4f46e5'
  const secondaryColor = company?.secondary_color || null
  // Use secondary for buttons/text when primary is too light (e.g. yellow)
  const accentColor = secondaryColor || primaryColor
  const highlightColor = primaryColor

  // Anonymous questionnaires reject logged-in submissions — block before the form renders.
  if (questionnaire?.allow_anonymous && authService.isLoggedIn()) {
    const handleLogoutAndStay = () => {
      authService.logout()
      window.location.reload()
    }

    return (
      <div className="min-h-screen bg-gray-50" style={{ '--primary': accentColor, '--primary-foreground': '#ffffff' }}>
        <CompanyHeader company={company} slug={slug} />
        <div className="flex items-center justify-center py-16 px-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: `${highlightColor}20` }}
              >
                <Shield className="h-8 w-8" style={{ color: accentColor }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Questionário anônimo</h2>
              <p className="text-gray-600 mb-6">
                Este questionário é 100% anônimo — respostas não são vinculadas a usuários identificados.
                Para participar, saia da sua conta e acesse novamente.
              </p>
              <Button
                onClick={handleLogoutAndStay}
                className="w-full gap-2 text-white"
                style={{ backgroundColor: accentColor }}
              >
                <LogOut className="h-4 w-4" />
                Sair e responder anonimamente
              </Button>
              <p className="text-xs text-gray-400 mt-4">
                Você pode voltar para a sua conta a qualquer momento.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ '--primary': accentColor, '--primary-foreground': '#ffffff' }}>
        <CompanyHeader company={company} slug={slug} />

        <div className="flex items-center justify-center py-16 px-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: `${highlightColor}20` }}
              >
                <CheckCircle2 className="h-8 w-8" style={{ color: accentColor }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Respostas enviadas!</h2>
              <p className="text-gray-600 mb-6">
                Obrigado por preencher o questionário. Nossa equipe de psicólogos analisará suas respostas
                e entrará em contato em breve.
              </p>
              <p className="text-sm text-gray-500">
                Suas respostas são confidenciais e não serão compartilhadas com a empresa.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ '--primary': accentColor, '--primary-foreground': '#ffffff' }}>
      <CompanyHeader company={company} slug={slug} />

      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Title + Progress */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{questionnaire.title}</h1>
          {questionnaire.description && (
            <p className="text-gray-600 mb-4">{questionnaire.description}</p>
          )}
          <div className="flex items-center gap-3">
            <Progress value={progressPercent} className="flex-1" />
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {currentSectionIndex + 1} de {sections.length}
            </span>
          </div>
        </div>

        {/* Section Card */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* key per-section forces a fresh DOM subtree on each transition.
                Prevents React removeChild crashes when extensions (Translate,
                password managers) have mutated the previous section's DOM. */}
            <Card key={`section-${currentSectionIndex}`}>
              <CardHeader>
                <CardTitle className="text-lg">{currentSection?.name}</CardTitle>
                <CardDescription>
                  {currentSection?.description || (
                    currentSection?.questions.length === 1
                      ? '1 pergunta'
                      : `${currentSection?.questions.length} perguntas`
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {currentSection?.questions.map((question) => (
                  <QuestionRenderer
                    key={question.id}
                    question={question}
                    control={form.control}
                  />
                ))}

                {form.formState.errors.root && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {form.formState.errors.root.message}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isFirstSection}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>

              {isLastSection ? (
                <Button
                  key="submit-button"
                  type="submit"
                  disabled={isSubmitting || isAdvancing}
                  className="gap-2 text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  key="next-button"
                  type="button"
                  onClick={handleNext}
                  disabled={consentDeclined || isAdvancing}
                  className="gap-2 text-white"
                  style={{ backgroundColor: consentDeclined ? undefined : accentColor }}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            {consentDeclined && (
              <p className="text-sm text-gray-500 text-center mt-3">
                Sua participação é voluntária. Você pode fechar esta página a qualquer momento.
              </p>
            )}
          </form>
        </Form>

        <p className="text-center text-xs text-gray-400 mt-8">
          Suas respostas são confidenciais e protegidas.
        </p>
      </div>
    </div>
  )
}
