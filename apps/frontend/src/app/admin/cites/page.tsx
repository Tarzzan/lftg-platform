'use client';

import { useState } from 'react';

interface CitesPermit {
  id: string;
  permitNumber: string;
  animal: { name: string; identifier: string; species: string; scientificName: string };
  permitType: string;
  purpose: string;
  validFrom: string;
  validUntil: string;
  issuedBy: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED';
  appendix: 'I' | 'II' | 'III';
}

const MOCK_PERMITS: CitesPermit[] = [
  { id: '1', permitNumber: 'FR-CITES-2025-001', animal: { name: 'Amazona', identifier: 'E-01', species: 'Amazone à front bleu', scientificName: 'Amazona amazonica' }, permitType: 'CAPTIVE_BRED', purpose: 'COMMERCIAL', validFrom: '2025-01-15', validUntil: '2027-01-14', issuedBy: 'DREAL Guyane', status: 'ACTIVE', appendix: 'II' },
  { id: '2', permitNumber: 'FR-CITES-2025-002', animal: { name: 'Ara Bleu', identifier: 'E-03', species: 'Ara ararauna', scientificName: 'Ara ararauna' }, permitType: 'CAPTIVE_BRED', purpose: 'ZOO', validFrom: '2025-03-01', validUntil: '2026-03-15', issuedBy: 'DREAL Guyane', status: 'ACTIVE', appendix: 'II' },
  { id: '3', permitNumber: 'FR-CITES-2024-008', animal: { name: 'Harpy', identifier: 'E-04', species: 'Harpie féroce', scientificName: 'Harpia harpyja' }, permitType: 'CAPTIVE_BRED', purpose: 'SCIENTIFIC', validFrom: '2024-06-01', validUntil: '2026-05-31', issuedBy: 'Ministère Écologie', status: 'ACTIVE', appendix: 'I' },
  { id: '4', permitNumber: 'FR-CITES-2023-015', animal: { name: 'Caïman #3', identifier: 'R-03', species: 'Caïman à lunettes', scientificName: 'Caiman crocodilus' }, permitType: 'EXPORT', purpose: 'COMMERCIAL', validFrom: '2023-09-01', validUntil: '2025-08-31', issuedBy: 'DREAL Guyane', status: 'EXPIRED', appendix: 'II' },
  { id: '5', permitNumber: 'FR-CITES-2025-009', animal: { name: 'Dendro', identifier: 'A-02', species: 'Dendrobate azureus', scientificName: 'Dendrobates azureus' }, permitType: 'CAPTIVE_BRED', purpose: 'COMMERCIAL', validFrom: '2025-07-01', validUntil: '2026-04-15', issuedBy: 'DREAL Guyane', status: 'ACTIVE', appendix: 'II' },
];

const STATUS_CONFIG = {
  ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-700' },
  EXPIRED: { label: 'Expiré', color: 'bg-red-100 text-red-700' },
  REVOKED: { label: 'Révoqué', color: 'bg-gray-100 text-gray-700' },
  SUSPENDED: { label: 'Suspendu', color: 'bg-orange-100 text-orange-700' },
};

const APPENDIX_CONFIG = {
  'I': { label: 'Annexe I', color: 'bg-red-100 text-red-700', desc: 'Commerce commercial interdit' },
  'II': { label: 'Annexe II', color: 'bg-orange-100 text-orange-700', desc: 'Permis requis' },
  'III': { label: 'Annexe III', color: 'bg-yellow-100 text-yellow-700', desc: 'Coopération internationale' },
};

