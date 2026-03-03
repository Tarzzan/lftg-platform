'use client';
import { useState } from 'react';

const EMPLOYEES = [
  { id: 'emp-001', matricule: 'LFTG-001', nom: 'William MERI', poste: 'Directeur de la ferme', departement: 'Direction', typeContrat: 'CDI', dateEmbauche: '01/03/2018', congesRestants: 17, heuresSup: 12, statut: 'Actif', avatar: '👨‍💼' },
  { id: 'emp-002', matricule: 'LFTG-002', nom: 'Marie Dupont', poste: 'Soigneur principal', departement: 'Soins', typeContrat: 'CDI', dateEmbauche: '15/06/2020', congesRestants: 13, heuresSup: 8, statut: 'Actif', avatar: '👩‍🔬' },
  { id: 'emp-003', matricule: 'LFTG-003', nom: 'Dr. Rousseau', poste: 'Vétérinaire', departement: 'Médical', typeContrat: 'CDI', dateEmbauche: '10/01/2021', congesRestants: 20, heuresSup: 0, statut: 'Actif', avatar: '👨‍⚕️' },
  { id: 'emp-004', matricule: 'LFTG-004', nom: 'Jean Martin', poste: 'Gestionnaire stock', departement: 'Logistique', typeContrat: 'CDI', dateEmbauche: '01/03/2022', congesRestants: 10, heuresSup: 3, statut: 'Actif', avatar: '📦' },
  { id: 'emp-005', matricule: 'LFTG-005', nom: 'Sophie Bernard', poste: 'Soigneur', departement: 'Soins', typeContrat: 'CDD', dateEmbauche: '01/09/2023', congesRestants: 22, heuresSup: 0, statut: 'Formation', avatar: '👩‍🎓' },
];

const DEPT_COLORS: Record<string, string> = {
  Direction: 'bg-purple-100 text-purple-800',
  Soins: 'bg-green-100 text-green-800',
  Médical: 'bg-blue-100 text-blue-800',
  Logistique: 'bg-orange-100 text-orange-800',
};

const CONTRACT_COLORS: Record<string, string> = {
  CDI: 'bg-emerald-100 text-emerald-800',
  CDD: 'bg-yellow-100 text-yellow-800',
  STAGE: 'bg-gray-100 text-gray-800',
};

export default function EmployesPage() {
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterContrat, setFilterContrat] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = EMPLOYEES.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.nom.toLowerCase().includes(q) || e.poste.toLowerCase().includes(q) || e.matricule.toLowerCase().includes(q);
    const matchDept = !filterDept || e.departement === filterDept;
    const matchContrat = !filterContrat || e.typeContrat === filterContrat;
    return matchSearch && matchDept && matchContrat;
  });

  const depts = [...new Set(EMPLOYEES.map(e => e.departement))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
          <p className="text-sm text-gray-500 mt-1">{EMPLOYEES.length} membres du personnel actifs</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors text-sm font-medium"
        >
          <span>+</span> Nouvel employé
        </button>
      </div>

      {/* KPIs RH */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Effectif total', value: '5', icon: '👥', color: 'text-forest-600' },
          { label: 'Taux de présence', value: '94.5%', icon: '✅', color: 'text-emerald-600' },
          { label: 'Heures sup. totales', value: '23h', icon: '⏰', color: 'text-orange-600' },
          { label: 'Congés en attente', value: '2', icon: '📅', color: 'text-yellow-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{kpi.icon}</span>
              <div>
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                <div className="text-xs text-gray-500">{kpi.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="">Tous les départements</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={filterContrat}
            onChange={e => setFilterContrat(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="">Tous les contrats</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="STAGE">Stage</option>
          </select>
        </div>
      </div>

      {/* Liste des employés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <div key={emp.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                {emp.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 truncate">{emp.nom}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONTRACT_COLORS[emp.typeContrat]}`}>
                    {emp.typeContrat}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{emp.poste}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DEPT_COLORS[emp.departement]}`}>
                    {emp.departement}
                  </span>
                  <span className="text-xs text-gray-400">{emp.matricule}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-bold text-forest-600">{emp.congesRestants}j</div>
                <div className="text-xs text-gray-400">Congés restants</div>
              </div>
              <div>
                <div className="text-sm font-bold text-orange-600">{emp.heuresSup}h</div>
                <div className="text-xs text-gray-400">Heures sup.</div>
              </div>
              <div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${emp.statut === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {emp.statut}
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <a
                href={`/admin/personnel/employes/${emp.id}`}
                className="flex-1 text-center px-3 py-1.5 bg-forest-50 text-forest-700 rounded-lg text-xs font-medium hover:bg-forest-100 transition-colors"
              >
                Voir la fiche
              </a>
              <button className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                Planning
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Répartition par département */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Répartition par département</h2>
        <div className="space-y-3">
          {depts.map(dept => {
            const count = EMPLOYEES.filter(e => e.departement === dept).length;
            const pct = Math.round((count / EMPLOYEES.length) * 100);
            return (
              <div key={dept} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-600">{dept}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-forest-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-16 text-right text-sm text-gray-500">{count} ({pct}%)</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal création employé */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Nouvel employé</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Prénom" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Nom" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Poste</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Intitulé du poste" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Département</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>Direction</option>
                    <option>Soins</option>
                    <option>Médical</option>
                    <option>Logistique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type de contrat</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>CDI</option>
                    <option>CDD</option>
                    <option>STAGE</option>
                    <option>ALTERNANCE</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date d'embauche</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                Annuler
              </button>
              <button className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700">
                Créer l'employé
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
