import api from './api'

const appointmentService = {
  async createAppointment(data, extras = {}) {
    return api.post('/appointments', { appointment: data, ...extras })
  },

  async getUpcoming() {
    return api.get('/appointments/upcoming')
  },

  async cancel(id) {
    return api.delete(`/appointments/${id}`)
  },

  async reschedule(id, date, time) {
    return api.put(`/appointments/${id}/reschedule`, { date, time })
  },

  async getTherapistAppointments() {
    return api.get('/appointments/for_therapist')
  }
}

export default appointmentService
