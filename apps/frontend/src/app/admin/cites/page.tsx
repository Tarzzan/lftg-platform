'use client';
import { toast } from 'sonner';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-700' },
  EXPIRED: { label: 'Expiré', color: 'bg-red-100 text-red-700' },
  REVOKED: { label: 'Révoqué', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700' },
  SUSPENDED: { label: 'Suspendu', color: 'bg-orange-100 text-orange-700' },
  PENDING: { label: 'En attente', color: 'bg-blue-100 text-blue-700' },
};

const APPENDIX_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
  'I': { label: 'Annexe I', color: 'bg-red-100 text-red-700', desc: 'Commerce commercial interdit' },
  'II': { label: 'Annexe II', color: 'bg-orange-100 text-orange-700', desc: 'Permis requis' },
  'III': { label: 'Annexe III', color: 'bg-yellow-100 text-yellow-700', desc: 'Coopération internationale' },
};

export default function CitesPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'permits' | 'check' | 'compliance'>('permits');
  const [checkQuery, setCheckQuery] = useState('');
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ permitNumber: '', type: 'IMPORT', status: 'ACTIVE', issuedBy: '', issuedAt: '', expiresAt: '', species: '', quantity: 1, notes: '' });

  const { data: permits = [], isLoading , isError } = useQuery({
    queryKey: ['cites-permits', filterStatus],
    queryFn: () => api.get(`/cites/permits${filterStatus !== 'ALL' ? `?status=${filterStatus}` : ''}`).then(r => r.data),
  });

  const { data: compliance } = useQuery({
    queryKey: ['cites-compliance'],
    queryFn: () => api.get('/cites/compliance').then(r => r.data),
    enabled: activeTab === 'compliance',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/cites/permits', data).then(r => r.data),
    onSuccess: () => {
      toast.success('Opération réussie avec succès'); qc.invalidateQueries({ queryKey: ['cites-permits'] }); setShowModal(false); },
  });

  const checkSpecies = async () => {
    if (!checkQuery.trim()) return;
    setCheckLoading(true);
    try {
      const res = await api.get(`/cites/check/${encodeURIComponent(checkQuery.trim())}`);
      setCheckResult(res.data);
    } catch {
      setCheckResult({ appendix: 'NON_LISTE', isProtected: false, requiresPermit: false, restrictions: [], notes: 'Erreur lors de la vérification. Consultez checklist.cites.org', scientificName: checkQuery });
    } finally {
      setCheckLoading(false);
    }
  };

  const daysUntilExpiry = (date: string) => {
    if (!date) return 9999;
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filtered = permits.filter((p: any) => filterStatus === 'ALL' || p.status === filterStatus);
  const activePermits = permits.filter((p: any) => p.status === 'ACTIVE').length;
  const expiredPermits = permits.filter((p: any) => p.status === 'EXPIRED').length;
  const expiringSoon = permits.filter((p: any) => p.status === 'ACTIVE' && daysUntilExpiry(p.expiresAt) <= 30).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module CITES</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestion des permis et conformité réglementaire</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 transition-colors">
          + Nouveau permis
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Permis actifs', value: activePermits, color: 'text-green-600', icon: '' },
          { label: 'Permis expirés', value: expiredPermits, color: 'text-red-600', icon: '' },
          { label: 'Animaux Annexe I', value: compliance?.appendixI || 0, color: 'text-red-700', icon: '' },
          { label: 'Expirent < 30j', value: expiringSoon, color: 'text-orange-600', icon: '⏰' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border p-4">
            <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-border">
          {(['permits', 'check', 'compliance'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-forest-600 text-forest-600 bg-forest-50' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
              {tab === 'permits' ? 'Permis' : tab === 'check' ? 'Vérifier espèce' : 'Conformité'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Liste des permis */}
          {activeTab === 'permits' && (
            <div>
              <div className="flex gap-2 mb-4">
                {['ALL', 'ACTIVE', 'EXPIRED', 'PENDING', 'REVOKED'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-forest-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
                    {s === 'ALL' ? 'Tous' : STATUS_CONFIG[s]?.label || s}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-forest-600" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-3xl mb-2"></p>
                  <p>Aucun permis CITES enregistré.</p>
                  <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-forest-600 hover:underline">Créer le premier permis →</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((permit: any) => {
                    const days = daysUntilExpiry(permit.expiresAt);
                    const appendix = permit.animal?.species?.citesAppendix;
                    return (
                      <div key={permit.id} className="border border-gray-200 dark:border-border rounded-xl p-4 hover:border-forest-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl"></div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">{permit.animal?.name || 'Animal non lié'}</span>
                                {permit.animal?.identifier && <span className="text-xs font-mono text-gray-500">{permit.animal.identifier}</span>}
                                {appendix && APPENDIX_CONFIG[appendix] && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${APPENDIX_CONFIG[appendix].color}`}>
                                    {APPENDIX_CONFIG[appendix].label}
                                  </span>
                                )}
                              </div>
                              {permit.species && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"><em>{permit.species}</em></div>}
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                N° <strong>{permit.permitNumber}</strong>
                                {permit.issuedBy && ` · Délivré par ${permit.issuedBy}`}
                                {permit.type && ` · ${permit.type}`}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_CONFIG[permit.status]?.color || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                              {STATUS_CONFIG[permit.status]?.label || permit.status}
                            </span>
                            {permit.expiresAt && (
                              <div className="text-xs text-gray-400 mt-1">
                                {permit.issuedAt && `${new Date(permit.issuedAt).toLocaleDateString('fr-FR')} → `}
                                {new Date(permit.expiresAt).toLocaleDateString('fr-FR')}
                              </div>
                            )}
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
              )}
            </div>
          )}

          {/* Vérification espèce */}
          {activeTab === 'check' && (
            <div className="max-w-xl">
              <h3 className="font-semibold text-gray-900 dark:text-foreground mb-4">Vérifier le statut CITES d'une espèce</h3>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"value={checkQuery}
                  onChange={e => setCheckQuery(e.target.value)}
                  onKeyDown={e => e.key ==='Enter'&& checkSpecies()}
                  placeholder="Nom scientifique (ex: Amazona amazonica)"className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-forest-500 focus:border-transparent"/>
                <button onClick={checkSpecies} disabled={checkLoading} className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 disabled:opacity-50">
                  {checkLoading ?'...':'Vérifier'}
                </button>
              </div>

              <div className="mb-4 text-xs text-gray-500">
                Exemples : Amazona amazonica, Ara macao, Harpia harpyja, Iguana iguana
              </div>

              {checkResult && (
                <div className={`rounded-xl border-2 p-5 ${checkResult.appendix ==='I'?'border-red-300 bg-red-50': checkResult.appendix ==='II'?'border-orange-300 bg-orange-50':'border-gray-200 dark:border-border bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{checkResult.appendix ==='NON_LISTE'?'': checkResult.appendix ==='I'?'':''}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{checkResult.scientificName}</div>
                      <div className={`text-sm font-medium mt-0.5 ${checkResult.appendix ==='I'?'text-red-700': checkResult.appendix ==='II'?'text-orange-700':'text-green-700'}`}>
                        {checkResult.appendix ==='NON_LISTE'?'Non listé CITES': `CITES Annexe ${checkResult.appendix}`}
                      </div>
                    </div>
                  </div>

                  {checkResult.notes && (
                    <div className={`text-sm p-3 rounded-lg mb-3 ${checkResult.appendix ==='I'?'bg-red-100 text-red-800': checkResult.appendix ==='II'?'bg-orange-100 text-orange-800':'bg-green-100 text-green-800'}`}>
                      {checkResult.notes}
                    </div>
                  )}

                  {checkResult.restrictions?.length > 0 && (
                    <div>
                      <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Restrictions applicables :</div>
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
          {activeTab ==='compliance'&& (
            <div className="space-y-6">
              {compliance ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[
                      { label:'Animaux total', value: compliance.totalAnimals, icon:''},
                      { label:'Animaux protégés', value: compliance.protectedAnimals, icon:'️'},
                      { label:'Annexe I', value: compliance.appendixI, icon:''},
                      { label:'Annexe II', value: compliance.appendixII, icon:''},
                      { label:'Permis actifs', value: compliance.activePermits, icon:''},
                      { label:'Sans permis', value: compliance.missingPermits, icon:'️'},
                    ].map(stat => (<div key={stat.label} className="bg-gray-50 dark:bg-muted/20 rounded-xl p-4 text-center">
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {compliance.alerts?.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <h4 className="font-semibold text-red-800 mb-3">️ Alertes de conformité</h4>
                      <ul className="space-y-2">
                        {compliance.alerts.map((alert: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                            <span className="mt-0.5">•</span>
                            <span>{alert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {compliance.alerts?.length === 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h4 className="font-semibold text-green-800 mb-2"> Conformité CITES</h4>
                      <p className="text-sm text-green-700">Tous les animaux protégés disposent de permis CITES valides.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-forest-600"/>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal nouveau permis */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-card rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Nouveau permis CITES</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded-lg"></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Numéro de permis *</label>
                <input type="text"placeholder="FR-CITES-2026-XXX"value={form.permitNumber} onChange={e => setForm(f => ({ ...f, permitNumber: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-forest-500"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="IMPORT">IMPORT</option>
                    <option value="EXPORT">EXPORT</option>
                    <option value="RE_EXPORT">RE_EXPORT</option>
                    <option value="CAPTIVE_BRED">CAPTIVE_BRED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="EXPIRED">EXPIRED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Espèce</label>
                <input type="text"placeholder="Amazona amazonica"value={form.species} onChange={e => setForm(f => ({ ...f, species: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Délivré par</label>
                <input type="text"placeholder="DREAL Guyane"value={form.issuedBy} onChange={e => setForm(f => ({ ...f, issuedBy: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'émission</label>
                  <input type="date" value={form.issuedAt} onChange={e => setForm(f => ({ ...f, issuedAt: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'expiration</label>
                  <input type="date"value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"/>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:bg-gray-900">Annuler</button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.permitNumber || createMutation.isPending}
                className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700 disabled:opacity-50">
                {createMutation.isPending ?'Création...':'Créer le permis'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
