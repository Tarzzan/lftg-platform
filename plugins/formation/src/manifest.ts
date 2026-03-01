import { PluginManifest } from '../../../apps/backend/src/modules/plugins/plugin-registry.service';

export const formationManifest: PluginManifest = {
  id: 'plugin-formation',
  name: 'Formation (LMS)',
  version: '1.0.0',
  description: 'Cours, chapitres, leçons, quiz, cohortes et suivi de progression',
  permissions: [
    { action: 'read', subject: 'Course' },
    { action: 'create', subject: 'Course' },
    { action: 'manage', subject: 'Course' },
    { action: 'read', subject: 'Enrollment' },
    { action: 'manage', subject: 'Enrollment' },
  ],
  menuEntries: [
    { label: 'Formation', path: '/admin/formation', icon: 'GraduationCap', roles: ['admin', 'formateur'] },
    { label: 'Cours', path: '/admin/formation/cours', icon: 'BookOpen', roles: ['admin', 'formateur'] },
    { label: 'Mes formations', path: '/formation', icon: 'BookMarked', roles: ['employe', 'admin', 'formateur'] },
  ],
  hooks: [],
};
