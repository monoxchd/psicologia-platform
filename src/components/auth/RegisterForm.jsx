import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// CRP number validation regex: XX/XXXXX
const crpRegex = /^\d{2}\/\d{5}$/

const baseSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Digite um email válido"),
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"),
  confirmPassword: z.string(),
  userType: z.enum(["client", "therapist"], { required_error: "Selecione o tipo de conta" }),
  acceptTerms: z.boolean().refine(val => val === true, "Você deve aceitar os termos e condições"),
})

const therapistSchema = baseSchema.extend({
  crpNumber: z.string()
    .regex(crpRegex, "CRP deve ter o formato XX/XXXXX (ex: 06/12345)")
    .optional()
    .or(z.literal('')),
  specialty: z.string()
    .min(2, "Especialidade deve ter pelo menos 2 caracteres")
    .max(100, "Especialidade deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal('')),
  experienceYears: z.coerce.number()
    .min(1, "Experiência deve ser pelo menos 1 ano")
    .max(50, "Experiência deve ser no máximo 50 anos")
    .optional()
    .or(z.literal('')),
  bio: z.string()
    .max(500, "Bio deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal('')),
}).refine((data) => {
  // If therapist, require therapist fields
  if (data.userType === 'therapist') {
    return data.crpNumber && data.specialty && data.experienceYears
  }
  return true
}, {
  message: "Todos os campos de terapeuta são obrigatórios",
  path: ["userType"]
})

const registerSchema = therapistSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

export default function RegisterForm({ onSubmit, isLoading = false }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "",
      crpNumber: "",
      specialty: "",
      experienceYears: "",
      bio: "",
      acceptTerms: false,
    },
  })

  const userType = form.watch("userType")
  const isTherapist = userType === "therapist"

  const handleSubmit = (values) => {
    const { firstName, lastName, confirmPassword, experienceYears, crpNumber, ...rest } = values

    const submitData = {
      ...rest,
      name: `${firstName} ${lastName}`,
      user_type: values.userType,
      password_confirmation: confirmPassword, // Add password confirmation for has_secure_password
      // Set default values for therapist fields required by backend
      rating: 4.0, // Default rating for new therapists
      credits_per_minute: 1.0, // Default cost for new therapists
    }

    // Add therapist-specific fields
    if (isTherapist) {
      submitData.crp_number = crpNumber
      submitData.experience_years = parseInt(experienceYears, 10)
    }

    delete submitData.userType
    delete submitData.acceptTerms // Remove acceptTerms - not needed by backend
    onSubmit?.(submitData)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
        <CardDescription className="text-center">
          Preencha as informações para criar sua conta
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
                      placeholder="joao.silva@exemplo.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* User Type */}
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Conta *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de conta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="client">Cliente - Buscando terapia</SelectItem>
                      <SelectItem value="therapist">Terapeuta - Oferecendo terapia</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Therapist-specific fields */}
            {isTherapist && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900">Informações Profissionais</h3>

                <FormField
                  control={form.control}
                  name="crpNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do CRP *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="06/12345"
                          {...field}
                          maxLength={8}
                        />
                      </FormControl>
                      <FormDescription>
                        Formato: XX/XXXXX (ex: 06/12345)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidade *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Psicologia Clínica, Terapia Cognitivo-Comportamental"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anos de Experiência *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          min="1"
                          max="50"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Entre 1 e 50 anos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografia (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Conte um pouco sobre sua formação e abordagem terapêutica..."
                          rows={4}
                          maxLength={500}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/500 caracteres
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Password Fields */}
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
                        type={showPassword ? "text" : "password"}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
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
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms and Conditions */}
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Eu aceito os{" "}
                      <a href="#" className="text-primary underline">
                        Termos e Condições
                      </a>{" "}
                      e a{" "}
                      <a href="#" className="text-primary underline">
                        Política de Privacidade
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Criando Conta..." : "Criar Conta"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
