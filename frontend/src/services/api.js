import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (credentials) => api.post('/auth/signup', credentials),
  getMe: () => api.get('/auth/me'),
};

export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
};

export const plantsService = {
  getAll: () => api.get('/plants'),
  getOne: (id) => api.get(`/plants/${id}`),
  create: (plantData) => api.post('/plants', plantData),
  update: (id, plantData) => api.patch(`/plants/${id}`, plantData),
  delete: (id) => api.delete(`/plants/${id}`),
  updateStats: (type, stats) => api.patch(`/plants/${type}/stats`, stats),
};

export const devicesService = {
  getAll: () => api.get('/devices'),
  control: (deviceId, action) => api.patch(`/devices/${deviceId}/control`, action),
  create: (deviceData) => api.post('/devices', deviceData),
};

export const zonesService = {
  getAll: () => api.get('/zones'),
  getOne: (id) => api.get(`/zones/${id}`),
  getZonePlants: (id) => api.get(`/zones/${id}/plants`),
  create: (zoneData) => api.post('/zones', zoneData),
  completeSeed: () => api.post('/zones/complete-seed'),
};

export const sensorsService = {
  getAll: () => api.get('/sensors'),
  getOne: (id) => api.get(`/sensors/${id}`),
};

export const logsService = {
  getAll: (params) => api.get('/logs', { params }),
};

export const automationService = {
  tick: () => api.post('/automation/tick'),
};

export default api;