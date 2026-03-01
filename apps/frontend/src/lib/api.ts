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

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  register: (email: string, name: string, password: string) =>
    api.post('/auth/register', { email, name, password }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

// ─── Users ────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/users', data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
  assignRoles: (id: string, roleIds: string[]) =>
    api.post(`/users/${id}/roles`, { roleIds }).then((r) => r.data),
};

// ─── Roles ────────────────────────────────────────────────────────────────
export const rolesApi = {
  list: () => api.get('/roles').then((r) => r.data),
  get: (id: string) => api.get(`/roles/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/roles', data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/roles/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/roles/${id}`).then((r) => r.data),
  addPermissions: (id: string, permissions: any[]) =>
    api.post(`/roles/${id}/permissions`, { permissions }).then((r) => r.data),
};

// ─── Workflows ────────────────────────────────────────────────────────────
export const workflowsApi = {
  definitions: () => api.get('/workflows/definitions').then((r) => r.data),
  createDefinition: (data: any) => api.post('/workflows/definitions', data).then((r) => r.data),
  updateDefinition: (id: string, data: any) => api.patch(`/workflows/definitions/${id}`, data).then((r) => r.data),
  instances: (params?: any) => api.get('/workflows/instances', { params }).then((r) => r.data),
  getInstance: (id: string) => api.get(`/workflows/instances/${id}`).then((r) => r.data),
  createInstance: (data: any) => api.post('/workflows/instances', data).then((r) => r.data),
  transition: (id: string, data: any) =>
    api.post(`/workflows/instances/${id}/transition`, data).then((r) => r.data),
};

// ─── Audit ────────────────────────────────────────────────────────────────
export const auditApi = {
  list: (params?: any) => api.get('/audit', { params }).then((r) => r.data),
};

// ─── Stats ────────────────────────────────────────────────────────────────
export const statsApi = {
  dashboard: () => api.get('/stats/dashboard').then((r) => r.data),
  animalsBySpecies: () => api.get('/stats/animals/by-species').then((r) => r.data),
  stockEvolution: (days?: number) =>
    api.get('/stats/stock/evolution', { params: days ? { days } : {} }).then((r) => r.data),
  workflowsByState: () => api.get('/stats/workflows/by-state').then((r) => r.data),
  formationProgress: () => api.get('/stats/formation/progress').then((r) => r.data),
};

// ─── Export ───────────────────────────────────────────────────────────────
export const exportApi = {
  stockCsv: () => `${API_URL}/export/stock/csv`,
  animauxCsv: () => `${API_URL}/export/animaux/csv`,
  auditCsv: (limit?: number) => `${API_URL}/export/audit/csv${limit ? `?limit=${limit}` : ''}`,
  personnelCsv: () => `${API_URL}/export/personnel/csv`,
  formationCsv: () => `${API_URL}/export/formation/csv`,
  stockReport: () => `${API_URL}/export/stock/report`,
};

// ─── Notifications (SSE) ──────────────────────────────────────────────────
export const notificationsApi = {
  streamUrl: () => `${API_URL}/notifications/stream`,
};

// ─── Plugin: Stock ────────────────────────────────────────────────────────
export const stockApi = {
  items: (params?: any) => api.get('/plugins/stock/items', { params }).then((r) => r.data),
  getItem: (id: string) => api.get(`/plugins/stock/items/${id}`).then((r) => r.data),
  alerts: () => api.get('/plugins/stock/items/alerts').then((r) => r.data),
  createArticle: (data: any) => api.post('/plugins/stock/items', data).then((r) => r.data),
  updateArticle: (id: string, data: any) => api.patch(`/plugins/stock/items/${id}`, data).then((r) => r.data),
  deleteArticle: (id: string) => api.delete(`/plugins/stock/items/${id}`).then((r) => r.data),
  movements: (itemId?: string) =>
    api.get('/plugins/stock/movements', { params: itemId ? { itemId } : {} }).then((r) => r.data),
  createMovement: (itemId: string, data: any) =>
    api.post('/plugins/stock/movements', { ...data, itemId }).then((r) => r.data),
  requests: () => api.get('/plugins/stock/requests').then((r) => r.data),
  createRequest: (data: any) => api.post('/plugins/stock/requests', data).then((r) => r.data),
};

