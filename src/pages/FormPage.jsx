import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function FormPage() {
  const navigate = useNavigate()
  
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
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/credits', { state: { formData } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-gray-900">Vamos te Conhecer Melhor</CardTitle>
            <CardDescription className="text-lg">
              Essas informações nos ajudam a encontrar o psicólogo ideal para você
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Idade</Label>
                  <Select onValueChange={(value) => handleInputChange('age', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18-25 anos</SelectItem>
                      <SelectItem value="26-35">26-35 anos</SelectItem>
                      <SelectItem value="36-45">36-45 anos</SelectItem>
                      <SelectItem value="46-55">46-55 anos</SelectItem>
                      <SelectItem value="56+">56+ anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="concerns">O que te trouxe aqui hoje?</Label>
                <Textarea
                  id="concerns"
                  value={formData.concerns}
                  onChange={(e) => handleInputChange('concerns', e.target.value)}
                  placeholder="Conte-nos um pouco sobre o que você gostaria de trabalhar na terapia..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="therapy-experience">Já fez terapia antes?</Label>
                <Select onValueChange={(value) => handleInputChange('hasTherapyExperience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Nunca fiz terapia</SelectItem>
                    <SelectItem value="past">Já fiz no passado</SelectItem>
                    <SelectItem value="current">Faço atualmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="urgency">Quando gostaria de começar?</Label>
                  <Select onValueChange={(value) => handleInputChange('urgency', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
                  <Label htmlFor="preferred-time">Horário preferido</Label>
                  <Select onValueChange={(value) => handleInputChange('preferredTime', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Manhã (8h-12h)</SelectItem>
                      <SelectItem value="afternoon">Tarde (12h-18h)</SelectItem>
                      <SelectItem value="evening">Noite (18h-22h)</SelectItem>
                      <SelectItem value="any">Qualquer horário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Continuar para Créditos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}