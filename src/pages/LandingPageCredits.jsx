import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Heart, Clock, Shield, Star, Users, CreditCard, CheckCircle, ArrowRight, Settings, BookOpen } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import TherapistsList from '../components/TherapistsList.jsx'
import { blogService } from '../services/blogService.js'
import horizontalLogo from '../assets/horizontal-logo.png'
import heroImage from '../assets/hero-therapy.jpg'

export default function LandingPageCredits() {
  const navigate = useNavigate()
  const [latestArticles, setLatestArticles] = useState([])

  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        const data = await blogService.getArticles({ page: 1 })
        setLatestArticles(data.articles?.slice(0, 3) || [])
      } catch (error) {
        console.error('Failed to fetch latest articles:', error)
      }
    }
    fetchLatestArticles()
  }, [])

  const creditPackages = [
    { credits: 30, price: 60, popular: false, description: "Ideal para experimentar" },
    { credits: 60, price: 100, popular: true, description: "Mais popular - melhor valor" },
    { credits: 120, price: 180, popular: false, description: "Para cuidado contínuo" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img
                src={horizontalLogo}
                alt="Terapia Conecta Logo"
              />
            </div>
            <div className="hidden md:flex space-x-6 items-center">
              <a href="#como-funciona" className="text-gray-600 hover:text-primary">Como Funciona</a>
              <a href="#precos" className="text-gray-600 hover:text-primary">Preços</a>
              <a href="#terapeutas" className="text-gray-600 hover:text-primary">Terapeutas</a>
              <Link to="/blog" className="text-gray-600 hover:text-primary">Blog</Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="ml-4"
              >
                Entrar
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
                Terapia Online <span className="text-primary">Flexível</span> com Sistema de Créditos
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Pague apenas pelo tempo que usar. Sessões de 15 minutos ou 2 horas - você decide.
                Conecte-se com psicólogos qualificados quando precisar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-indigo-700 text-white px-8 py-4 text-lg"
                  onClick={() => navigate('/login')}
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
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
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
              <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-indigo-500 scale-105' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{pkg.credits} Créditos</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="text-4xl font-bold text-primary">R${pkg.price}</div>
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
      <section className="py-16 bg-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">💡 Como funciona na prática:</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-primary font-bold text-lg">Check-in rápido:</div>
              <div className="text-sm text-gray-600">15 minutos = 15 créditos</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-primary font-bold text-lg">Sessão padrão:</div>
              <div className="text-sm text-gray-600">50 minutos = 50 créditos</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-primary font-bold text-lg">Trabalho profundo:</div>
              <div className="text-sm text-gray-600">90 minutos = 90 créditos</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-primary font-bold text-lg">Emergência:</div>
              <div className="text-sm text-gray-600">10 minutos = 10 créditos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Therapists List Section */}
      <section id="terapeutas" className="py-20 bg-white">
        <TherapistsList />
      </section>

      {/* Blog Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-4xl font-bold text-gray-900">Recursos e Conteúdo</h2>
            </div>
            <p className="text-xl text-gray-600">
              Artigos e guias sobre saúde mental, bem-estar e autoconhecimento
            </p>
          </div>

          {latestArticles.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {latestArticles.map((article) => (
                <Card
                  key={article.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/blog/${article.slug}`)}
                >
                  {article.featured_image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {article.categories?.map((category) => (
                        <Badge
                          key={category.id}
                          style={{ backgroundColor: category.color }}
                          className="text-white text-xs"
                        >
                          {category.name}
                        </Badge>
                      ))}
                      {article.read_time_minutes && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {article.read_time_minutes} min
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3">
                      {article.excerpt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Em breve, novos artigos sobre saúde mental e bem-estar</p>
            </div>
          )}

          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg"
              onClick={() => navigate('/blog')}
            >
              Ver Mais Artigos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para Começar sua Jornada de Bem-estar?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Junte-se a milhares de pessoas que já transformaram suas vidas com nossa plataforma flexível.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg"
            onClick={() => navigate('/form')}
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
                <Heart className="h-6 w-6 text-indigo-400" />
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
                <li><Link to="/blog" className="hover:text-gray-300">Blog</Link></li>
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
