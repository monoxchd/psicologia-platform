import api from './api';

class TherapistService {
  async getAllTherapists(filters = {}) {
    try {
      const therapists = await api.get('/therapists', filters);
      return therapists;
    } catch (error) {
      console.error('Failed to fetch therapists:', error);
      throw error;
    }
  }

  async getTherapistById(id) {
    try {
      const therapist = await api.get(`/therapists/${id}`);
      return therapist;
    } catch (error) {
      console.error(`Failed to fetch therapist with id ${id}:`, error);
      throw error;
    }
  }

  async getTherapistAvailability(id, startDate, endDate) {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const availability = await api.get(`/therapists/${id}/availability`, params);
      return availability;
    } catch (error) {
      console.error(`Failed to fetch availability for therapist ${id}:`, error);
      throw error;
    }
  }

  async getHighlyRatedTherapists() {
    return this.getAllTherapists({ highly_rated: 'true' });
  }

  async getTherapistsBySpecialty(specialty) {
    return this.getAllTherapists({ specialty });
  }

  formatTherapistForUI(therapist) {
    return {
      id: therapist.id,
      name: therapist.name,
      specialty: therapist.specialty,
      experience: `${therapist.experience_years} anos`,
      rating: therapist.rating,
      creditsPerMinute: therapist.credits_per_minute,
      available: therapist.next_available 
        ? `${therapist.next_available} às ${therapist.next_available_time}`
        : 'Verificar disponibilidade',
      image: therapist.profile_image_url || '👨‍⚕️',
      bio: therapist.bio,
      crpNumber: therapist.crp_number
    };
  }

  formatTherapistsForUI(therapists) {
    return therapists.map(therapist => this.formatTherapistForUI(therapist));
  }
}

export default new TherapistService();