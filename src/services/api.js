const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiService {
  setAuthToken(token) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getAuthToken() {
    if (!this.authToken) {
      this.authToken = localStorage.getItem('auth_token');
    }
    return this.authToken;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const token = this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      const data = await response.json();

      if (!response.ok) {
        // Prefer the backend's message (always Portuguese, user-facing) on
        // error.message so any caller that uses err.message still shows a
        // friendly string instead of "API Error: 401 Unauthorized".
        const backendMessage = data.error
          || (Array.isArray(data.errors) ? data.errors.filter(Boolean).join(', ') : null)
          || 'Não foi possível concluir a operação. Tente novamente.';
        const error = new Error(backendMessage);
        error.status = response.status;
        error.errors = data.errors || (data.error ? [data.error] : []);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Fetches a binary response (e.g. a PDF) with auth headers and returns a
  // Blob. JSON error bodies still surface as thrown errors.
  async requestBlob(endpoint) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {};
    const token = this.getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, { method: 'GET', headers });

    if (!response.ok) {
      let backendMessage = 'Não foi possível baixar o arquivo. Tente novamente.';
      try {
        const data = await response.json();
        backendMessage = data.error
          || (Array.isArray(data.errors) ? data.errors.filter(Boolean).join(', ') : backendMessage);
      } catch (_e) { /* non-JSON body */ }
      const error = new Error(backendMessage);
      error.status = response.status;
      throw error;
    }

    return await response.blob();
  }
}

export default new ApiService();