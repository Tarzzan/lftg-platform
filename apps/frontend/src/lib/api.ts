import axios from 'axios';
import { useAuthStore } from '@/lib/auth-store';

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Injection dynamique du token depuis le store Zustand (corrige le bug token périmé)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
  stockCsv: () => `/api/v1/export/stock/csv`,
  animauxCsv: () => `/api/v1/export/animaux/csv`,
  auditCsv: (limit?: number) => `/api/v1/export/audit/csv${limit ? `?limit=${limit}` : ''}`,
  personnelCsv: () => `/api/v1/export/personnel/csv`,
  formationCsv: () => `/api/v1/export/formation/csv`,
  stockReport: () => `/api/v1/export/stock/report`,
};

// ─── Notifications (SSE) ──────────────────────────────────────────────────
export const notificationsApi = {
  streamUrl: () => `/api/v1/notifications/stream`,
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
  deleteEmployee: (id: string) => api.delete(`/plugins/personnel/employees/${id}`).then((r) => r.data),
  skills: () => api.get('/plugins/personnel/skills').then((r) => r.data),
  createSkill: (data: any) => api.post('/plugins/personnel/skills', data).then((r) => r.data),
  leaves: (employeeId?: string) =>
    api.get('/plugins/personnel/leaves', { params: employeeId ? { employeeId } : {} }).then((r) => r.data),
  createLeave: (data: any) => api.post('/plugins/personnel/leaves', data).then((r) => r.data),
  updateLeave: (id: string, data: any) => api.patch(`/plugins/personnel/leaves/${id}`, data).then((r) => r.data),
};

