import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Clock, Eye, User } from 'lucide-react'
import CreditEarnedPopup from './CreditEarnedPopup.jsx'
import gamificationService from '@/services/gamificationService.js'
import creditsService from '@/services/creditsService.js'

// Demo component showing how to connect blog reading with credit earning
export default function ArticleReader({ article }) {
  const [showCreditPopup, setShowCreditPopup] = useState(false)
  const [hasReadArticle, setHasReadArticle] = useState(false)
  const [userCredits, setUserCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock article data for demo
  const demoArticle = article || {
    title: "Como Lidar com Ansiedade no Trabalho",
    content: `
      A ansiedade no ambiente de trabalho é um problema que afeta milhões de pessoas no Brasil.
      Neste artigo, vamos explorar estratégias práticas para gerenciar o estresse e a ansiedade
      profissional de forma saudável.

      ## Reconhecendo os Sinais

      Os primeiros passos para lidar com a ansiedade no trabalho incluem:
      - Identificar gatilhos específicos
      - Reconhecer sintomas físicos e emocionais
      - Estabelecer limites saudáveis

      ## Técnicas de Gerenciamento

      1. **Respiração consciente**: Pratique técnicas de respiração profunda
      2. **Organização**: Mantenha seu espaço de trabalho organizado
      3. **Pausas regulares**: Faça intervalos durante o dia
      4. **Comunicação**: Converse com colegas e supervisores sobre suas necessidades

      ## Quando Buscar Ajuda

      Se a ansiedade está interferindo significativamente em sua vida profissional,
      considere buscar ajuda de um profissional de saúde mental.
    `,
    author: "Dra. Maria Silva",
    readTime: "5 min",
    views: 1203
  }

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if article already read
        const articleId = demoArticle.id || '1' // Use article ID or fallback
        const alreadyRead = gamificationService.hasReadArticle(articleId)
        setHasReadArticle(alreadyRead)

        // Load current credit balance
        const balanceResponse = await creditsService.getBalance()
        if (balanceResponse.success) {
          setUserCredits(balanceResponse.data.current_balance || 0)
        }
      } catch (error) {
        console.error('Error loading article data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [demoArticle.id])

  const handleFinishReading = async () => {
    if (hasReadArticle || isProcessing) return

    setIsProcessing(true)

    try {
      const articleId = demoArticle.id || '1'

      // Call the REAL backend to earn credits
      const result = await creditsService.earnCreditsForReading(articleId)

      if (result.success) {
        setHasReadArticle(true)

        // Update local credit count with the REAL new balance from backend
        setUserCredits(result.data.new_balance)

        // Also update gamification tracking
        await gamificationService.markArticleAsRead(articleId, demoArticle.title)

        // Show celebration popup with real data
        setShowCreditPopup(true)
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{demoArticle.title}</CardTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {demoArticle.author}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {demoArticle.readTime}
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {demoArticle.views} visualizações
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {demoArticle.content.split('\n').map((paragraph, index) => {
              if (paragraph.trim().startsWith('##')) {
                return <h2 key={index} className="text-xl font-semibold mt-6 mb-3">{paragraph.replace('##', '').trim()}</h2>
              }
              if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                return <h3 key={index} className="font-semibold mt-4 mb-2">{paragraph.replace(/\*\*/g, '')}</h3>
              }
              if (paragraph.trim().startsWith('-')) {
                return <li key={index} className="ml-4">{paragraph.replace('-', '').trim()}</li>
              }
              if (paragraph.trim().startsWith('1.')) {
                return <div key={index} className="mb-2"><strong>{paragraph.split(':')[0]}:</strong> {paragraph.split(':')[1]}</div>
              }
              return paragraph.trim() ? <p key={index} className="mb-4">{paragraph.trim()}</p> : null
            })}
          </div>

          {/* Reading Completion */}
          <div className="mt-8 pt-6 border-t">
            {loading ? (
              <div className="text-center">
                <p className="text-gray-600">Carregando...</p>
              </div>
            ) : !hasReadArticle ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  🎯 Complete a leitura para ganhar <strong>+5 créditos</strong>!
                </p>
                <Button
                  onClick={handleFinishReading}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processando...' : '✅ Marcar como Lido'}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-green-600 font-semibold">
                  ✅ Artigo concluído! +5 créditos adicionados à sua conta.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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