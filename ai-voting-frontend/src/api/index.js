import axios from 'axios';

/** Base URL do backend Spring Boot */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/** Instância configurada do axios */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Interceptor de requisição:
 * Adiciona automaticamente o token JWT no header Authorization.
 */
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

/**
 * Interceptor de resposta:
 * Se o backend retornar 401 (não autorizado), limpa o localStorage
 * e redireciona para o login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ─── VOTES ────────────────────────────────────────────────────────────

export const votesAPI = {
  submit: (aiNames) => api.post('/votes', { aiNames }),
  getMyVotes: () => api.get('/votes/my'),
  getStatus: () => api.get('/votes/status'),
};

// ─── QUESTIONNAIRE ────────────────────────────────────────────────────

export const questionnaireAPI = {
  submit: (data) => api.post('/questionnaire', data),
  getStatus: () => api.get('/questionnaire/status'),
  getMyResponse: () => api.get('/questionnaire/my'),
};

// ─── DASHBOARD ────────────────────────────────────────────────────────

export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
};

export default api;
