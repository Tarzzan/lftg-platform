'use client';
import { useState } from 'react';

const EMPLOYEE = {
  id: 'emp-002',
  matricule: 'LFTG-002',
  nom: 'Marie Dupont',
  poste: 'Soigneur principal',
  departement: 'Soins',
  typeContrat: 'CDI',
  dateEmbauche: '15/06/2020',
  telephone: '+594 694 234 567',
  email: 'marie.dupont@lftg.fr',
  adresse: '12 rue des Palmiers, Cayenne, 97300',
  situationFamiliale: 'Mariée',
  nombreEnfants: 1,
  salaireBase: 2800,
  congesAnnuels: 25,
  congesPris: 12,
  congesRestants: 13,
  heuresSup: 8,
  competences: ['Soins reptiles', 'Soins oiseaux', 'Premiers secours animaux', 'Alimentation spécialisée', 'Gestion des couvées'],
  certifications: ['Certificat de capacité (2020)', 'Formation premiers secours (2022)', 'Herpétologie avancée (2026)'],
  responsable: 'William MERI',
  avatar: '👩‍🔬',
};

const TABS = ['Fiche personnelle', 'Compétences', 'Congés & Absences', 'Planning', 'Documents'];

const CONGES = [
  { type: 'Congés payés', dateDebut: '07/04/2026', dateFin: '18/04/2026', jours: 10, statut: 'Approuvé' },
  { type: 'RTT', dateDebut: '20/12/2025', dateFin: '20/12/2025', jours: 1, statut: 'Approuvé' },
  { type: 'Maladie', dateDebut: '03/11/2025', dateFin: '04/11/2025', jours: 2, statut: 'Approuvé' },
];

