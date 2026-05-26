import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token.replace(/^"|"$/g, '')}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const message = String(error.response?.data?.message || '').toLowerCase();

    if (status === 401 && (message.includes('token') || message.includes('unauthorized'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.dispatchEvent(new Event('auth:expired'));
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
