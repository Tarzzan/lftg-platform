import { PluginManifest } from '../../../apps/backend/src/modules/plugins/plugin-registry.service';

export const personnelManifest: PluginManifest = {
  id: 'plugin-personnel',
  name: 'Gestion du Personnel (RH)',
  version: '1.0.0',
  description: 'Gestion des employés, équipes, compétences et documents RH',
  permissions: [
    { action: 'read', subject: 'Employee' },
    { action: 'create', subject: 'Employee' },
    { action: 'update', subject: 'Employee' },
    { action: 'delete', subject: 'Employee' },
    { action: 'manage', subject: 'Employee' },
  ],
  menuEntries: [
    { label: 'Personnel', path: '/admin/personnel', icon: 'Users', roles: ['admin', 'rh'] },
    { label: 'Employés', path: '/admin/personnel/employes', icon: 'User', roles: ['admin', 'rh'] },
    { label: 'Compétences', path: '/admin/personnel/competences', icon: 'Award', roles: ['admin', 'rh'] },
  ],
  hooks: ['user.created', 'user.deactivated'],
};