export default function CitesPage() {
  const [activeTab, setActiveTab] = useState<'permits' | 'check' | 'compliance'>('permits');
  const [checkQuery, setCheckQuery] = useState('');
  const [checkResult, setCheckResult] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showModal, setShowModal] = useState(false);

  const filtered = MOCK_PERMITS.filter(p => filterStatus === 'ALL' || p.status === filterStatus);
  const activePermits = MOCK_PERMITS.filter(p => p.status === 'ACTIVE').length;
  const expiredPermits = MOCK_PERMITS.filter(p => p.status === 'EXPIRED').length;
  const appendixI = MOCK_PERMITS.filter(p => p.appendix === 'I').length;

  // Simulation vérification CITES
  const checkSpecies = () => {
    if (!checkQuery.trim()) return;
    const mockResults: Record<string, any> = {
      'amazona': { appendix: 'II', isProtected: true, requiresPermit: true, restrictions: ['Permis CITES requis', 'Baguage obligatoire'], notes: 'Espèce Annexe II — commerce réglementé' },
      'ara macao': { appendix: 'I', isProtected: true, requiresPermit: true, restrictions: ['Commerce commercial interdit', 'Permis scientifique requis'], notes: 'ATTENTION: Espèce Annexe I — protection maximale' },
      'harpia': { appendix: 'I', isProtected: true, requiresPermit: true, restrictions: ['Protection maximale', 'Commerce commercial strictement interdit'], notes: 'Espèce en danger critique' },
      'iguana': { appendix: 'II', isProtected: true, requiresPermit: true, restrictions: ['Permis CITES requis', 'Quota selon pays d\'origine'], notes: 'Espèce Annexe II' },
    };

    const key = Object.keys(mockResults).find(k => checkQuery.toLowerCase().includes(k));
    setCheckResult(key ? { ...mockResults[key], scientificName: checkQuery } : {
      appendix: 'NON_LISTE', isProtected: false, requiresPermit: false,
      restrictions: [], notes: 'Espèce non trouvée dans la base CITES. Vérifier sur checklist.cites.org',
      scientificName: checkQuery,
    });
  };

  const daysUntilExpiry = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📜 Module CITES</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion des permis et conformité réglementaire</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 transition-colors">
          + Nouveau permis
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Permis actifs', value: activePermits, color: 'text-green-600', icon: '✓' },
          { label: 'Permis expirés', value: expiredPermits, color: 'text-red-600', icon: '⚠' },
          { label: 'Animaux Annexe I', value: appendixI, color: 'text-red-700', icon: '🔴' },
          { label: 'Expirent < 30j', value: MOCK_PERMITS.filter(p => p.status === 'ACTIVE' && daysUntilExpiry(p.validUntil) <= 30).length, color: 'text-orange-600', icon: '⏰' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['permits', 'check', 'compliance'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-forest-600 text-forest-600 bg-forest-50' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab === 'permits' ? '📋 Permis' : tab === 'check' ? '🔍 Vérifier espèce' : '📊 Conformité'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Liste des permis */}
          {activeTab === 'permits' && (
            <div>
              <div className="flex gap-2 mb-4">
                {['ALL', 'ACTIVE', 'EXPIRED', 'REVOKED'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s === 'ALL' ? 'Tous' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label || s}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {filtered.map(permit => {
                  const days = daysUntilExpiry(permit.validUntil);
                  return (
                    <div key={permit.id} className="border border-gray-200 rounded-xl p-4 hover:border-forest-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">🦜</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{permit.animal.name}</span>
                              <span className="text-xs font-mono text-gray-500">{permit.animal.identifier}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${APPENDIX_CONFIG[permit.appendix].color}`}>
                                {APPENDIX_CONFIG[permit.appendix].label}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              <em>{permit.animal.scientificName}</em> · {permit.animal.species}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              N° <strong>{permit.permitNumber}</strong> · Délivré par {permit.issuedBy}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_CONFIG[permit.status].color}`}>
                            {STATUS_CONFIG[permit.status].label}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(permit.validFrom).toLocaleDateString('fr-FR')} → {new Date(permit.validUntil).toLocaleDateString('fr-FR')}
                          </div>
                          {permit.status === 'ACTIVE' && days <= 60 && (
                            <div className={`text-xs font-medium mt-1 ${days <= 30 ? 'text-red-600' : 'text-orange-600'}`}>
                              ⏰ Expire dans {days} jours
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vérification espèce */}
          {activeTab === 'check' && (
            <div className="max-w-xl">
              <h3 className="font-semibold text-gray-900 mb-4">Vérifier le statut CITES d'une espèce</h3>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={checkQuery}
                  onChange={e => setCheckQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && checkSpecies()}
                  placeholder="Nom scientifique (ex: Amazona amazonica)"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                />
                <button onClick={checkSpecies} className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700">
                  Vérifier
                </button>
              </div>

              <div className="mb-4 text-xs text-gray-500">
                Exemples : amazona, ara macao, harpia, iguana
              </div>

              {checkResult && (
                <div className={`rounded-xl border-2 p-5 ${checkResult.appendix === 'I' ? 'border-red-300 bg-red-50' : checkResult.appendix === 'II' ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{checkResult.appendix === 'NON_LISTE' ? '✅' : checkResult.appendix === 'I' ? '🔴' : '🟡'}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{checkResult.scientificName}</div>
                      <div className={`text-sm font-medium mt-0.5 ${checkResult.appendix === 'I' ? 'text-red-700' : checkResult.appendix === 'II' ? 'text-orange-700' : 'text-green-700'}`}>
                        {checkResult.appendix === 'NON_LISTE' ? 'Non listé CITES' : `CITES Annexe ${checkResult.appendix}`}
                      </div>
                    </div>
                  </div>

                  {checkResult.notes && (
                    <div className={`text-sm p-3 rounded-lg mb-3 ${checkResult.appendix === 'I' ? 'bg-red-100 text-red-800' : checkResult.appendix === 'II' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                      {checkResult.notes}
                    </div>
                  )}

                  {checkResult.restrictions?.length > 0 && (
                    <div>
                      <div className="font-medium text-sm text-gray-700 mb-2">Restrictions applicables :</div>
                      <ul className="space-y-1">
                        {checkResult.restrictions.map((r: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-orange-500 mt-0.5">•</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rapport de conformité */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Animaux total', value: 247, icon: '🦜' },
                  { label: 'Animaux protégés', value: 89, icon: '🛡️' },
                  { label: 'Annexe I', value: appendixI, icon: '🔴' },
                  { label: 'Annexe II', value: 82, icon: '🟡' },
                  { label: 'Permis actifs', value: activePermits, icon: '✓' },
                  { label: 'Sans permis', value: 12, icon: '⚠️' },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-800 mb-3">⚠️ Alertes de conformité</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-red-700">
                    <span className="mt-0.5">•</span>
                    <span>1 permis CITES expiré — Caïman #3 (FR-CITES-2023-015) — Renouvellement requis</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-red-700">
                    <span className="mt-0.5">•</span>
                    <span>12 animaux protégés sans permis CITES actif — Vérification recommandée</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-orange-700">
                    <span className="mt-0.5">•</span>
                    <span>3 animaux Annexe I — Conformité à vérifier trimestriellement</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-semibold text-green-800 mb-2">✅ Points de conformité</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Tous les animaux Annexe I disposent d'un certificat d'élevage captif</li>
                  <li>• Registre des entrées/sorties à jour</li>
                  <li>• Baguage conforme pour 95% des oiseaux protégés</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal nouveau permis */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Nouveau permis CITES</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de permis</label>
                <input type="text" placeholder="FR-CITES-2026-XXX" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de permis</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500">
                    <option>CAPTIVE_BRED</option>
                    <option>EXPORT</option>
                    <option>IMPORT</option>
                    <option>RE_EXPORT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Finalité</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500">
                    <option>COMMERCIAL</option>
                    <option>SCIENTIFIC</option>
                    <option>ZOO</option>
                    <option>BREEDING</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valide du</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valide jusqu'au</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Délivré par</label>
                <input type="text" placeholder="DREAL Guyane" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500" />
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700">Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
