import axios from 'axios';

// In local dev, Vite's proxy handles /api. In Docker, nginx does the same.
// On split-origin hosts like Render (static site + separate web service),
// set VITE_API_BASE_URL at build time to the backend's full URL instead —
// static-site rewrite rules don't reliably proxy POST bodies, so calling
// the backend directly (with CORS) is the more robust path there.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inkwell_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// Resolves a relative /uploads/... path (as stored by the backend) into an
// absolute URL when the frontend and backend are on different origins.
export function resolveUploadUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  return `${API_BASE}${path}`;
}