const PLANNING = [
  { date: '01/03/2026', heures: '07:00 – 15:00', type: 'Matin', zone: 'Volière A + B', statut: 'Confirmé' },
  { date: '03/03/2026', heures: '07:00 – 15:00', type: 'Weekend', zone: 'Toutes zones', statut: 'Planifié' },
  { date: '05/03/2026', heures: '07:00 – 15:00', type: 'Matin', zone: 'Reptilarium', statut: 'Confirmé' },
  { date: '08/03/2026', heures: '07:00 – 15:00', type: 'Matin', zone: 'Volière A + B', statut: 'Planifié' },
];

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState(0);

  const statutColor = (s: string) => ({
    Approuvé: 'bg-green-100 text-green-700',
    Confirmé: 'bg-green-100 text-green-700',
    Planifié: 'bg-blue-100 text-blue-700',
    Refusé: 'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-700');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <a href="/admin/personnel/employes" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</a>
      </div>

      {/* Carte employé */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-forest-100 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
            {EMPLOYEE.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{EMPLOYEE.nom}</h1>
                <p className="text-gray-500 mt-0.5">{EMPLOYEE.poste} — {EMPLOYEE.departement}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">{EMPLOYEE.typeContrat}</span>
                  <span className="text-xs text-gray-400">{EMPLOYEE.matricule}</span>
                  <span className="text-xs text-gray-400">Depuis le {EMPLOYEE.dateEmbauche}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Modifier
                </button>
                <button className="px-4 py-2 bg-forest-600 text-white rounded-lg text-sm font-medium hover:bg-forest-700">
                  Demande de congé
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          {[
            { label: 'Congés restants', value: `${EMPLOYEE.congesRestants}j`, color: 'text-forest-600' },
            { label: 'Congés pris', value: `${EMPLOYEE.congesPris}j`, color: 'text-gray-600' },
            { label: 'Heures sup.', value: `${EMPLOYEE.heuresSup}h`, color: 'text-orange-600' },
            { label: 'Responsable', value: EMPLOYEE.responsable, color: 'text-purple-600' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === i
                  ? 'text-forest-700 border-b-2 border-forest-600 bg-forest-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Fiche personnelle */}
          {activeTab === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Informations personnelles</h3>
                {[
                  { label: 'Téléphone', value: EMPLOYEE.telephone },
                  { label: 'Email professionnel', value: EMPLOYEE.email },
                  { label: 'Adresse', value: EMPLOYEE.adresse },
                  { label: 'Situation familiale', value: EMPLOYEE.situationFamiliale },
                  { label: 'Nombre d\'enfants', value: String(EMPLOYEE.nombreEnfants) },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Informations contractuelles</h3>
                {[
                  { label: 'Type de contrat', value: EMPLOYEE.typeContrat },
                  { label: 'Date d\'embauche', value: EMPLOYEE.dateEmbauche },
                  { label: 'Département', value: EMPLOYEE.departement },
                  { label: 'Responsable', value: EMPLOYEE.responsable },
                  { label: 'Salaire de base', value: `${EMPLOYEE.salaireBase.toLocaleString('fr-FR')} €/mois` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compétences */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Compétences</h3>
                <div className="flex flex-wrap gap-2">
                  {EMPLOYEE.competences.map(c => (
                    <span key={c} className="px-3 py-1.5 bg-forest-50 text-forest-700 rounded-full text-sm font-medium border border-forest-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
                <div className="space-y-2">
                  {EMPLOYEE.certifications.map(cert => (
                    <div key={cert} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-blue-500">🎓</span>
                      <span className="text-sm font-medium text-blue-800">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Congés */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <div className="text-2xl font-bold text-green-700">{EMPLOYEE.congesRestants}j</div>
                  <div className="text-xs text-green-600 mt-1">Congés restants</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <div className="text-2xl font-bold text-gray-700">{EMPLOYEE.congesPris}j</div>
                  <div className="text-xs text-gray-500 mt-1">Congés pris</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <div className="text-2xl font-bold text-blue-700">{EMPLOYEE.congesAnnuels}j</div>
                  <div className="text-xs text-blue-600 mt-1">Droit annuel</div>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-forest-500 to-forest-400 rounded-full"
                  style={{ width: `${(EMPLOYEE.congesPris / EMPLOYEE.congesAnnuels) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center">{EMPLOYEE.congesPris} jours pris sur {EMPLOYEE.congesAnnuels}</p>

              <h3 className="font-semibold text-gray-900 mt-4">Historique des congés</h3>
              <div className="space-y-2">
                {CONGES.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{c.type}</div>
                      <div className="text-xs text-gray-500">{c.dateDebut} → {c.dateFin} ({c.jours}j)</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statutColor(c.statut)}`}>{c.statut}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Planning */}
          {activeTab === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Planning Mars 2026</h3>
                <button className="text-sm text-forest-600 hover:text-forest-700 font-medium">+ Ajouter un créneau</button>
              </div>
              {PLANNING.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-16 text-center">
                    <div className="text-sm font-bold text-gray-900">{p.date.split('/')[0]}</div>
                    <div className="text-xs text-gray-400">{['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][parseInt(p.date.split('/')[1])-1]}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{p.heures}</div>
                    <div className="text-xs text-gray-500">{p.zone}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.type === 'Weekend' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {p.type}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statutColor(p.statut)}`}>{p.statut}</span>
                </div>
              ))}
            </div>
          )}

          {/* Documents */}
          {activeTab === 4 && (
            <div className="space-y-3">
              {[
                { nom: 'Contrat de travail CDI', date: '15/06/2020', type: 'Contrat', taille: '245 Ko' },
                { nom: 'Certificat de capacité', date: '01/03/2020', type: 'Certification', taille: '180 Ko' },
                { nom: 'Attestation formation premiers secours', date: '12/09/2022', type: 'Formation', taille: '95 Ko' },
                { nom: 'Avenant salaire 2024', date: '01/01/2024', type: 'Contrat', taille: '120 Ko' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{doc.nom}</div>
                      <div className="text-xs text-gray-400">{doc.date} · {doc.taille}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{doc.type}</span>
                    <button className="text-xs text-forest-600 hover:text-forest-700 font-medium">Télécharger</button>
                  </div>
                </div>
              ))}
              <button className="w-full mt-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-forest-300 hover:text-forest-600 transition-colors">
                + Ajouter un document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
