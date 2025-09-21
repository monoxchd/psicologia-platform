import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Calendar, Clock, Eye, ArrowLeft, Share2, CheckCircle, Loader2 } from 'lucide-react'
import { blogService } from '../services/blogService'
import SEOHead from '../components/SEOHead'
import StructuredData from '../components/StructuredData'
import creditsService from '../services/creditsService.js'
import authService from '../services/authService.js'
import CreditEarnedPopup from '../components/CreditEarnedPopup.jsx'

const ArticlePage = () => {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasReadArticle, setHasReadArticle] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCreditPopup, setShowCreditPopup] = useState(false)
  const [userCredits, setUserCredits] = useState(0)

  useEffect(() => {
    loadArticle()
    loadUserData()
  }, [slug])

  const loadUserData = async () => {
    try {
      if (authService.isLoggedIn()) {
        // Load user's current credit balance
        const balanceResponse = await creditsService.getBalance()
        if (balanceResponse.success) {
          setUserCredits(balanceResponse.data.current_balance || 0)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const loadArticle = async () => {
    try {
      setLoading(true)
      const response = await blogService.getArticle(slug)
      setArticle(response.article)
      setRelatedArticles(response.related_articles)
    } catch (error) {
      console.error('Error loading article:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copiado para a área de transferência!')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }

  const handleFinishReading = async () => {
    if (hasReadArticle || isProcessing || !authService.isLoggedIn()) return

    setIsProcessing(true)

    try {
      console.log(`🔄 Earning credits for article: ${article.id}`)

      // Call the REAL backend to earn credits
      const result = await creditsService.earnCreditsForReading(article.id)

      if (result.success) {
        setHasReadArticle(true)
        setUserCredits(result.data.new_balance)
        setShowCreditPopup(true)
        console.log(`✅ Credits earned! New balance: ${result.data.new_balance}`)
      } else if (result.already_earned) {
        setHasReadArticle(true)
        console.log('Credits already earned for this article')
      } else {
        console.error('Error earning credits:', result.error)
        alert('Erro ao ganhar créditos. Tente novamente.')
      }
    } catch (error) {
      console.error('Error marking article as read:', error)
      alert('Erro ao processar leitura. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const generateStructuredData = () => {
    if (!article) return {}

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": article.excerpt,
      "image": article.featured_image_url,
      "author": {
        "@type": "Person",
        "name": article.author.name
      },
      "publisher": {
        "@type": "Organization",
        "name": "MindCredits",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      },
      "datePublished": article.published_at,
      "dateModified": article.updated_at
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Carregando artigo...</div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
          <Link to="/blog" className="text-blue-600 hover:underline">
            ← Voltar ao blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={article.meta_title || article.title}
        description={article.meta_description || article.excerpt}
        image={article.featured_image_url}
        type="article"
      />
      <StructuredData data={generateStructuredData()} />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao blog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Featured Image */}
              {article.featured_image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.categories.map((category) => (
                    <Badge
                      key={category.id}
                      style={{ backgroundColor: category.color }}
                      className="text-white"
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

                {/* Meta Info */}
                <div className="flex items-center justify-between border-b pb-6 mb-8">
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(article.published_at)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {article.read_time_minutes} min de leitura
                    </span>
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {article.views_count} visualizações
                    </span>
                  </div>
                  <Button onClick={handleShare} variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={article.author.profile_image_url || '/default-avatar.png'}
                    alt={article.author.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{article.author.name}</p>
                    <p className="text-gray-600">{article.author.specialty}</p>
                  </div>
                </div>

                {/* Content */}
                <div
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Credit Earning Section */}
                {authService.isLoggedIn() && (
                  <div className="mt-8 pt-6 border-t">
                    {!hasReadArticle ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                          🎯 Complete a leitura para ganhar créditos!
                        </h3>
                        <p className="text-green-700 mb-4">
                          Ganhe <strong>+5 créditos</strong> marcando este artigo como lido
                        </p>
                        <Button
                          onClick={handleFinishReading}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar como Lido
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">
                          ✅ Artigo concluído!
                        </h3>
                        <p className="text-blue-700">
                          +5 créditos foram adicionados à sua conta
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <h3 className="font-semibold mb-3">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Artigos Relacionados</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedArticles.map((relatedArticle) => (
                    <div key={relatedArticle.id}>
                      <Link
                        to={`/blog/${relatedArticle.slug}`}
                        className="block hover:text-blue-600"
                      >
                        <h4 className="font-medium line-clamp-2 mb-1">
                          {relatedArticle.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(relatedArticle.published_at)}
                        </p>
                      </Link>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Precisa de Apoio Profissional?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Conecte-se com terapeutas licenciados em nossa plataforma
                </p>
                <Link to="/matching">
                  <Button className="w-full">Encontrar um Terapeuta</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Credit Earned Popup */}
      <CreditEarnedPopup
        isOpen={showCreditPopup}
        onClose={() => setShowCreditPopup(false)}
        creditsEarned={5}
        activity="lendo um artigo"
        totalCredits={userCredits}
      />
    </div>
  )
}

export default ArticlePage