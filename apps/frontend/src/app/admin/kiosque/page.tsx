'use client';

import { useState } from 'react';

const mockTasks = [
  { id: 't1', type: 'FEEDING', title: 'Nourrissage Ara ararauna', animal: 'Bleu', species: 'Ara ararauna', enclos: 'Volière A', time: '08:00', status: 'COMPLETED', priority: 'HIGH', notes: 'Fruits tropicaux + granulés premium', duration: 15 },
  { id: 't2', type: 'MEDICAL', title: 'Pesée hebdomadaire — Boa constrictor', animal: 'Anaconda', species: 'Boa constrictor', enclos: 'Reptilarium B', time: '09:30', status: 'IN_PROGRESS', priority: 'NORMAL', notes: 'Peser et noter dans le dossier médical', duration: 20 },
  { id: 't3', type: 'CLEANING', title: 'Nettoyage Volière B', animal: null, species: null, enclos: 'Volière B', time: '10:00', status: 'PENDING', priority: 'NORMAL', notes: 'Désinfection complète + remplacement litière', duration: 45 },
  { id: 't4', type: 'OBSERVATION', title: 'Observation comportementale — Dendrobates', animal: 'Dendro', species: 'Dendrobates azureus', enclos: 'Amphibiens C', time: '11:00', status: 'PENDING', priority: 'LOW', notes: 'Vérifier comportement reproducteur', duration: 30 },
  { id: 't5', type: 'FEEDING', title: 'Nourrissage Caïman à lunettes', animal: 'Caïman', species: 'Caiman crocodilus', enclos: 'Bassin D', time: '14:00', status: 'PENDING', priority: 'HIGH', notes: 'Poissons vivants uniquement — ATTENTION manipulation', duration: 25 },
  { id: 't6', type: 'MEDICAL', title: 'Traitement antiparasitaire — Dendrobates', animal: 'Dendro', species: 'Dendrobates azureus', enclos: 'Amphibiens C', time: '15:30', status: 'PENDING', priority: 'HIGH', notes: 'Appliquer traitement prescrit par Dr. Moreau', duration: 20 },
];

const typeIcons: Record<string, string> = { FEEDING: '🍎', MEDICAL: '💊', CLEANING: '🧹', OBSERVATION: '🔭', TREATMENT: '💉' };
const typeColors: Record<string, string> = {
  FEEDING: 'border-l-green-500 bg-green-50 dark:bg-green-900/10',
  MEDICAL: 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
  CLEANING: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
  OBSERVATION: 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/10',
};
const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-800',
  NORMAL: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-gray-100 text-gray-600',
};
const statusColors: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  PENDING: 'bg-gray-100 text-gray-600',
};

