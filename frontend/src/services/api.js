import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Standardize response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
      }
      
      let message = error.response.data?.message;
      if (!message && typeof error.response.data?.error === 'string') {
        message = error.response.data.error;
      }
      message = message || error.response.statusText || 'API Error';

      return Promise.reject({
        ...error,
        message,
        status: error.response.status,
      });
    }
    return Promise.reject({
      ...error,
      message: error.message || 'Network Error',
    });
  }
);

// Auth endpoints
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Report endpoints
export const reportAPI = {
  getReports: () => api.get('/reports'),
  getReport: (id) => api.get(`/reports/${id}`),
  uploadReport: (formData) => api.post('/reports/upload', formData),
  deleteReport: (id) => api.delete(`/reports/${id}`),
};

// AI endpoints
export const aiAPI = {
  analyzeReport: (reportId) => api.post('/ai/analyze', { reportId }),
  getInsights: (reportId) => api.get(`/ai/insights/${reportId}`),
  predictHealth: (vitals) => api.post('/ai/predict', vitals),
};

// Emergency endpoints (public - no auth required)
export const emergencyAPI = {
  getEmergencyInfo: (userId) => api.get(`/emergency/${userId}`),
  generateQRCode: (userId, format = 'base64', baseUrl = null) => {
    let url = `/emergency/${userId}/qr?format=${format}`;
    if (baseUrl) {
      url += `&baseUrl=${encodeURIComponent(baseUrl)}`;
    }
    return api.get(url);
  },
};
