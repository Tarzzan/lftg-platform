'use client';
import { useState } from 'react';

const roles = [
  { name: 'admin', label: 'Administrateur', color: 'bg-red-100 text-red-800', users: 1 },
  { name: 'veterinaire', label: 'Vétérinaire', color: 'bg-purple-100 text-purple-800', users: 1 },
  { name: 'soigneur', label: 'Soigneur', color: 'bg-blue-100 text-blue-800', users: 2 },
  { name: 'visiteur', label: 'Visiteur', color: 'bg-gray-100 text-gray-800', users: 5 },
];

const permissions = [
  { resource: 'Animaux', actions: ['Lire', 'Créer', 'Modifier', 'Supprimer'], grants: { admin: [true, true, true, true], veterinaire: [true, false, true, false], soigneur: [true, false, true, false], visiteur: [true, false, false, false] } },
  { resource: 'Médical', actions: ['Lire', 'Créer', 'Modifier', 'Supprimer'], grants: { admin: [true, true, true, true], veterinaire: [true, true, true, false], soigneur: [true, false, false, false], visiteur: [false, false, false, false] } },
  { resource: 'Enclos', actions: ['Lire', 'Créer', 'Modifier', 'Supprimer'], grants: { admin: [true, true, true, true], veterinaire: [true, false, false, false], soigneur: [true, false, true, false], visiteur: [true, false, false, false] } },
  { resource: 'Utilisateurs', actions: ['Lire', 'Créer', 'Modifier', 'Supprimer'], grants: { admin: [true, true, true, true], veterinaire: [false, false, false, false], soigneur: [false, false, false, false], visiteur: [false, false, false, false] } },
  { resource: 'Rapports', actions: ['Lire', 'Créer', 'Modifier', 'Supprimer'], grants: { admin: [true, true, true, true], veterinaire: [true, true, false, false], soigneur: [true, false, false, false], visiteur: [false, false, false, false] } },
  { resource: 'Ventes', actions: ['Lire', 'Créer', 'Modifier', 'Supprimer'], grants: { admin: [true, true, true, true], veterinaire: [false, false, false, false], soigneur: [false, false, false, false], visiteur: [false, false, false, false] } },
];

const users = [
  { name: 'William MERI', email: 'admin@lftg.fr', role: 'admin' },
  { name: 'Dr. Sophie Blanc', email: 'veterinaire@lftg.fr', role: 'veterinaire' },
  { name: 'Marc Dubois', email: 'soigneur@lftg.fr', role: 'soigneur' },
  { name: 'Julie Martin', email: 'soigneur2@lftg.fr', role: 'soigneur' },
];

export default function RbacPage() {
  const [tab, setTab] = useState<'matrix' | 'users' | 'roles'>('matrix');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contrôle d'accès RBAC</h1>
          <p className="text-gray-500 mt-1">Gestion des rôles et permissions granulaires</p>
        </div>
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">nestjs-rbac v2026</span>
      </div>

      {/* Rôles */}
      <div className="grid grid-cols-4 gap-4">
        {roles.map((r) => (
          <div key={r.name} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.color}`}>{r.label}</span>
            <p className="text-2xl font-bold mt-2 text-gray-900">{r.users}</p>
            <p className="text-xs text-gray-500">utilisateur{r.users > 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['matrix', 'users', 'roles'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium ${tab === t ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'matrix' ? 'Matrice des permissions' : t === 'users' ? 'Utilisateurs' : 'Rôles'}
            </button>
          ))}
        </div>

        {tab === 'matrix' && (
          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2 pr-4 text-gray-600 font-medium">Ressource / Action</th>
                  {roles.map((r) => (
                    <th key={r.name} className="py-2 px-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.color}`}>{r.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {permissions.map((p) => (
                  p.actions.map((action, ai) => (
                    <tr key={`${p.resource}-${action}`} className="hover:bg-gray-50">
                      <td className="py-2 pr-4 text-gray-700">
                        {ai === 0 && <span className="font-semibold text-gray-900">{p.resource} — </span>}
                        {action}
                      </td>
                      {roles.map((r) => (
                        <td key={r.name} className="py-2 px-3 text-center">
                          {(p.grants as any)[r.name][ai] ? (
                            <span className="text-green-600 text-lg">✓</span>
                          ) : (
                            <span className="text-gray-300 text-lg">✗</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Utilisateur', 'Email', 'Rôle', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const role = roles.find((r) => r.name === u.role);
                  return (
                    <tr key={u.email} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${role?.color}`}>{role?.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-xs text-blue-600 hover:underline">Modifier le rôle</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'roles' && (
          <div className="p-6 grid grid-cols-2 gap-4">
            {roles.map((r) => (
              <div key={r.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.color}`}>{r.label}</span>
                  <button className="text-xs text-blue-600 hover:underline">Modifier</button>
                </div>
                <p className="text-xs text-gray-500 font-mono">Rôle : {r.name}</p>
                <p className="text-xs text-gray-500 mt-1">{r.users} utilisateur{r.users > 1 ? 's' : ''} assigné{r.users > 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
