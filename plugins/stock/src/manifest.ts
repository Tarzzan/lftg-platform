import { PluginManifest } from '../../../apps/backend/src/modules/plugins/plugin-registry.service';

export const stockManifest: PluginManifest = {
  id: 'plugin-stock',
  name: 'Gestion des Stocks',
  version: '1.0.0',
  description: 'Articles, lots, mouvements, alertes et demandes de sortie stock en workflow',
  permissions: [
    { action: 'read', subject: 'StockItem' },
    { action: 'create', subject: 'StockItem' },
    { action: 'update', subject: 'StockItem' },
    { action: 'manage', subject: 'StockItem' },
    { action: 'read', subject: 'StockRequest' },
    { action: 'create', subject: 'StockRequest' },
    { action: 'manage', subject: 'StockRequest' },
  ],
  menuEntries: [
    { label: 'Stock', path: '/admin/stock', icon: 'Package', roles: ['admin', 'gestionnaire'] },
    { label: 'Articles', path: '/admin/stock/articles', icon: 'Archive', roles: ['admin', 'gestionnaire'] },
    { label: 'Mouvements', path: '/admin/stock/mouvements', icon: 'ArrowLeftRight', roles: ['admin', 'gestionnaire'] },
    { label: 'Demandes', path: '/admin/stock/demandes', icon: 'ClipboardList', roles: ['admin', 'gestionnaire', 'employe'] },
  ],
  hooks: ['workflow.transitioned'],
};
