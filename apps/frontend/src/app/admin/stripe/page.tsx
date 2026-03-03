'use client';

import { useState } from 'react';

const STRIPE_STATS = {
  balance: 12450.80,
  pending: 3200.00,
  monthRevenue: 41250.00,
  transactions: 127,
  refunds: 3,
  disputes: 0,
};

const TRANSACTIONS = [
  { id: 'pi_1234', date: '01 Mar 2026', desc: 'Vente Ara ararauna × 2', amount: 4800, status: 'succeeded', method: 'Visa •••• 4242', customer: 'Jean Dupont' },
  { id: 'pi_1235', date: '28 Fév 2026', desc: 'Visite guidée × 4', amount: 140, status: 'succeeded', method: 'Mastercard •••• 5555', customer: 'Marie Martin' },
  { id: 'pi_1236', date: '27 Fév 2026', desc: 'Dendrobate azuré × 6', amount: 1200, status: 'succeeded', method: 'Visa •••• 1234', customer: 'Pierre Leblanc' },
  { id: 'pi_1237', date: '26 Fév 2026', desc: 'Formation CITES', amount: 350, status: 'succeeded', method: 'CB •••• 9876', customer: 'Sophie Durand' },
  { id: 'pi_1238', date: '25 Fév 2026', desc: 'Boa constrictor × 1', amount: 2500, status: 'refunded', method: 'Visa •••• 7777', customer: 'Luc Bernard' },
];

const PRODUCTS = [
  { id: 'prod_1', name: 'Ara ararauna', price: 2400, category: 'Animal', active: true, sales: 12 },
  { id: 'prod_2', name: 'Amazone à front bleu', price: 1800, category: 'Animal', active: true, sales: 8 },
  { id: 'prod_3', name: 'Dendrobate azuré', price: 200, category: 'Animal', active: true, sales: 24 },
  { id: 'prod_4', name: 'Visite Découverte', price: 25, category: 'Visite', active: true, sales: 156 },
  { id: 'prod_5', name: 'Visite Nocturne', price: 35, category: 'Visite', active: true, sales: 48 },
  { id: 'prod_6', name: 'Formation CITES', price: 350, category: 'Formation', active: true, sales: 18 },
];

