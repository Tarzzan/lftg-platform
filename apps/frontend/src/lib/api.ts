import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('lftg-auth');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch {}
  }
  return config;
});

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  register: (email: string, name: string, password: string) =>
    api.post('/auth/register', { email, name, password }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

// Users
export const usersApi = {
  list: () => api.get('/users').then((r) => r.data),
  get: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data).then((r) => r.data),
  assignRoles: (id: string, roleIds: string[]) =>
    api.post(`/users/${id}/roles`, { roleIds }).then((r) => r.data),
};

// Roles
export const rolesApi = {
  list: () => api.get('/roles').then((r) => r.data),
  create: (data: any) => api.post('/roles', data).then((r) => r.data),
  addPermissions: (id: string, permissions: any[]) =>
    api.post(`/roles/${id}/permissions`, { permissions }).then((r) => r.data),
};

// Workflows
export const workflowsApi = {
  definitions: () => api.get('/workflows/definitions').then((r) => r.data),
  instances: (params?: any) => api.get('/workflows/instances', { params }).then((r) => r.data),
  getInstance: (id: string) => api.get(`/workflows/instances/${id}`).then((r) => r.data),
  transition: (id: string, data: any) =>
    api.post(`/workflows/instances/${id}/transition`, data).then((r) => r.data),
};

// Audit
export const auditApi = {
  list: (params?: any) => api.get('/audit', { params }).then((r) => r.data),
};

// Plugin: Stock
export const stockApi = {
  items: () => api.get('/plugins/stock/items').then((r) => r.data),
  alerts: () => api.get('/plugins/stock/items/alerts').then((r) => r.data),
  movements: (itemId?: string) =>
    api.get('/plugins/stock/movements', { params: itemId ? { itemId } : {} }).then((r) => r.data),
  requests: () => api.get('/plugins/stock/requests').then((r) => r.data),
  createMovement: (data: any) => api.post('/plugins/stock/movements', data).then((r) => r.data),
};

// Plugin: Animaux
export const animauxApi = {
  stats: () => api.get('/plugins/animaux/stats').then((r) => r.data),
  species: () => api.get('/plugins/animaux/species').then((r) => r.data),
  animals: (params?: any) => api.get('/plugins/animaux/animals', { params }).then((r) => r.data),
  broods: () => api.get('/plugins/animaux/broods').then((r) => r.data),
  addEvent: (animalId: string, data: any) =>
    api.post(`/plugins/animaux/animals/${animalId}/events`, data).then((r) => r.data),
};

// Plugin: Personnel
export const personnelApi = {
  employees: () => api.get('/plugins/personnel/employees').then((r) => r.data),
  skills: () => api.get('/plugins/personnel/skills').then((r) => r.data),
};

// Plugin: Formation
export const formationApi = {
  courses: (published?: boolean) =>
    api.get('/plugins/formation/courses', { params: published ? { published: 'true' } : {} }).then((r) => r.data),
  myEnrollments: () => api.get('/plugins/formation/my-enrollments').then((r) => r.data),
};