export default function KiosquePage() {
  const [tasks, setTasks] = useState(mockTasks);
  const [activeTab, setActiveTab] = useState<'tasks' | 'scan' | 'alerts'>('tasks');
  const [scanResult, setScanResult] = useState<any>(null);
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const pending = tasks.filter(t => t.status === 'PENDING').length;

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'COMPLETED' } : t));
    setCompletingTask(null);
  };

  const startTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'IN_PROGRESS' } : t));
  };

  const simulateScan = () => {
    setScanResult({
      type: 'ANIMAL',
      name: 'Bleu',
      species: 'Ara ararauna',
      id: 'LFTG-2024-001',
      enclos: 'Volière A',
      lastFed: 'Aujourd\'hui 08:00',
      lastMedical: '15 Fév 2026',
      pendingTasks: 1,
      alerts: [],
      weight: '1.2 kg',
      age: '4 ans',
    });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      {/* Header Kiosque */}
      <div className="bg-forest-700 dark:bg-forest-800 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">🦜 Kiosque Soigneur</h1>
            <p className="text-forest-200 text-sm">Marie Dupont — Soigneuse principale</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-forest-200 text-sm">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
        </div>
        {/* Progression du jour */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-forest-600 rounded-full h-3">
            <div className="bg-white h-3 rounded-full transition-all" style={{ width: `${(completed / tasks.length) * 100}%` }} />
          </div>
          <span className="text-sm font-medium">{completed}/{tasks.length} tâches</span>
        </div>
        <div className="flex space-x-4 mt-3 text-sm">
          <span className="text-green-300">✅ {completed} terminées</span>
          <span className="text-blue-300">⚡ {inProgress} en cours</span>
          <span className="text-gray-300">⏳ {pending} à faire</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {[
          { id: 'tasks', label: '📋 Tâches', count: pending + inProgress },
          { id: 'scan', label: '📷 Scanner' },
          { id: 'alerts', label: '🚨 Alertes', count: 2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-forest-700 dark:text-forest-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count ? (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tâches Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`rounded-xl border-l-4 p-4 shadow-sm ${typeColors[task.type]} ${task.status === 'COMPLETED' ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{typeIcons[task.type]}</span>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-semibold text-sm ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {task.title}
                      </h3>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                        {task.priority === 'HIGH' ? '🔴 Urgent' : task.priority === 'NORMAL' ? '🟡 Normal' : '🟢 Bas'}
                      </span>
                    </div>
                    {task.animal && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        🦜 {task.animal} ({task.species}) — {task.enclos}
                      </div>
                    )}
                    {!task.animal && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">📍 {task.enclos}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">⏰ {task.time} · ⏱️ ~{task.duration} min</div>
                    {task.notes && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">📝 {task.notes}</div>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                  {task.status === 'COMPLETED' ? '✅ Fait' : task.status === 'IN_PROGRESS' ? '⚡ En cours' : '⏳ À faire'}
                </span>
              </div>

              {task.status !== 'COMPLETED' && (
                <div className="flex space-x-2 mt-3">
                  {task.status === 'PENDING' && (
                    <button
                      onClick={() => startTask(task.id)}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      ▶️ Commencer
                    </button>
                  )}
                  {task.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => completeTask(task.id)}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      ✅ Terminer
                    </button>
                  )}
                  <button className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    📝 Note
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Scanner Tab */}
      {activeTab === 'scan' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="w-48 h-48 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-2 border-forest-500 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-forest-600 rounded-tl" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-forest-600 rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-forest-600 rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-forest-600 rounded-br" />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">📷</div>
                </div>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Pointez la caméra vers le QR code de l'animal</p>
            <button
              onClick={simulateScan}
              className="w-full py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700 transition-colors"
            >
              📷 Simuler un scan
            </button>
          </div>

          {scanResult && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-forest-200 dark:border-forest-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-forest-100 dark:bg-forest-900/30 rounded-xl flex items-center justify-center text-2xl">🦜</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{scanResult.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">{scanResult.species}</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-400">ID</div>
                  <div className="font-mono text-sm text-forest-600">{scanResult.id}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Enclos', value: scanResult.enclos },
                  { label: 'Poids', value: scanResult.weight },
                  { label: 'Dernier repas', value: scanResult.lastFed },
                  { label: 'Dernier suivi médical', value: scanResult.lastMedical },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400">{item.label}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['🍎 Nourrir', '⚖️ Peser', '🔭 Observer', '💊 Note médicale'].map(action => (
                  <button key={action} className="py-2.5 bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400 rounded-lg text-sm font-medium hover:bg-forest-100 transition-colors">
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alertes Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {[
            { id: 'a1', type: 'MEDICAL', severity: 'HIGH', title: 'Vaccination due — Ara ararauna "Bleu"', desc: 'Rappel vaccinal prévu le 03/03/2026', icon: '💉', color: 'border-l-red-500 bg-red-50 dark:bg-red-900/10' },
            { id: 'a2', type: 'STOCK', severity: 'MEDIUM', title: 'Stock critique — Granulés perroquets', desc: 'Seuil minimum atteint (2 kg restants)', icon: '📦', color: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' },
          ].map(alert => (
            <div key={alert.id} className={`rounded-xl border-l-4 p-4 shadow-sm ${alert.color}`}>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{alert.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{alert.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.desc}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${alert.severity === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {alert.severity === 'HIGH' ? 'Urgent' : 'Attention'}
                </span>
              </div>
              <div className="flex space-x-2 mt-3">
                <button className="flex-1 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Voir détail
                </button>
                <button className="flex-1 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 transition-colors">
                  Traiter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
