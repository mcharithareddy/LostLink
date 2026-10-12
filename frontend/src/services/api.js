import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lostlink_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lostlink_token');
      localStorage.removeItem('lostlink_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
};

// ---- Items ----
export const itemsAPI = {
  getAll: (params) => API.get('/items', { params }),
  getRecent: (limit = 8) => API.get('/items/recent', { params: { limit } }),
  getStats: () => API.get('/items/stats'),
  getById: (id) => API.get(`/items/${id}`),
  create: (data) => API.post('/items', data),
  update: (id, data) => API.put(`/items/${id}`, data),
  delete: (id) => API.delete(`/items/${id}`),
  getMy: () => API.get('/items/my'),
  updateStatus: (id, status) => API.patch(`/items/${id}/status`, null, { params: { status } }),
};

// ---- Claims ----
export const claimsAPI = {
  submit: (data) => API.post('/claims', data),
  getMy: () => API.get('/claims/my'),
  getReceived: () => API.get('/claims/received'),
  getForItem: (itemId) => API.get(`/claims/item/${itemId}`),
  review: (id, action) => API.patch(`/claims/${id}/review`, null, { params: { action } }),
};

// ---- Admin ----
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: () => API.get('/admin/users'),
  promoteUser: (id) => API.patch(`/admin/users/${id}/promote`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getItems: () => API.get('/admin/items'),
  deleteItem: (id) => API.delete(`/admin/items/${id}`),
  getClaims: () => API.get('/admin/claims'),
  reviewClaim: (id, action) => API.patch(`/admin/claims/${id}/review`, null, { params: { action } }),
};

export default API;
