import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Heart, Clock, Shield, Star, Users, CreditCard, CheckCircle, ArrowRight, Calendar, Settings } from 'lucide-react'
import SchedulingSystem from './components/SchedulingSystem.jsx'
import TherapistAvailability from './components/TherapistAvailability.jsx'
import TherapistsList from './components/TherapistsList.jsx'
import heroImage from './assets/hero-therapy.jpg'
import supportImage from './assets/mental-health-support.jpg'
import consultationImage from './assets/modern-consultation.webp'
import './App.css'
import therapistService from './services/therapistService'

function App() {
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

  const [currentStep, setCurrentStep] = useState('landing') // 'landing', 'form', 'credits', 'matching', 'scheduling', 'confirmation', 'therapist-admin'
  const [selectedCredits, setSelectedCredits] = useState(60)
  const [selectedTherapist, setSelectedTherapist] = useState('')
  const [scheduledAppointment, setScheduledAppointment] = useState(null)
  const [therapists, setTherapists] = useState([])
  const [loadingTherapists, setLoadingTherapists] = useState(false)
  const [therapistError, setTherapistError] = useState(null)

  useEffect(() => {
    if (currentStep === 'matching') {
      fetchTherapists();
    }
  }, [currentStep]);

  const fetchTherapists = async () => {
    setLoadingTherapists(true);
    setTherapistError(null);
    try {
      const data = await therapistService.getAllTherapists();
      const formattedTherapists = therapistService.formatTherapistsForUI(data);
      setTherapists(formattedTherapists);
    } catch (error) {
      console.error('Failed to load therapists:', error);
      setTherapistError('Não foi possível carregar os terapeutas. Por favor, tente novamente.');
      // Fallback to default therapists if API fails
      setTherapists([
        {
          id: "ana-silva",
          name: "Dra. Ana Silva",
          specialty: "Ansiedade e Depressão",
          experience: "8 anos",
          rating: 4.9,
          creditsPerMinute: 2.0,
          available: "Hoje às 14h",
          image: "👩‍⚕️"
        },
        {
          id: "carlos-santos",
          name: "Dr. Carlos Santos",
          specialty: "Terapia Cognitiva",
          experience: "12 anos", 
          rating: 4.8,
          creditsPerMinute: 2.5,
          available: "Amanhã às 10h",
          image: "👨‍⚕️"
        },
        {
          id: "maria-costa",
          name: "Dra. Maria Costa",
          specialty: "Relacionamentos",
          experience: "6 anos",
          rating: 4.9,
          creditsPerMinute: 1.8,
          available: "Hoje às 16h",
          image: "👩‍⚕️"
        }
      ]);
    } finally {
      setLoadingTherapists(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setCurrentStep('credits')
  }

  const handleCreditSelection = (credits) => {
    setSelectedCredits(credits)
    setCurrentStep('matching')
  }

  const handleTherapistSelection = (therapistId) => {
    setSelectedTherapist(therapistId)
    setCurrentStep('scheduling')
  }

  const handleScheduleComplete = (appointment) => {
    setScheduledAppointment(appointment)
    setCurrentStep('confirmation')
  }

  const creditPackages = [
    { credits: 30, price: 60, popular: false, description: "Ideal para experimentar" },
    { credits: 60, price: 100, popular: true, description: "Mais popular - melhor valor" },
    { credits: 120, price: 180, popular: false, description: "Para cuidado contínuo" }
  ]


  if (currentStep === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Trogon</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#como-funciona" className="text-gray-600 hover:text-blue-600">Como Funciona</a>
                <a href="#terapeutas" className="text-gray-600 hover:text-blue-600">Terapeutas</a>
                <a href="#psicologos" className="text-gray-600 hover:text-blue-600">Para Psicólogos</a>
                <a href="#precos" className="text-gray-600 hover:text-blue-600">Preços</a>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentStep('therapist-admin')}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                  Terapia Online <span className="text-blue-600">Flexível</span> com Sistema de Créditos
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Pague apenas pelo tempo que usar. Sessões de 15 minutos ou 2 horas - você decide. 
                  Conecte-se com psicólogos qualificados quando precisar.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                    onClick={() => setCurrentStep('form')}
                  >
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                    Ver Como Funciona
                  </Button>
                </div>
                <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    100% Seguro
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    500+ Psicólogos
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    4.9/5 Avaliação
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
                    <CreditCard className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">A partir de R$2/min</p>
                      <p className="text-sm text-gray-500">Sem mensalidade</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="como-funciona" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
              <p className="text-xl text-gray-600">Simples, flexível e transparente</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-6">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle>1. Compre Créditos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Escolha um pacote de créditos. 1 crédito = 1 minuto de terapia. 
                    Sem mensalidade, sem compromisso.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>2. Escolha seu Psicólogo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Navegue por perfis, especialidades e avaliações. 
                    Favorite seus psicólogos preferidos para facilitar reagendamentos.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle>3. Sessão Flexível</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Agende sessões de 15 minutos para check-ins rápidos ou 
                    2 horas para trabalho profundo. Você controla o tempo.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Credit Packages Preview */}
        <section id="precos" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Pacotes de Créditos</h2>
              <p className="text-xl text-gray-600">Flexibilidade total para suas necessidades</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {creditPackages.map((pkg, index) => (
                <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{pkg.credits} Créditos</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                    <div className="text-4xl font-bold text-blue-600">R${pkg.price}</div>
                    <div className="text-sm text-gray-500">R${(pkg.price/pkg.credits).toFixed(2)} por minuto</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {pkg.credits === 30 ? '1 a 2 sessões' : pkg.credits === 60 ? '2 a 4 sessões' : '4 a 8 sessões'}
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Flexibilidade total de tempo
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Válido por 6 meses
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Acesso a todos psicólogos
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How Credits Work */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">💡 Como funciona na prática:</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-blue-600 font-bold text-lg">Check-in rápido:</div>
                <div className="text-sm text-gray-600">15 minutos = 15 créditos</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-blue-600 font-bold text-lg">Sessão padrão:</div>
                <div className="text-sm text-gray-600">50 minutos = 50 créditos</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-blue-600 font-bold text-lg">Trabalho profundo:</div>
                <div className="text-sm text-gray-600">90 minutos = 90 créditos</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-blue-600 font-bold text-lg">Emergência:</div>
                <div className="text-sm text-gray-600">10 minutos = 10 créditos</div>
              </div>
            </div>
          </div>
        </section>

        {/* Therapists List Section */}
        <section id="terapeutas" className="py-20 bg-white">
          <TherapistsList />
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              Pronto para Começar sua Jornada de Bem-estar?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Junte-se a milhares de pessoas que já transformaram suas vidas com nossa plataforma flexível.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
              onClick={() => setCurrentStep('form')}
            >
              Começar Minha Avaliação Gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Heart className="h-6 w-6 text-blue-400" />
                  <span className="text-xl font-bold">MenteCréditos</span>
                </div>
                <p className="text-gray-400">
                  Democratizando o acesso à saúde mental no Brasil através da tecnologia e flexibilidade.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Plataforma</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Como Funciona</li>
                  <li>Psicólogos</li>
                  <li>Preços</li>
                  <li>Segurança</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Suporte</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Central de Ajuda</li>
                  <li>Contato</li>
                  <li>FAQ</li>
                  <li>Blog</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Privacidade</li>
                  <li>Termos de Uso</li>
                  <li>LGPD</li>
                  <li>Ética</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 MenteCréditos. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  if (currentStep === 'form') {
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
                    onClick={() => setCurrentStep('landing')}
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

  if (currentStep === 'credits') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-gray-900">Escolha seu Pacote de Créditos</CardTitle>
              <CardDescription className="text-lg">
                Comece com o pacote que faz mais sentido para você. Sempre pode comprar mais depois!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {creditPackages.map((pkg, index) => (
                  <Card key={index} className={`relative cursor-pointer transition-all hover:scale-105 ${pkg.popular ? 'ring-2 ring-blue-500' : ''}`}>
                    {pkg.popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                        Recomendado
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">{pkg.credits} Créditos</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                      <div className="text-4xl font-bold text-blue-600">R${pkg.price}</div>
                      <div className="text-sm text-gray-500">R${(pkg.price/pkg.credits).toFixed(2)} por minuto</div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm mb-6">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {pkg.credits === 30 ? '1 a 2 sessões' : pkg.credits === 60 ? '2 a 4 sessões' : '4 a 8 sessões'}
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Flexibilidade total de tempo
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Válido por 6 meses
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Acesso a todos psicólogos
                        </li>
                      </ul>
                      <Button 
                        className="w-full"
                        onClick={() => handleCreditSelection(pkg.credits)}
                        variant={pkg.popular ? "default" : "outline"}
                      >
                        Escolher Este Pacote
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-12 bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Como funciona na prática:</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="text-blue-800">
                    <strong>Check-in rápido:</strong> 15 minutos = 15 créditos
                  </div>
                  <div className="text-blue-800">
                    <strong>Sessão padrão:</strong> 50 minutos = 50 créditos
                  </div>
                  <div className="text-blue-800">
                    <strong>Trabalho profundo:</strong> 90 minutos = 90 créditos
                  </div>
                  <div className="text-blue-800">
                    <strong>Emergência:</strong> 10 minutos = 10 créditos
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === 'matching') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-gray-900">Psicólogos Recomendados para Você</CardTitle>
              <CardDescription className="text-lg">
                Baseado no seu perfil, encontramos estes profissionais ideais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {therapistError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{therapistError}</p>
                </div>
              )}
              
              {loadingTherapists ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Carregando terapeutas disponíveis...</p>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {therapists.map((therapist) => (
                  <Card key={therapist.id} className="relative">
                    <CardHeader className="text-center">
                      <div className="text-6xl mb-4">{therapist.image}</div>
                      <CardTitle className="text-xl">{therapist.name}</CardTitle>
                      <CardDescription>{therapist.specialty}</CardDescription>
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{therapist.rating}</span>
                        <span className="text-gray-500">({therapist.experience})</span>
                      </div>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="space-y-2 mb-6">
                        <div className="text-sm">
                          <span className="font-medium">Custo por minuto:</span>{' '}
                          <span className="text-blue-600 font-bold">{therapist.creditsPerMinute} créditos</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Disponível:</span>{' '}
                          <span className="text-green-600 font-semibold">{therapist.available}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button 
                          className="w-full"
                          onClick={() => handleTherapistSelection(therapist.id)}
                        >
                          Agendar Sessão
                        </Button>
                        <Button variant="outline" className="w-full">
                          ❤️ Favoritar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>
              )}

              <div className="mt-12 bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-4">🎉 Parabéns! Você está quase lá:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Perfil criado e analisado
                  </div>
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Psicólogos compatíveis encontrados
                  </div>
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Sistema de créditos explicado
                  </div>
                  <div className="flex items-center text-green-800">
                    <Calendar className="h-4 w-4 text-green-600 mr-2" />
                    Próximo: Escolher psicólogo e agendar primeira sessão
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === 'scheduling') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SchedulingSystem
            selectedTherapist={selectedTherapist}
            userCredits={selectedCredits}
            onBack={() => setCurrentStep('matching')}
            onScheduleComplete={handleScheduleComplete}
          />
        </div>
      </div>
    )
  }

  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <CardTitle className="text-3xl text-green-600">Sessão Agendada com Sucesso!</CardTitle>
              <CardDescription className="text-lg">
                Sua sessão foi confirmada e você receberá todas as informações por email
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduledAppointment && (
                <div className="space-y-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-4">Detalhes da Sessão:</h3>
                    <div className="space-y-2 text-green-800">
                      <p><strong>Psicólogo:</strong> {scheduledAppointment.therapist}</p>
                      <p><strong>Especialidade:</strong> {scheduledAppointment.specialty}</p>
                      <p><strong>Data:</strong> {new Date(scheduledAppointment.date).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}</p>
                      <p><strong>Horário:</strong> {scheduledAppointment.time}</p>
                      <p><strong>Duração:</strong> {scheduledAppointment.duration} minutos</p>
                      <p><strong>Custo:</strong> {scheduledAppointment.cost} créditos</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3">Próximos Passos:</h4>
                    <ul className="text-blue-800 space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        Email de confirmação enviado para {formData.email}
                      </li>
                      <li className="flex items-center">
                        <Clock className="h-4 w-4 text-blue-600 mr-2" />
                        Link da videochamada será enviado 15 minutos antes
                      </li>
                      <li className="flex items-center">
                        <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                        Adicione ao seu calendário para não esquecer
                      </li>
                      <li className="flex items-center">
                        <CreditCard className="h-4 w-4 text-blue-600 mr-2" />
                        Créditos serão debitados apenas após a sessão
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep('matching')}
                      className="flex-1"
                    >
                      Agendar Outra Sessão
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep('landing')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Voltar ao Início
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (currentStep === 'therapist-admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep('landing')}
              className="mb-4"
            >
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Voltar ao Site
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Painel do Psicólogo</h1>
            <p className="text-gray-600">Gerencie sua disponibilidade e horários</p>
          </div>
          <TherapistAvailability />
        </div>
      </div>
    )
  }

  return null
}

export default App

