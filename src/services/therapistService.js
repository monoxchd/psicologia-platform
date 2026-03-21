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

  async getTherapistBySlug(slug) {
    try {
      const therapist = await api.get(`/therapists/slug/${slug}`);
      return therapist;
    } catch (error) {
      console.error(`Failed to fetch therapist with slug ${slug}:`, error);
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
      experience: `${therapist.experience_years} ${therapist.experience_years === 1 ? 'ano' : 'anos'}`,
      rating: therapist.rating,
      creditsPerMinute: therapist.credits_per_minute,
      available: therapist.next_available
        ? `${therapist.next_available} às ${therapist.next_available_time}`
        : 'Verificar disponibilidade',
      image: therapist.profile_photo_url || '👨‍⚕️',
      bio: therapist.bio,
      crpNumber: therapist.crp_number,
      personalSiteUrl: therapist.personal_site_url,
      calendlyUrl: therapist.calendly_url,
      services: therapist.services || []
    };
  }

  formatTherapistsForUI(therapists) {
    return therapists.map(therapist => this.formatTherapistForUI(therapist));
  }

  async uploadProfilePhoto(therapistId, imageFile) {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/therapists/${therapistId}/upload_profile_photo`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload da foto');
    }
    return response.json();
  }

  async deleteProfilePhoto(therapistId) {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE_URL}/therapists/${therapistId}/destroy_profile_photo`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao remover foto');
    }
    return response.json();
  }
}

export default new TherapistService();