import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Calendar, Clock, Eye, ArrowLeft, Share2, CheckCircle, Loader2, Brain } from 'lucide-react'
import { blogService } from '../services/blogService'
import SEOHead from '../components/SEOHead'
import StructuredData from '../components/StructuredData'
import authService from '../services/authService.js'
import EditorJSRenderer from '../components/EditorJSRenderer'
import EnigmaQuizInline from '../components/EnigmaQuizInline'
import activityService from '../services/activityService'
import gamificationService from '../services/gamificationService.js'
import ExitIntentModal from '../components/ExitIntentModal'
import useExitIntent from '../hooks/useExitIntent'
import { toast } from 'sonner'

const ENIGMA_SLUG = 'quando-a-cadeira-ao-lado-fica-vazia'

const ArticlePage = () => {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasTrackedRead, setHasTrackedRead] = useState(false)
  const [trackingRead, setTrackingRead] = useState(false)

  const { isOpen: exitIntentOpen, close: closeExitIntent } = useExitIntent({
    storageKey: 'tc_exit_intent_blog',
    enabled: !authService.isLoggedIn(),
    mobileEnabled: false,
  })

  useEffect(() => {
    loadArticle()
  }, [slug])

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

  const handleTrackRead = async () => {
    if (hasTrackedRead || trackingRead || !authService.isLoggedIn() || !article) return
    setTrackingRead(true)
    try {
      await activityService.createEntry({
        activity_slug: 'leituras',
        answers: { article_id: String(article.id), article_title: article.title },
        entry_date: new Date().toISOString().split('T')[0]
      })
      setHasTrackedRead(true)

      const result = gamificationService.markArticleAsRead(article.id, article.title)
      if (result.success && result.newAchievements?.length) {
        result.newAchievements.forEach(achievementId => {
          const details = gamificationService.getAchievementDetails(achievementId)
          if (details) {
            toast(`${details.icon} ${details.title}`, {
              description: details.description,
              duration: 5000,
            })
          }
        })
      }
    } catch (error) {
      console.error('Error tracking article read:', error)
    } finally {
      setTrackingRead(false)
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
              {(article.featured_image || article.featured_image_url) && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={article.featured_image?.full_width || article.featured_image_url}
                    srcSet={article.featured_image ? `${article.featured_image.preview_medium} 500w, ${article.featured_image.preview_large} 800w, ${article.featured_image.full_width} 1200w` : undefined}
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    alt={article.title}
                    loading="lazy"
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 mb-8">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 sm:h-4 sm:w-4" />
                      {formatDate(article.published_at)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5 sm:h-4 sm:w-4" />
                      {article.read_time_minutes} min
                    </span>
                    <span className="flex items-center gap-2">
                      <Eye className="h-5 w-5 sm:h-4 sm:w-4" />
                      {article.views_count} views
                    </span>
                  </div>
                  <Button onClick={handleShare} variant="outline" size="sm" className="w-full sm:w-auto">
                    <Share2 className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                  {article.author.profile_photo_url ? (
                    <img
                      src={article.author.profile_photo_url}
                      alt={article.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Brain className="h-7 w-7 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{article.author.name}</p>
                    <p className="text-gray-600">{article.author.specialty}</p>
                  </div>
                </div>

                {/* Content */}
                <EditorJSRenderer
                  data={(() => {
                    try {
                      return JSON.parse(article.content);
                    } catch (e) {
                      console.error('Error parsing article content:', e);
                      return { blocks: [] };
                    }
                  })()}
                  className="prose-headings:text-gray-900 prose-a:text-blue-600"
                  showTherapistCTA={true}
                  priorityTherapistId={article.author?.id}
                />

                {/* Enigma Quiz — only on the grief article */}
                {slug === ENIGMA_SLUG && <EnigmaQuizInline />}

                {/* Read Tracking */}
                {authService.isLoggedIn() && (
                  <div className="mt-8 pt-6 border-t">
                    {!hasTrackedRead ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-center">
                        <p className="text-amber-800 text-sm mb-3">
                          Gostou da leitura? Registre para acompanhar seu progresso.
                        </p>
                        <Button
                          onClick={handleTrackRead}
                          disabled={trackingRead}
                          variant="outline"
                          className="border-amber-300 text-amber-800 hover:bg-amber-100"
                        >
                          {trackingRead ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Salvando...
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
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center">
                        <p className="text-emerald-800 text-sm font-medium">
                          <CheckCircle className="h-4 w-4 inline mr-1.5" />
                          Leitura registrada!
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
                <Link
                  to="/matching"
                  state={article.author?.id ? { priorityTherapistId: article.author.id } : undefined}
                >
                  <Button className="w-full">Encontrar um Terapeuta</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Exit-intent modal (desktop, non-logged-in users) */}
      <ExitIntentModal
        open={exitIntentOpen}
        onOpenChange={(open) => { if (!open) closeExitIntent() }}
        title="Antes de ir, quer conhecer nossos psicólogos?"
        subtitle="Às vezes, o primeiro passo é o mais difícil."
        ctaLabel="Ver psicólogos"
        ctaTo="/matching"
        ctaState={article?.author?.id ? { priorityTherapistId: article.author.id } : undefined}
      />
    </div>
  )
}

export default ArticlePage