// ─── Plugin: Animaux ──────────────────────────────────────────────────────
export const animauxApi = {
  stats: () => api.get('/plugins/animaux/stats').then((r) => r.data),
  species: () => api.get('/plugins/animaux/species').then((r) => r.data),
  createSpecies: (data: any) => api.post('/plugins/animaux/species', data).then((r) => r.data),
  enclosures: () => api.get('/plugins/animaux/enclosures').then((r) => r.data),
  createEnclosure: (data: any) => api.post('/plugins/animaux/enclosures', data).then((r) => r.data),
  animals: (params?: any) => api.get('/plugins/animaux/animals', { params }).then((r) => r.data),
  getAnimal: (id: string) => api.get(`/plugins/animaux/animals/${id}`).then((r) => r.data),
  createAnimal: (data: any) => api.post('/plugins/animaux/animals', data).then((r) => r.data),
  updateAnimal: (id: string, data: any) => api.patch(`/plugins/animaux/animals/${id}`, data).then((r) => r.data),
  deleteAnimal: (id: string) => api.delete(`/plugins/animaux/animals/${id}`).then((r) => r.data),
  addEvent: (animalId: string, data: any) =>
    api.post(`/plugins/animaux/animals/${animalId}/events`, data).then((r) => r.data),
  broods: (params?: any) => api.get('/plugins/animaux/broods', { params }).then((r) => r.data),
  getBrood: (id: string) => api.get(`/plugins/animaux/broods/${id}`).then((r) => r.data),
  createBrood: (data: any) => api.post('/plugins/animaux/broods', data).then((r) => r.data),
  updateBrood: (id: string, data: any) => api.patch(`/plugins/animaux/broods/${id}`, data).then((r) => r.data),
};

// ─── Plugin: Personnel ────────────────────────────────────────────────────
export const personnelApi = {
  employees: (params?: any) => api.get('/plugins/personnel/employees', { params }).then((r) => r.data),
  getEmployee: (id: string) => api.get(`/plugins/personnel/employees/${id}`).then((r) => r.data),
  createEmployee: (data: any) => api.post('/plugins/personnel/employees', data).then((r) => r.data),
  updateEmployee: (id: string, data: any) => api.patch(`/plugins/personnel/employees/${id}`, data).then((r) => r.data),
  skills: () => api.get('/plugins/personnel/skills').then((r) => r.data),
  createSkill: (data: any) => api.post('/plugins/personnel/skills', data).then((r) => r.data),
  leaves: (employeeId?: string) =>
    api.get('/plugins/personnel/leaves', { params: employeeId ? { employeeId } : {} }).then((r) => r.data),
  createLeave: (data: any) => api.post('/plugins/personnel/leaves', data).then((r) => r.data),
  updateLeave: (id: string, data: any) => api.patch(`/plugins/personnel/leaves/${id}`, data).then((r) => r.data),
};

// ─── Plugin: Formation ────────────────────────────────────────────────────
export const formationApi = {
  courses: (params?: any) => api.get('/plugins/formation/courses', { params }).then((r) => r.data),
  getCourse: (id: string) => api.get(`/plugins/formation/courses/${id}`).then((r) => r.data),
  createCourse: (data: any) => api.post('/plugins/formation/courses', data).then((r) => r.data),
  updateCourse: (id: string, data: any) => api.patch(`/plugins/formation/courses/${id}`, data).then((r) => r.data),
  deleteCourse: (id: string) => api.delete(`/plugins/formation/courses/${id}`).then((r) => r.data),
  cohorts: (courseId?: string) =>
    api.get('/plugins/formation/cohorts', { params: courseId ? { courseId } : {} }).then((r) => r.data),
  createCohort: (data: any) => api.post('/plugins/formation/cohorts', data).then((r) => r.data),
  enrollments: (cohortId?: string) =>
    api.get('/plugins/formation/enrollments', { params: cohortId ? { cohortId } : {} }).then((r) => r.data),
  enroll: (data: any) => api.post('/plugins/formation/enrollments', data).then((r) => r.data),
  myEnrollments: () => api.get('/plugins/formation/my-enrollments').then((r) => r.data),
  updateProgress: (enrollmentId: string, data: any) =>
    api.patch(`/plugins/formation/enrollments/${enrollmentId}/progress`, data).then((r) => r.data),
};
