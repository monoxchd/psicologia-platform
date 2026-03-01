import api from './api'

const availabilityService = {
  async getMyAvailability() {
    return api.get('/availabilities')
  },

  async updateAvailability(weeklyTemplate) {
    return api.put('/availabilities/bulk', { weekly_template: weeklyTemplate })
  }
}

export default availabilityService
