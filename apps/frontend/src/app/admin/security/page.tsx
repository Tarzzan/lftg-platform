'use client';
import { useState } from 'react';

const sessions = [
  { user: 'admin@lftg.fr', ip: '192.168.1.10', device: 'Chrome / macOS', createdAt: '2026-03-01 09:00', expiresAt: '2026-03-01 09:15', status: 'active' },
  { user: 'soigneur@lftg.fr', ip: '192.168.1.22', device: 'Firefox / Windows', createdAt: '2026-03-01 08:30', expiresAt: '2026-03-01 08:45', status: 'expired' },
  { user: 'veterinaire@lftg.fr', ip: '10.0.0.5', device: 'Safari / iOS', createdAt: '2026-03-01 10:15', expiresAt: '2026-03-01 10:30', status: 'active' },
];

const auditLogs = [
  { time: '12:05:32', user: 'admin@lftg.fr', action: 'LOGIN', ip: '192.168.1.10', status: 'success' },
  { time: '11:58:14', user: 'soigneur@lftg.fr', action: 'TOKEN_REFRESH', ip: '192.168.1.22', status: 'success' },
  { time: '11:45:07', user: 'unknown@test.com', action: 'LOGIN', ip: '45.33.32.156', status: 'failed' },
  { time: '11:30:22', user: 'veterinaire@lftg.fr', action: '2FA_VERIFY', ip: '10.0.0.5', status: 'success' },
  { time: '10:15:00', user: 'admin@lftg.fr', action: 'LOGOUT', ip: '192.168.1.10', status: 'success' },
];

export default function SecurityPage() {
  const [tab, setTab] = useState<'sessions' | '2fa' | 'audit'>('sessions');
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sécurité & Authentification</h1>
          <p className="text-gray-500 mt-1">JWT refresh tokens, 2FA TOTP, blacklist Redis</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">JWT v13.0.0</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">TOTP 2FA</span>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Sessions actives', value: '2', color: 'text-green-600' },
          { label: 'Tokens blacklistés', value: '14', color: 'text-red-600' },
          { label: 'Tentatives échouées (24h)', value: '3', color: 'text-orange-600' },
          { label: 'Utilisateurs 2FA', value: '3/5', color: 'text-blue-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">{m.label}</p>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Configuration JWT */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration JWT</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Access Token TTL', value: '15 minutes' },
            { label: 'Refresh Token TTL', value: '7 jours' },
            { label: 'Algorithme', value: 'HS256' },
            { label: 'Blacklist Redis', value: 'Activée' },
            { label: 'Rotation refresh tokens', value: 'Activée' },
            { label: 'Cookie HttpOnly', value: 'Activé' },
          ].map((c) => (
            <div key={c.label} className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">{c.label}</span>
              <span className="text-sm font-medium text-gray-900">{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['sessions', '2fa', 'audit'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium ${tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'sessions' ? 'Sessions actives' : t === '2fa' ? 'Configuration 2FA' : 'Journal d\'audit'}
            </button>
          ))}
        </div>

        {tab === 'sessions' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Utilisateur', 'IP', 'Appareil', 'Créé le', 'Expire le', 'Statut', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.user}</td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">{s.ip}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.device}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.createdAt}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.expiresAt}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.status === 'active' && (
                        <button className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">Révoquer</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === '2fa' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div>
                <p className="font-semibold text-blue-900">Authentification à deux facteurs (TOTP)</p>
                <p className="text-sm text-blue-700 mt-1">Sécurisez votre compte avec une application d'authentification (Google Authenticator, Authy)</p>
              </div>
              <button
                onClick={() => setTwoFaEnabled(!twoFaEnabled)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${twoFaEnabled ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}
              >
                {twoFaEnabled ? 'Désactiver 2FA' : 'Activer 2FA'}
              </button>
            </div>

            {twoFaEnabled && (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-4">Scannez ce QR code avec votre application d'authentification</p>
                <div className="w-40 h-40 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-gray-400 text-sm">QR Code 2FA</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">otpauth://totp/LFTG:admin@lftg.fr?secret=BASE32SECRET</p>
              </div>
            )}
          </div>
        )}

        {tab === 'audit' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  {['Heure', 'Utilisateur', 'Action', 'IP', 'Résultat'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">{log.time}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{log.user}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-500">{log.ip}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
