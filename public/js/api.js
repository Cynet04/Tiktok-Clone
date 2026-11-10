const API_BASE = '/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', body: data });
  }

  async put(endpoint, data) {
    return this.request(endpoint, { method: 'PUT', body: data });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async getVideos(page = 1, limit = 10) {
    return this.get(`/videos?page=${page}&limit=${limit}`);
  }

  async getVideo(id) {
    return this.get(`/videos/${id}`);
  }

  async createVideo(data) {
    return this.post('/videos', data);
  }

  async likeVideo(id) {
    return this.post(`/videos/${id}/like`);
  }

  async getUser(id) {
    return this.get(`/users/${id}`);
  }

  async getUserVideos(userId) {
    return this.get(`/users/${userId}/videos`);
  }

  async getTrendingHashtags() {
    return this.get('/hashtags/trending');
  }

  async search(query) {
    return this.get(`/search?q=${encodeURIComponent(query)}`);
  }

  async getMessages(userId) {
    return this.get(`/messages?userId=${userId}`);
  }

  async sendMessage(data) {
    return this.post('/messages', data);
  }

  async markMessageRead(id) {
    return this.put(`/messages/${id}/read`);
  }

  async healthCheck() {
    return this.get('/health');
  }
}

const api = new ApiClient();

export default api;