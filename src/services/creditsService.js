import apiService from './api.js'

class CreditsService {
  // Get user's credit balance and stats
  async getBalance() {
    try {
      const response = await apiService.get('/credits/balance')
      return {
        success: true,
        data: response.credits
      }
    } catch (error) {
      console.error('Error fetching credit balance:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get credit transaction history
  async getTransactions(page = 1, limit = 10) {
    try {
      const response = await apiService.get('/credits/transactions', { page, limit })
      return {
        success: true,
        data: response.transactions,
        pagination: response.pagination
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get available credit packages
  async getPackages() {
    try {
      const response = await apiService.get('/credits/packages')
      return {
        success: true,
        data: response.packages
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Purchase credits
  async purchaseCredits(packageId) {
    try {
      const response = await apiService.post('/credits/purchase', {
        package_id: packageId
      })
      return {
        success: true,
        data: response,
        message: response.message
      }
    } catch (error) {
      console.error('Error purchasing credits:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Earn credits for reading an article
  async earnCreditsForReading(articleId, creditsEarned = 5) {
    try {
      console.log(`🔄 Earning ${creditsEarned} credits for reading article ${articleId}`)
      console.log(`📤 Request payload:`, { article_id: articleId })

      const response = await apiService.post('/credits/earn-reading', {
        article_id: articleId
      })

      console.log(`✅ Credits earned! Response:`, response)

      return {
        success: response.success,
        data: {
          credits_earned: response.credits_earned,
          new_balance: response.new_balance,
          article_id: articleId
        },
        message: response.message,
        already_earned: response.already_earned
      }
    } catch (error) {
      console.error('❌ Error earning credits:', error)
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      })
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Check if user has enough credits for a session
  hasEnoughCreditsForSession(currentBalance, sessionDuration = 50) {
    return currentBalance >= sessionDuration
  }

  // Calculate credits needed for next goal
  getCreditsNeededForGoal(currentBalance, goalCredits = 50) {
    return Math.max(0, goalCredits - currentBalance)
  }

  // Estimate sessions remaining
  estimateSessionsRemaining(currentBalance, avgSessionDuration = 50) {
    return Math.floor(currentBalance / avgSessionDuration)
  }
}

export default new CreditsService()