export default function StripePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'products' | 'payouts'>('overview');
  const [showWebhookModal, setShowWebhookModal] = useState(false);

  const statusColors: Record<string, string> = {
    succeeded: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    refunded: 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-3xl">💳</span> Stripe Paiements
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestion des paiements en ligne et transactions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowWebhookModal(true)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ⚙️ Webhooks
          </button>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Dashboard Stripe →
          </a>
        </div>
      </div>

      {/* Mode test badge */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-4 flex items-center gap-3">
        <span className="text-yellow-600 text-xl">⚠️</span>
        <div>
          <span className="font-medium text-yellow-800 dark:text-yellow-300">Mode Test Stripe activé</span>
          <p className="text-yellow-700 dark:text-yellow-400 text-sm">Utilisez la carte test 4242 4242 4242 4242 pour les paiements. Aucune transaction réelle n'est effectuée.</p>
        </div>
        <button className="ml-auto px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors">
          Passer en production
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Solde disponible', value: `${STRIPE_STATS.balance.toLocaleString('fr-FR')} €`, icon: '💰', color: 'text-green-600' },
          { label: 'En attente', value: `${STRIPE_STATS.pending.toLocaleString('fr-FR')} €`, icon: '⏳', color: 'text-yellow-600' },
          { label: 'CA ce mois', value: `${STRIPE_STATS.monthRevenue.toLocaleString('fr-FR')} €`, icon: '📈', color: 'text-blue-600' },
          { label: 'Transactions', value: STRIPE_STATS.transactions.toString(), icon: '🔄', color: 'text-purple-600' },
          { label: 'Remboursements', value: STRIPE_STATS.refunds.toString(), icon: '↩️', color: 'text-orange-600' },
          { label: 'Litiges', value: STRIPE_STATS.disputes.toString(), icon: '⚖️', color: 'text-red-600' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {(['overview', 'transactions', 'products', 'payouts'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab === 'overview' ? '📊 Vue d\'ensemble' : tab === 'transactions' ? '💳 Transactions' : tab === 'products' ? '📦 Produits' : '🏦 Virements'}
          </button>
        ))}
      </div>

      {/* Tab Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique revenus */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenus Stripe — 6 derniers mois</h3>
            <div className="space-y-3">
              {[
                { month: 'Oct 2025', amount: 28400 },
                { month: 'Nov 2025', amount: 31200 },
                { month: 'Déc 2025', amount: 38900 },
                { month: 'Jan 2026', amount: 35600 },
                { month: 'Fév 2026', amount: 39800 },
                { month: 'Mar 2026', amount: 41250 },
              ].map(d => (
                <div key={d.month} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-20">{d.month}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(d.amount / 45000) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">{d.amount.toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par méthode */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Méthodes de paiement</h3>
            <div className="space-y-3">
              {[
                { method: 'Visa', pct: 52, amount: 21450, color: 'bg-blue-500' },
                { method: 'Mastercard', pct: 28, amount: 11550, color: 'bg-red-500' },
                { method: 'CB Nationale', pct: 15, amount: 6188, color: 'bg-green-500' },
                { method: 'Apple Pay', pct: 5, amount: 2063, color: 'bg-gray-700' },
              ].map(m => (
                <div key={m.method}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{m.method}</span>
                    <span className="text-gray-500 dark:text-gray-400">{m.amount.toLocaleString('fr-FR')} € ({m.pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Transactions */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Dernières transactions</h3>
            <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors">
              Exporter CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['ID', 'Date', 'Description', 'Client', 'Méthode', 'Montant', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {TRANSACTIONS.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">{tx.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{tx.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{tx.desc}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{tx.customer}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{tx.method}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{tx.amount.toLocaleString('fr-FR')} €</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[tx.status] || ''}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Détails</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Products */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Catalogue produits Stripe</h3>
            <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors">
              + Nouveau produit
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['Produit', 'Catégorie', 'Prix', 'Ventes', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {PRODUCTS.map(prod => (
                  <tr key={prod.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{prod.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{prod.category}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{prod.price.toLocaleString('fr-FR')} €</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{prod.sales} ventes</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${prod.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {prod.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Modifier</button>
                      <button className="text-red-500 hover:text-red-700 text-xs font-medium">Désactiver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Payouts */}
      {activeTab === 'payouts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Compte bancaire</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Banque</span><span className="font-medium text-gray-900 dark:text-white">Crédit Agricole Guyane</span></div>
              <div className="flex justify-between"><span className="text-gray-500">IBAN</span><span className="font-mono text-gray-900 dark:text-white">FR76 •••• •••• •••• 4521</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fréquence</span><span className="font-medium text-gray-900 dark:text-white">Hebdomadaire (Lundi)</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Prochain virement</span><span className="font-medium text-green-600">Lun 02 Mar 2026 — 3 200 €</span></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Historique des virements</h3>
            <div className="space-y-3">
              {[
                { date: '24 Fév 2026', amount: 8450, status: 'paid' },
                { date: '17 Fév 2026', amount: 7200, status: 'paid' },
                { date: '10 Fév 2026', amount: 9100, status: 'paid' },
                { date: '03 Fév 2026', amount: 6800, status: 'paid' },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{p.date}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{p.amount.toLocaleString('fr-FR')} €</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Versé</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Webhooks */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Configuration Webhooks</h3>
              <button onClick={() => setShowWebhookModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="font-medium text-gray-900 dark:text-white">Endpoint actif</div>
                <div className="font-mono text-xs text-gray-500 mt-1">https://api.lftg.fr/stripe/webhook</div>
              </div>
              <div className="space-y-2">
                {['payment_intent.succeeded', 'payment_intent.payment_failed', 'charge.refunded', 'customer.subscription.updated'].map(event => (
                  <div key={event} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{event}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setShowWebhookModal(false)} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
