import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('schemesaarthi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API helper functions
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (full_name, email, password) => api.post('/auth/register', { full_name, email, password }),
  getProfile: () => api.get('/auth/me'),
};

export const schemeService = {
  getSchemes: (params) => api.get('/schemes', { params }),
  getCategories: () => api.get('/schemes/categories'),
  getDepartments: () => api.get('/schemes/departments'),
  getStates: () => api.get('/schemes/states'),
  getStats: () => api.get('/schemes/stats'),
  getSchemeDetail: (idOrSlug) => api.get(`/schemes/${idOrSlug}`),
  createScheme: (data) => api.post('/schemes', data),
  deleteScheme: (id) => api.delete(`/schemes/${id}`),
};

export const searchService = {
  search: (query, params = {}) => api.get('/search', { params: { q: query, ...params } }),
  semanticSearch: (data) => api.post('/search/semantic', data),
};

export const eligibilityService = {
  checkEligibility: (formData) => api.post('/eligibility/check', formData),
};

export const updateService = {
  getUpdates: (params) => api.get('/updates', { params }),
  getUpdateDetail: (id) => api.get(`/updates/${id}`),
};

export const voiceService = {
  askAssistant: (data) => api.post('/voice/assistant', data),
  getSamples: () => api.get('/voice/samples'),
  getStatus: () => api.get('/voice/status'),
};

export const userService = {
  getSavedSchemes: () => api.get('/user/saved-schemes'),
  toggleSaveScheme: (schemeId) => api.post(`/user/saved-schemes/${schemeId}`),
  getPreferences: () => api.get('/user/preferences'),
  updatePreferences: (data) => api.put('/user/preferences', data),
  getNotifications: () => api.get('/user/notifications'),
  markNotificationRead: (id) => api.post(`/user/notifications/${id}/read`),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPendingUpdates: () => api.get('/admin/pending-updates'),
  approveUpdate: (id) => api.post(`/admin/updates/${id}/approve`),
  rejectUpdate: (id) => api.post(`/admin/updates/${id}/reject`),
  getSources: () => api.get('/admin/sources'),
  createSource: (data) => api.post('/admin/sources', data),
  checkSource: (id) => api.post(`/admin/sources/${id}/check`),
  runAllScrapers: () => api.post('/admin/scraper/run-all'),
  getScraperOutput: () => api.get('/admin/scraper/output'),
  getScrapeLogs: () => api.get('/admin/scrape-logs'),
  simulateUpdate: (schemeSlug, updateType, newValue) =>
    api.post('/admin/simulate-update', null, {
      params: { scheme_slug: schemeSlug, update_type: updateType, new_value: newValue },
    }),
};

export default api;
