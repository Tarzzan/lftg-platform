'use client';

import { useState } from 'react';

const products = [
  { id: 'prod-1', name: 'Visite guidée standard', price: 15, description: '1h30 de visite avec guide expert', icon: '🦜', category: 'visite' },
  { id: 'prod-2', name: 'Visite guidée premium', price: 35, description: 'Visite privée + interaction avec les animaux', icon: '⭐', category: 'visite' },
  { id: 'prod-3', name: 'Parrainage mensuel — Ara', price: 25, description: 'Parrainez un Ara pendant 1 mois', icon: '❤️', category: 'parrainage' },
  { id: 'prod-4', name: 'Parrainage mensuel — Dendrobate', price: 15, description: 'Parrainez une grenouille venimeuse', icon: '💚', category: 'parrainage' },
  { id: 'prod-5', name: 'Don libre', price: 10, description: 'Soutenir la conservation des espèces', icon: '🌿', category: 'don' },
];

export default function CheckoutPage() {
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [step, setStep] = useState<'products' | 'cart' | 'payment' | 'success'>('products');
  const [form, setForm] = useState({ name: '', email: '', card: '4242 4242 4242 4242', expiry: '12/28', cvc: '123' });

  const addToCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing) return prev.map(c => c.id === id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.id !== id));
  };

  const total = cart.reduce((sum, c) => {
    const p = products.find(p => p.id === c.id);
    return sum + (p ? p.price * c.qty : 0);
  }, 0);

  const cartItems = cart.map(c => ({ ...c, product: products.find(p => p.id === c.id)! })).filter(c => c.product);

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦜</span>
            <div>
              <div className="font-bold text-forest-700">La Ferme Tropicale de Guyane</div>
              <div className="text-xs text-gray-500">Paiement sécurisé</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>🔒</span>
            <span>Sécurisé par Stripe</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {['Produits', 'Panier', 'Paiement', 'Confirmation'].map((s, i) => {
            const steps = ['products', 'cart', 'payment', 'success'];
            const current = steps.indexOf(step);
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < current ? 'bg-forest-600 text-white' :
                  i === current ? 'bg-forest-600 text-white ring-2 ring-forest-200' :
                  'bg-gray-100 text-gray-400'
                }`}>{i < current ? '✓' : i + 1}</div>
                <span className={`text-sm ${i === current ? 'font-medium text-forest-700' : 'text-gray-400'}`}>{s}</span>
                {i < 3 && <span className="text-gray-200 mx-1">›</span>}
              </div>
            );
          })}
        </div>

        {step === 'products' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Choisissez vos produits</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-forest-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{p.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{p.description}</div>
                        <div className="mt-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{p.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-forest-700">{p.price}€</div>
                      <button
                        onClick={() => addToCart(p.id)}
                        className="mt-2 px-3 py-1.5 bg-forest-600 text-white text-xs rounded-lg hover:bg-forest-700"
                      >
                        + Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => setStep('cart')}
                  className="px-6 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700"
                >
                  Voir le panier ({cart.reduce((s, c) => s + c.qty, 0)} article{cart.length > 1 ? 's' : ''}) →
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'cart' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Votre panier</h2>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0">
                  <span className="text-2xl">{item.product.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.product.name}</div>
                    <div className="text-sm text-gray-500">{item.product.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">x{item.qty}</span>
                    <span className="font-bold text-forest-700">{item.product.price * item.qty}€</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                  </div>
                </div>
              ))}
              <div className="p-4 bg-gray-50 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="text-2xl font-bold text-forest-700">{total}€</span>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setStep('products')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">← Retour</button>
              <button onClick={() => setStep('payment')} className="px-6 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700">
                Procéder au paiement →
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Paiement sécurisé</h2>
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  placeholder="jean@email.fr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de carte</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.card}
                    onChange={e => setForm(f => ({ ...f, card: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 pr-12"
                  />
                  <span className="absolute right-3 top-2 text-gray-400">💳</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
                  <input
                    type="text"
                    value={form.expiry}
                    onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                  <input
                    type="text"
                    value={form.cvc}
                    onChange={e => setForm(f => ({ ...f, cvc: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  />
                </div>
              </div>
            </div>
            <div className="bg-forest-50 rounded-xl p-4 mb-6 flex justify-between items-center">
              <span className="text-forest-700 font-medium">Total à payer</span>
              <span className="text-2xl font-bold text-forest-700">{total}€</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('cart')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">← Retour</button>
              <button
                onClick={() => setStep('success')}
                className="flex-1 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700 flex items-center justify-center gap-2"
              >
                🔒 Payer {total}€
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">Paiement sécurisé par Stripe · PCI DSS Level 1</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Paiement confirmé !</h2>
            <p className="text-gray-500 mb-2">Merci pour votre soutien à la Ferme Tropicale de Guyane.</p>
            <p className="text-sm text-gray-400 mb-8">Un email de confirmation a été envoyé à {form.email || 'votre adresse'}</p>
            <div className="bg-forest-50 rounded-xl p-6 max-w-sm mx-auto mb-8">
              <div className="text-forest-700 font-semibold mb-2">Récapitulatif</div>
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600 py-1">
                  <span>{item.product.name} x{item.qty}</span>
                  <span>{item.product.price * item.qty}€</span>
                </div>
              ))}
              <div className="border-t border-forest-200 mt-2 pt-2 flex justify-between font-bold text-forest-700">
                <span>Total</span>
                <span>{total}€</span>
              </div>
            </div>
            <button
              onClick={() => { setStep('products'); setCart([]); }}
              className="px-6 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700"
            >
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
