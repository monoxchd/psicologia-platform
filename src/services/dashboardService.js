import api from './api.js'

class DashboardService {
  async getDashboardStats(userId = null) {
    try {
      const response = await api.get('/sessions/stats')
      return response.stats
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      throw error
    }
  }

  async getRecentSessions(limit = 3) {
    try {
      const response = await api.get('/sessions/history', {
        limit,
        status: 'completed'
      })
      return response.sessions
    } catch (error) {
      console.error('Failed to fetch recent sessions:', error)
      throw error
    }
  }

  async getUpcomingAppointments() {
    try {
      const response = await api.get('/appointments/upcoming')
      return response.appointments
    } catch (error) {
      console.error('Failed to fetch upcoming appointments:', error)
      throw error
    }
  }

  async getUserProfile() {
    try {
      const response = await api.get('/users/show')
      return response.user
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      throw error
    }
  }

  formatStatsForUI(stats) {
    return {
      creditsRemaining: stats.credits_remaining || 120,
      totalSessions: stats.total_sessions || 0,
      totalHours: stats.total_hours || 0,
      averageRating: stats.average_rating || 0,
      sessionsThisMonth: stats.sessions_this_month || 0,
      averageSessionDuration: stats.average_session_duration || 0,
      nextSession: stats.next_session || null,
      estimatedSessionsRemaining: Math.floor((stats.credits_remaining || 120) / 50) // Assuming ~50 credits per session
    }
  }

  formatSessionsForUI(sessions) {
    return sessions.map(session => ({
      id: session.id,
      date: session.date,
      time: session.time,
      therapist: session.therapist.name,
      duration: `${session.duration} min`,
      status: session.status === 'completed' ? 'Concluída' : session.status,
      type: session.type
    }))
  }

  formatAppointmentsForUI(appointments) {
    return appointments.map(appointment => ({
      id: appointment.id,
      date: this.formatAppointmentDate(appointment.date, appointment.time),
      therapist: appointment.therapist.name,
      type: appointment.type || 'Terapia Individual',
      status: appointment.status,
      canCancel: appointment.can_cancel,
      startingSoon: appointment.starting_soon
    }))
  }

  formatAppointmentDate(date, time) {
    const appointmentDate = new Date(`${date} ${time}`)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (appointmentDate.toDateString() === today.toDateString()) {
      return `Hoje, ${time}`
    } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
      return `Amanhã, ${time}`
    } else {
      const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      const weekday = weekdays[appointmentDate.getDay()]
      return `${weekday}, ${time}`
    }
  }
}

export default new DashboardService()