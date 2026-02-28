import api from './api'

const appointmentService = {
  async createAppointment(data) {
    return api.post('/appointments', { appointment: data })
  },

  async getUpcoming() {
    return api.get('/appointments/upcoming')
  }
}

export default appointmentService
