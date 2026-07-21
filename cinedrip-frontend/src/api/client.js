import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinedrip_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (payload) => client.post('/auth/register', payload),
  login: (payload) => client.post('/auth/login', payload),
};

export const tasteAPI = {
  save: (payload) => client.post('/taste/save', payload),
  get: () => client.get('/taste'),
};

export const moviesAPI = {
  trending: () => client.get('/movies/trending'),
  search: (query) => client.get('/movies/search', { params: { query } }),
  discover: (genre, sort = 'popularity', page = 1) =>
    client.get('/movies/discover', { params: { genre, sort, page } }),
  genres: () => client.get('/movies/genres/list'),
  detail: (id) => client.get(`/movies/${id}`),
};

export const recommendationsAPI = {
  get: () => client.get('/recommendations'),
};

export const watchlistAPI = {
  add: (payload) => client.post('/watchlist', payload),
  list: () => client.get('/watchlist'),
  remove: (tmdbId) => client.delete(`/watchlist/${tmdbId}`),
};

export const adminAPI = {
  analytics: () => client.get('/admin/analytics'),
  users: (params) => client.get('/admin/users', { params }),
  setRole: (id, role) => client.patch(`/admin/users/${id}/role`, { role }),
};

export default client;
