import apiService from './api'

const activityService = {
  async getActivities() {
    const response = await apiService.get('/activities')
    return response.data
  },

  async getActivity(slug) {
    const response = await apiService.get(`/activities/${slug}`)
    return response.data
  },

  async createEntry(data) {
    const payload = {
      activity_slug: data.activity_slug,
      answers: data.answers,
      entry_date: data.entry_date
    }
    if (data.visibility) payload.visibility = data.visibility
    const response = await apiService.post('/activity_entries', payload)
    return response.data
  },

  async getEntries(params = {}) {
    const response = await apiService.get('/activity_entries', params)
    return response.data
  },

  async getMoodTrend(days = 14) {
    const response = await apiService.get('/activity_entries/mood_trend', { days })
    return response.data
  },

  async getStreak() {
    const response = await apiService.get('/activity_entries/streak')
    return response.data
  },

  async getStats() {
    const response = await apiService.get('/activity_entries/stats')
    return response.data
  }
}

export default activityService
