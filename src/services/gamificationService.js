// Reading-based gamification: streaks + badges, stored in localStorage.
// Per-device only — clearing storage resets progress. Acceptable for V1.

const ACHIEVEMENTS = {
  first_article:    { title: 'Primeiro Artigo',          description: 'Leu seu primeiro artigo na plataforma', icon: '📖' },
  streak_3:         { title: 'Três Dias Seguidos',       description: '3 dias consecutivos de leitura',         icon: '🔥' },
  knowledge_seeker: { title: 'Buscador de Conhecimento', description: 'Leu 5 artigos',                          icon: '🎓' },
  streak_7:         { title: 'Hábito Saudável',          description: '7 dias consecutivos de leitura',         icon: '🌱' },
  avid_reader:      { title: 'Leitor Ávido',             description: 'Leu 10 artigos',                         icon: '📚' },
  monthly_reader:   { title: 'Leitor Dedicado',          description: 'Leu 30 artigos',                         icon: '🏆' },
}

const ACHIEVEMENT_ORDER = [
  'first_article',
  'streak_3',
  'knowledge_seeker',
  'streak_7',
  'avid_reader',
  'monthly_reader',
]

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dayDiff(from, to) {
  return Math.floor((startOfDay(to) - startOfDay(from)) / (1000 * 60 * 60 * 24))
}

class GamificationService {
  constructor() {
    this.storageKey = 'user_gamification_data'
  }

  getUserData() {
    const raw = localStorage.getItem(this.storageKey)
    if (raw) {
      try { return JSON.parse(raw) } catch { /* fall through to default */ }
    }
    return {
      articlesRead: [],
      currentStreak: 0,
      longestStreak: 0,
      achievements: [],
      lastActivity: null,
    }
  }

  saveUserData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }

  hasReadArticle(articleId) {
    return this.getUserData().articlesRead.includes(String(articleId))
  }

  markArticleAsRead(articleId, articleTitle = '') {
    const userData = this.getUserData()
    const id = String(articleId)

    if (userData.articlesRead.includes(id)) {
      return { success: false, alreadyRead: true, message: 'Article already read' }
    }

    userData.articlesRead.push(id)

    const now = new Date()
    if (!userData.lastActivity) {
      userData.currentStreak = 1
    } else {
      const diff = dayDiff(new Date(userData.lastActivity), now)
      if (diff === 0) {
        userData.currentStreak = userData.currentStreak || 1
      } else if (diff === 1) {
        userData.currentStreak = (userData.currentStreak || 0) + 1
      } else {
        userData.currentStreak = 1
      }
    }

    if (userData.currentStreak > (userData.longestStreak || 0)) {
      userData.longestStreak = userData.currentStreak
    }

    userData.lastActivity = now.toISOString()

    const newAchievements = this._checkForAchievements(userData)
    if (newAchievements.length) userData.achievements.push(...newAchievements)

    this.saveUserData(userData)

    return {
      success: true,
      newAchievements,
      message: `Leitura registrada: "${articleTitle}"`,
      articleId: id,
      userData,
    }
  }

  _checkForAchievements(userData) {
    const earned = new Set(userData.achievements)
    const total = userData.articlesRead.length
    const streak = userData.currentStreak

    const conditions = {
      first_article: total >= 1,
      streak_3: streak >= 3,
      knowledge_seeker: total >= 5,
      streak_7: streak >= 7,
      avid_reader: total >= 10,
      monthly_reader: total >= 30,
    }

    return ACHIEVEMENT_ORDER.filter(id => conditions[id] && !earned.has(id))
  }

  // Decays to 0 if last activity was 2+ days ago.
  getReadingStreak() {
    const userData = this.getUserData()
    if (!userData.lastActivity || !userData.currentStreak) return 0
    const diff = dayDiff(new Date(userData.lastActivity), new Date())
    return diff <= 1 ? userData.currentStreak : 0
  }

  getAchievementDetails(id) {
    return ACHIEVEMENTS[id] || null
  }

  getAllAchievementDefinitions() {
    return ACHIEVEMENT_ORDER.map(id => ({ id, ...ACHIEVEMENTS[id] }))
  }

  getUserLevel() {
    const total = this.getUserData().articlesRead.length
    if (total < 5) return { level: 1, title: 'Novato' }
    if (total < 15) return { level: 2, title: 'Explorador' }
    if (total < 30) return { level: 3, title: 'Defensor' }
    return { level: 4, title: 'Campeão' }
  }

  getAllStats() {
    const userData = this.getUserData()
    return {
      articlesRead: userData.articlesRead.length,
      readingStreak: this.getReadingStreak(),
      longestStreak: userData.longestStreak || 0,
      achievements: userData.achievements,
      userLevel: this.getUserLevel(),
    }
  }
}

export default new GamificationService()
