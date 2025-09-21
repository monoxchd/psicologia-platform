import creditsService from './creditsService.js'

class GamificationService {
  constructor() {
    // Track user activities in localStorage for now
    // In production, this should be stored in backend
    this.storageKey = 'user_gamification_data'
  }

  // Get user's gamification data
  getUserData() {
    const data = localStorage.getItem(this.storageKey)
    return data ? JSON.parse(data) : {
      articlesRead: [],
      weeklyProgress: 0,
      currentStreak: 0,
      totalCreditsEarned: 0,
      achievements: [],
      lastActivity: null
    }
  }

  // Save user's gamification data
  saveUserData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }

  // Check if user has read an article
  hasReadArticle(articleId) {
    const userData = this.getUserData()
    return userData.articlesRead.includes(articleId.toString())
  }

  // Mark article as read and award credits
  async markArticleAsRead(articleId, articleTitle = '') {
    const userData = this.getUserData()

    // Check if already read
    if (this.hasReadArticle(articleId)) {
      return {
        success: false,
        message: 'Article already read',
        alreadyRead: true
      }
    }

    // Mark as read
    userData.articlesRead.push(articleId.toString())
    userData.weeklyProgress += 5 // 5 credits per article
    userData.totalCreditsEarned += 5
    userData.lastActivity = new Date().toISOString()

    // Check for achievements
    const newAchievements = this.checkForAchievements(userData)
    userData.achievements.push(...newAchievements)

    // Save data
    this.saveUserData(userData)

    // Try to earn credits through the credits service
    const creditResult = await creditsService.earnCreditsForReading(articleId, 5)

    return {
      success: true,
      creditsEarned: 5,
      totalCredits: userData.totalCreditsEarned,
      newAchievements,
      message: `You earned 5 credits for reading "${articleTitle}"!`,
      articleId,
      userData
    }
  }

  // Check for new achievements
  checkForAchievements(userData) {
    const achievements = []
    const totalArticles = userData.articlesRead.length

    // First article achievement
    if (totalArticles === 1 && !userData.achievements.includes('first_article')) {
      achievements.push('first_article')
    }

    // Knowledge seeker (5 articles)
    if (totalArticles === 5 && !userData.achievements.includes('knowledge_seeker')) {
      achievements.push('knowledge_seeker')
    }

    // Avid reader (10 articles)
    if (totalArticles === 10 && !userData.achievements.includes('avid_reader')) {
      achievements.push('avid_reader')
    }

    // Credit earner milestones
    if (userData.totalCreditsEarned >= 50 && !userData.achievements.includes('fifty_credits')) {
      achievements.push('fifty_credits')
    }

    if (userData.totalCreditsEarned >= 100 && !userData.achievements.includes('hundred_credits')) {
      achievements.push('hundred_credits')
    }

    return achievements
  }

  // Get achievement details
  getAchievementDetails(achievementId) {
    const achievements = {
      first_article: {
        title: "Primeiro Artigo",
        description: "Leu seu primeiro artigo na plataforma",
        icon: "📖",
        credits: 0
      },
      knowledge_seeker: {
        title: "Buscador de Conhecimento",
        description: "Leu 5 artigos",
        icon: "🎓",
        credits: 10
      },
      avid_reader: {
        title: "Leitor Ávido",
        description: "Leu 10 artigos",
        icon: "📚",
        credits: 20
      },
      fifty_credits: {
        title: "Primeira Meta",
        description: "Ganhou 50 créditos",
        icon: "🎯",
        credits: 5
      },
      hundred_credits: {
        title: "Colecionador de Créditos",
        description: "Ganhou 100 créditos",
        icon: "💰",
        credits: 10
      }
    }

    return achievements[achievementId] || null
  }

  // Get user's weekly progress
  getWeeklyProgress() {
    const userData = this.getUserData()
    return {
      current: userData.weeklyProgress,
      goal: 50, // Default weekly goal
      percentage: Math.min((userData.weeklyProgress / 50) * 100, 100)
    }
  }

  // Reset weekly progress (should be called weekly)
  resetWeeklyProgress() {
    const userData = this.getUserData()
    userData.weeklyProgress = 0
    this.saveUserData(userData)
  }

  // Get reading streak (simplified version)
  getReadingStreak() {
    const userData = this.getUserData()
    // For now, return a simple streak based on recent activity
    const lastActivity = userData.lastActivity ? new Date(userData.lastActivity) : null
    const now = new Date()

    if (!lastActivity) return 0

    const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24))

    // If last activity was today or yesterday, maintain streak
    if (daysDiff <= 1) {
      return userData.currentStreak || 1
    } else {
      // Reset streak if more than 1 day gap
      userData.currentStreak = 0
      this.saveUserData(userData)
      return 0
    }
  }

  // Get user level based on articles read
  getUserLevel() {
    const userData = this.getUserData()
    const articlesRead = userData.articlesRead.length

    if (articlesRead < 5) return { level: 1, title: "Novato" }
    if (articlesRead < 15) return { level: 2, title: "Explorador" }
    if (articlesRead < 30) return { level: 3, title: "Defensor" }
    return { level: 4, title: "Campeão" }
  }

  // Get all user stats for dashboard
  getAllStats() {
    const userData = this.getUserData()
    const weeklyProgress = this.getWeeklyProgress()
    const userLevel = this.getUserLevel()

    return {
      ...userData,
      weeklyProgress: weeklyProgress.current,
      weeklyGoal: weeklyProgress.goal,
      progressPercentage: weeklyProgress.percentage,
      userLevel,
      readingStreak: this.getReadingStreak(),
      totalArticles: userData.articlesRead.length
    }
  }
}

export default new GamificationService()