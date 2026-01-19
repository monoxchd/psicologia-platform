import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Heart, Clock, Shield, Star, Users, ArrowRight, BookOpen } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import TherapistsList from '../components/TherapistsList.jsx'
import { blogService } from '../services/blogService.js'
import horizontalLogo from '../assets/horizontal-logo.png'
import heroImage from '../assets/hero-image.jpg'

export default function LandingPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
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
              <a href="#como-funciona" className="text-gray-600 hover:text-blue-600">Como Funciona</a>
              <a href="#terapeutas" className="text-gray-600 hover:text-blue-600">Terapeutas</a>
              <Link to="/blog" className="text-gray-600 hover:text-blue-600">Blog</Link>
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
                Saúde Mental <span className="text-blue-600">Acessível</span> e Especializada
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Acesse conteúdo de qualidade sobre bem-estar e conecte-se com psicólogos
                especializados. Informação confiável e profissionais qualificados em um só lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                  onClick={() => navigate('/blog')}
                >
                  Explorar Blog
                  <BookOpen className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg"
                  onClick={() => {
                    document.getElementById('terapeutas')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Conhecer Terapeutas
                </Button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Conteúdo Confiável
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Psicólogos Especializados
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  100% Seguro
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
                  <Heart className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Cuidado Profissional</p>
                    <p className="text-sm text-gray-500">Quando você precisa</p>
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
            <p className="text-xl text-gray-600">Três passos simples para cuidar da sua saúde mental</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>1. Leia Artigos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Explore nosso blog com conteúdo confiável sobre saúde mental, bem-estar e
                  autoconhecimento escrito por profissionais qualificados.
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
                  Conheça nossos psicólogos especializados, veja seus perfis,
                  especialidades e encontre o profissional ideal para você.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>3. Marque sua Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Acesse a página do profissional escolhido e agende sua sessão
                  diretamente através do sistema de agendamento deles.
                </p>
              </CardContent>
            </Card>
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
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
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
                    <CardTitle className="text-xl hover:text-blue-600 transition-colors line-clamp-2">
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
                <img 
                  src={horizontalLogo} 
                  alt="Terapia Conecta Logo"
                />
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
            <p>&copy; 2025 TerapiaConecta. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}