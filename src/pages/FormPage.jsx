import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import leadService from '../services/leadService'
import horizontalLogo from '../assets/horizontal-logo.png'

function FieldError({ message }) {
  if (!message) return null
  return <p className="text-red-500 text-xs mt-1.5">{message}</p>
}

export default function FormPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    concerns: '',
    preferredTime: '',
    hasTherapyExperience: '',
    urgency: ''
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (touched[field]) {
      validateField(field, value)
    }
  }

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length === 0) return ''
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value)
    handleInputChange('phone', formatted)
  }

  const validateField = (field, value = formData[field]) => {
    let error = ''
    switch (field) {
      case 'name':
        if (!value.trim()) error = 'Nome é obrigatório'
        else if (value.trim().length < 2) error = 'Nome deve ter pelo menos 2 caracteres'
        break
      case 'email':
        if (!value.trim()) error = 'Email é obrigatório'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Digite um email válido'
        break
      case 'phone':
        if (!value.trim()) error = 'Telefone é obrigatório'
        else if (value.replace(/\D/g, '').length < 10) error = 'Digite o telefone completo com DDD'
        break
      case 'concerns':
        if (!value.trim()) error = 'Este campo é obrigatório'
        break
    }
    setErrors(prev => ({ ...prev, [field]: error }))
    return error
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field)
  }

  const isFormValid = () => {
    return (
      formData.name.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.phone.replace(/\D/g, '').length >= 10 &&
      formData.concerns.trim().length > 0
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const fields = ['name', 'email', 'phone', 'concerns']
    const allTouched = {}
    let hasErrors = false
    fields.forEach(f => {
      allTouched[f] = true
      if (validateField(f)) hasErrors = true
    })
    setTouched(prev => ({ ...prev, ...allTouched }))

    if (hasErrors) return

    setLoading(true)

    try {
      await leadService.createLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age_range: formData.age,
        concerns: formData.concerns,
        preferred_time: formData.preferredTime,
        therapy_experience: formData.hasTherapyExperience,
        urgency: formData.urgency
      })

      setSubmitted(true)
    } catch (error) {
      console.error('Failed to save lead:', error)
      toast.error('Erro ao enviar formulário. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Recebemos seus dados!</h2>
                <p className="text-gray-600">
                  Obrigado pelo seu interesse, {formData.name.split(' ')[0]}! Nossa equipe vai entrar em contato
                  com você pelo WhatsApp para agendar sua primeira sessão e tirar todas as suas dúvidas.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800">
                <p className="font-medium mb-1">O que acontece agora?</p>
                <p>Entraremos em contato em até 24 horas pelo número informado para agendar sua sessão.</p>
              </div>
              <div className="space-y-3 pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/')}
                >
                  Voltar para a página inicial
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <img src={horizontalLogo} alt="Terapia Conecta" className="h-7 opacity-80" />
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-6 sm:p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Vamos te Conhecer Melhor
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Preencha o formulário e entraremos em contato para agendar sua primeira sessão
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="name" className="mb-1.5">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="Seu nome completo"
                    aria-invalid={touched.name && !!errors.name}
                  />
                  <FieldError message={touched.name && errors.name} />
                </div>
                <div>
                  <Label htmlFor="age" className="mb-1.5">Faixa Etária</Label>
                  <Select onValueChange={(value) => handleInputChange('age', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18–25 anos</SelectItem>
                      <SelectItem value="26-35">26–35 anos</SelectItem>
                      <SelectItem value="36-45">36–45 anos</SelectItem>
                      <SelectItem value="46-55">46–55 anos</SelectItem>
                      <SelectItem value="56+">56+ anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="email" className="mb-1.5">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="seu@email.com"
                    aria-invalid={touched.email && !!errors.email}
                  />
                  <FieldError message={touched.email && errors.email} />
                </div>
                <div>
                  <Label htmlFor="phone" className="mb-1.5">WhatsApp *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onBlur={() => handleBlur('phone')}
                    placeholder="(11) 99999-9999"
                    aria-invalid={touched.phone && !!errors.phone}
                  />
                  <FieldError message={touched.phone && errors.phone} />
                </div>
              </div>

              {/* Concerns */}
              <div>
                <Label htmlFor="concerns" className="mb-1.5">O que te trouxe aqui hoje? *</Label>
                <Textarea
                  id="concerns"
                  value={formData.concerns}
                  onChange={(e) => handleInputChange('concerns', e.target.value)}
                  onBlur={() => handleBlur('concerns')}
                  placeholder="Conte-nos um pouco sobre o que você gostaria de trabalhar na terapia..."
                  rows={4}
                  className="resize-none"
                  aria-invalid={touched.concerns && !!errors.concerns}
                />
                <FieldError message={touched.concerns && errors.concerns} />
              </div>

              {/* Therapy experience — full width */}
              <div>
                <Label htmlFor="therapy-experience" className="mb-1.5">Já fez terapia antes?</Label>
                <Select onValueChange={(value) => handleInputChange('hasTherapyExperience', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Nunca fiz terapia</SelectItem>
                    <SelectItem value="past">Já fiz no passado</SelectItem>
                    <SelectItem value="current">Faço atualmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Urgency + Preferred time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="urgency" className="mb-1.5">Quando gostaria de começar?</Label>
                  <Select onValueChange={(value) => handleInputChange('urgency', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hoje mesmo</SelectItem>
                      <SelectItem value="week">Esta semana</SelectItem>
                      <SelectItem value="month">Este mês</SelectItem>
                      <SelectItem value="flexible">Sou flexível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preferred-time" className="mb-1.5">Horário preferido</Label>
                  <Select onValueChange={(value) => handleInputChange('preferredTime', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Manhã (8h–12h)</SelectItem>
                      <SelectItem value="afternoon">Tarde (12h–18h)</SelectItem>
                      <SelectItem value="evening">Noite (18h–22h)</SelectItem>
                      <SelectItem value="any">Qualquer horário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar'
                  )}
                </Button>
              </div>
            </form>

            <div className="text-center pt-5 border-t mt-6">
              <p className="text-sm text-gray-500">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                  Entrar
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
