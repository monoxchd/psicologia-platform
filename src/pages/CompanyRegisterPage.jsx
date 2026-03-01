import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, CheckCircle2, Loader2, ClipboardList, Users } from 'lucide-react'

import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import companyService from '@/services/companyService'
import authService from '@/services/authService'
import horizontalLogo from '../assets/horizontal-logo.png'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Digite um email válido'),
  department: z.string().max(100, 'Departamento deve ter no máximo 100 caracteres').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export default function CompanyRegisterPage() {
  const { slug } = useParams()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [registered, setRegistered] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    async function fetchCompany() {
      try {
        const data = await companyService.getCompanyBySlug(slug)
        setCompany(data.company)
      } catch (err) {
        setError('Empresa não encontrada.')
      } finally {
        setLoading(false)
      }
    }
    fetchCompany()
  }, [slug])

  const handleSubmit = async (values) => {
    setIsSubmitting(true)
    setSubmitError('')

    const { firstName, lastName, confirmPassword, ...rest } = values

    const submitData = {
      name: `${firstName} ${lastName}`,
      first_name: firstName,
      last_name: lastName,
      email: rest.email,
      password: rest.password,
      password_confirmation: confirmPassword,
      user_type: 'client',
      company_slug: slug,
      department: rest.department || undefined,
    }

    try {
      const response = await authService.register(submitData)

      if (response.success) {
        setRegistered(true)
      } else {
        setSubmitError(response.error || 'Erro ao criar conta. Tente novamente.')
      }
    } catch (err) {
      setSubmitError('Erro ao criar conta. Tente novamente.')
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Empresa não encontrada</h1>
          <p className="text-gray-600">Verifique o link e tente novamente.</p>
        </div>
      </div>
    )
  }

  const primaryColor = company.primary_color || '#6366f1'

  if (registered) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <img src={company.logo_url || horizontalLogo} alt={company.logo_url ? `${company.name} Logo` : 'Terapia Conecta Logo'} className="h-8 object-contain" />
              <span
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {company.name}
              </span>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center py-16 px-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <CheckCircle2 className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro realizado!</h2>
              <p className="text-gray-600 mb-6">
                Bem-vindo ao programa de saúde mental da <strong>{company.name}</strong>.
                Nossa equipe de psicólogos entrará em contato em breve.
              </p>
              <div className="space-y-3">
                <Link to={`/empresa/${slug}/questionario/questionario-de-acolhimento`}>
                  <Button
                    className="w-full text-white gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <ClipboardList className="h-4 w-4" />
                    Preencher Questionário de Acolhimento
                  </Button>
                </Link>
                <Link to={`/empresa/${slug}/psicologos`}>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Conhecer Nossos Psicólogos
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Acessar minha conta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img src={company.logo_url || horizontalLogo} alt={company.logo_url ? `${company.name} Logo` : 'Terapia Conecta Logo'} className="h-8 object-contain" />
            <span
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              {company.name}
            </span>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-6">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {submitError}
            </div>
          )}

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
              <CardDescription className="text-center">
                Cadastre-se no programa de saúde mental da {company.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="João" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="seu.email@empresa.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Department */}
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Operações, RH, TI" {...field} />
                        </FormControl>
                        <FormDescription>Opcional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Crie uma senha forte"
                              type={showPassword ? 'text' : 'password'}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Mínimo 8 caracteres, com letra maiúscula, minúscula e número
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Confirme sua senha"
                              type={showConfirmPassword ? 'text' : 'password'}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full text-white"
                    style={{ backgroundColor: primaryColor }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
