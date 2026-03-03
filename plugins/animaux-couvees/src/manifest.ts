import { PluginManifest } from '../../../apps/backend/src/modules/plugins/plugin-registry.service';

export const animauxCouveesManifest: PluginManifest = {
  id: 'plugin-animaux-couvees',
  name: 'Animaux & Couvées',
  version: '1.0.0',
  description: 'Suivi des espèces, enclos, animaux, événements santé et couvées/incubation',
  permissions: [
    { action: 'read', subject: 'Animal' },
    { action: 'create', subject: 'Animal' },
    { action: 'update', subject: 'Animal' },
    { action: 'manage', subject: 'Animal' },
    { action: 'read', subject: 'Brood' },
    { action: 'manage', subject: 'Brood' },
  ],
  menuEntries: [
    { label: 'Animaux', path: '/admin/animaux', icon: 'Bird', roles: ['admin', 'soigneur'] },
    { label: 'Espèces', path: '/admin/animaux/especes', icon: 'Leaf', roles: ['admin', 'soigneur'] },
    { label: 'Enclos', path: '/admin/animaux/enclos', icon: 'Home', roles: ['admin', 'soigneur'] },
    { label: 'Couvées', path: '/admin/animaux/couvees', icon: 'Egg', roles: ['admin', 'soigneur'] },
  ],
  hooks: ['workflow.transitioned'],
};