// ─── Plugin: Formation ────────────────────────────────────────────────────
export const formationApi = {
  // Stats
  stats: () => api.get('/plugins/formation/stats').then((r) => r.data),

  // Courses
  courses: (params?: any) => api.get('/plugins/formation/courses', { params }).then((r) => r.data),
  getCourse: (id: string) => api.get(`/plugins/formation/courses/${id}`).then((r) => r.data),
  createCourse: (data: any) => api.post('/plugins/formation/courses', data).then((r) => r.data),
  updateCourse: (id: string, data: any) => api.patch(`/plugins/formation/courses/${id}`, data).then((r) => r.data),
  deleteCourse: (id: string) => api.delete(`/plugins/formation/courses/${id}`).then((r) => r.data),

  // Chapters
  addChapter: (courseId: string, data: any) => api.post(`/plugins/formation/courses/${courseId}/chapters`, data).then((r) => r.data),
  updateChapter: (id: string, data: any) => api.patch(`/plugins/formation/chapters/${id}`, data).then((r) => r.data),
  deleteChapter: (id: string) => api.delete(`/plugins/formation/chapters/${id}`).then((r) => r.data),

  // Lessons
  addLesson: (chapterId: string, data: any) => api.post(`/plugins/formation/chapters/${chapterId}/lessons`, data).then((r) => r.data),
  updateLesson: (id: string, data: any) => api.patch(`/plugins/formation/lessons/${id}`, data).then((r) => r.data),
  deleteLesson: (id: string) => api.delete(`/plugins/formation/lessons/${id}`).then((r) => r.data),
  completeLesson: (lessonId: string, timeSpent?: number) => api.post(`/plugins/formation/lessons/${lessonId}/complete`, { timeSpent }).then((r) => r.data),

  // Documents (upload multi-format)
  uploadDocument: (formData: FormData) => api.post('/plugins/formation/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  updateDocument: (id: string, data: any) => api.patch(`/plugins/formation/documents/${id}`, data).then((r) => r.data),
  deleteDocument: (id: string) => api.delete(`/plugins/formation/documents/${id}`).then((r) => r.data),
  getDocsByLesson: (lessonId: string) => api.get(`/plugins/formation/lessons/${lessonId}/documents`).then((r) => r.data),
  getDocsByCourse: (courseId: string) => api.get(`/plugins/formation/courses/${courseId}/documents`).then((r) => r.data),

  // Quiz
  addQuiz: (lessonId: string, data: any) => api.post(`/plugins/formation/lessons/${lessonId}/quizzes`, data).then((r) => r.data),
  submitQuizAnswer: (data: any) => api.post('/plugins/formation/quiz-answers', data).then((r) => r.data),

  // Cohorts
  cohorts: () => api.get('/plugins/formation/cohorts').then((r) => r.data),
  getCohort: (id: string) => api.get(`/plugins/formation/cohorts/${id}`).then((r) => r.data),
  createCohort: (courseId: string, data: any) => api.post(`/plugins/formation/courses/${courseId}/cohorts`, data).then((r) => r.data),
  updateCohort: (id: string, data: any) => api.patch(`/plugins/formation/cohorts/${id}`, data).then((r) => r.data),

  // Enrollments
  enroll: (cohortId: string) => api.post(`/plugins/formation/cohorts/${cohortId}/enroll`, {}).then((r) => r.data),
  unenroll: (enrollmentId: string) => api.delete(`/plugins/formation/enrollments/${enrollmentId}`).then((r) => r.data),
  myEnrollments: () => api.get('/plugins/formation/my-enrollments').then((r) => r.data),
  getEnrollmentProgress: (enrollmentId: string) => api.get(`/plugins/formation/enrollments/${enrollmentId}/progress`).then((r) => r.data),

  // Attendance & Signatures
  createAttendanceSheet: (cohortId: string, data: any) => api.post(`/plugins/formation/cohorts/${cohortId}/attendance`, data).then((r) => r.data),
  getAttendanceSheets: (cohortId: string) => api.get(`/plugins/formation/cohorts/${cohortId}/attendance`).then((r) => r.data),
  signAttendance: (data: any) => api.post('/plugins/formation/signatures', data).then((r) => r.data),
  getSignatures: (enrollmentId: string) => api.get(`/plugins/formation/enrollments/${enrollmentId}/signatures`).then((r) => r.data),

  // Learner Notes
  addNote: (data: any) => api.post('/plugins/formation/notes', data).then((r) => r.data),
  getNotes: (enrollmentId: string, includePrivate?: boolean) => api.get(`/plugins/formation/enrollments/${enrollmentId}/notes`, { params: includePrivate ? { private: true } : {} }).then((r) => r.data),
  updateNote: (id: string, data: any) => api.patch(`/plugins/formation/notes/${id}`, data).then((r) => r.data),
  deleteNote: (id: string) => api.delete(`/plugins/formation/notes/${id}`).then((r) => r.data),

  // Qualiopi Dashboard
  getQualiopi: (cohortId: string) => api.get(`/plugins/formation/cohorts/${cohortId}/qualiopi`).then((r) => r.data),

  // Quiz management
  getQuizzesByLesson: (lessonId: string) => api.get(`/plugins/formation/lessons/${lessonId}/quizzes`).then((r) => r.data),
  deleteQuiz: (quizId: string) => api.delete(`/plugins/formation/quizzes/${quizId}`).then((r) => r.data),

  // Objectives & Prerequisites
  setCourseObjectives: (courseId: string, objectives: string[]) =>
    api.post(`/plugins/formation/courses/${courseId}/objectives`, { objectives }).then((r) => r.data),
  setCoursePrerequisites: (courseId: string, prerequisites: string[]) =>
    api.post(`/plugins/formation/courses/${courseId}/prerequisites`, { prerequisites }).then((r) => r.data),
  setLessonObjectives: (lessonId: string, objectives: string[]) =>
    api.post(`/plugins/formation/lessons/${lessonId}/objectives`, { objectives }).then((r) => r.data),

  // Certificates & Badges
  getMyCertificates: () => api.get('/plugins/formation/my-certificates').then((r) => r.data),
  getMyBadges: () => api.get('/plugins/formation/my-badges').then((r) => r.data),
  getLeaderboard: () => api.get('/plugins/formation/leaderboard').then((r) => r.data),

  // Feedback
  submitFeedback: (data: any) => api.post('/plugins/formation/feedback', data).then((r) => r.data),
  getFeedbacks: (cohortId: string) => api.get(`/plugins/formation/cohorts/${cohortId}/feedbacks`).then((r) => r.data),
};
