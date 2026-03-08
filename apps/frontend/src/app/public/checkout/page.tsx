'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

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
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);

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

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c));
  };

  const total = cart.reduce((sum, c) => {
    const p = products.find(p => p.id === c.id);
    return sum + (p ? p.price * c.qty : 0);
  }, 0);

  const cartItems = cart.map(c => ({ ...c, product: products.find(p => p.id === c.id)! })).filter(c => c.product);

  const handlePayment = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Veuillez remplir votre nom et email.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            name: item.product.name,
            description: item.product.description,
            amount: item.product.price * 100, // en centimes
            quantity: item.qty,
          })),
          successUrl: `${window.location.origin}/public/checkout?success=true`,
          cancelUrl: `${window.location.origin}/public/checkout`,
          customerEmail: form.email,
          metadata: { customerName: form.name },
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la création de la session de paiement');

      const data = await res.json();

      // Si Stripe retourne une URL de redirection, on redirige
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      // Sinon (mode simulation), on passe à l'étape succès
      setOrderRef(data.id || `CMD-${Date.now().toString(36).toUpperCase()}`);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <div>
              <h1 className="font-bold text-gray-900">La Ferme Tropicale de Guyane</h1>
              <p className="text-xs text-gray-500">Boutique & Dons</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>🔒</span>
            <span>Sécurisé par Stripe</span>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-8">
          {(['products', 'cart', 'payment', 'success'] as const).map((s, i) => {
            const labels = ['Produits', 'Panier', 'Paiement', 'Confirmation'];
            const steps = ['products', 'cart', 'payment', 'success'];
            const currentIdx = steps.indexOf(step);
            const isActive = s === step;
            const isDone = steps.indexOf(s) < currentIdx;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isDone ? 'bg-forest-600 text-white' : isActive ? 'bg-forest-600 text-white ring-2 ring-forest-200' : 'bg-gray-100 text-gray-400'
                }`}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span className={`text-sm ${isActive ? 'font-semibold text-forest-700' : 'text-gray-400'}`}>{labels[i]}</span>
                {i < 3 && <div className="w-8 h-px bg-gray-200 mx-1" />}
              </div>
            );
          })}
        </div>

        {/* Étape 1 : Produits */}
        {step === 'products' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Choisissez vos produits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {products.map(p => {
                const inCart = cart.find(c => c.id === p.id);
                return (
                  <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-3">{p.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{p.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-forest-700">{p.price}€</span>
                      {inCart ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(p.id, inCart.qty - 1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">−</button>
                          <span className="text-sm font-medium w-4 text-center">{inCart.qty}</span>
                          <button onClick={() => updateQty(p.id, inCart.qty + 1)} className="w-7 h-7 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 hover:bg-forest-200">+</button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(p.id)} className="px-3 py-1.5 bg-forest-600 text-white rounded-lg text-sm hover:bg-forest-700">
                          Ajouter
                        </button>
                      )}
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize mt-2 inline-block">{p.category}</span>
                  </div>
                );
              })}
            </div>
            {cart.length > 0 && (
              <div className="flex justify-end">
                <button onClick={() => setStep('cart')} className="px-6 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700 flex items-center gap-2">
                  Voir le panier ({cart.reduce((s, c) => s + c.qty, 0)}) →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Étape 2 : Panier */}
        {step === 'cart' && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Votre panier</h2>
            {cartItems.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">🛒</div>
                <p>Votre panier est vide</p>
                <button onClick={() => setStep('products')} className="mt-4 text-forest-600 underline text-sm">Retour aux produits</button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 mb-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4">
                      <span className="text-2xl">{item.product.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.product.price}€ / unité</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">−</button>
                        <span className="text-sm w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-xs text-forest-700">+</button>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-12 text-right">{item.product.price * item.qty}€</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-400 ml-1">✕</button>
                    </div>
                  ))}
                </div>
                <div className="bg-forest-50 rounded-xl p-4 mb-6 flex justify-between items-center">
                  <span className="text-forest-700 font-medium">Total</span>
                  <span className="text-2xl font-bold text-forest-700">{total}€</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep('products')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">← Continuer</button>
                  <button onClick={() => setStep('payment')} className="flex-1 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700">
                    Procéder au paiement →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Étape 3 : Paiement */}
        {step === 'payment' && (
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Paiement sécurisé</h2>
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  placeholder="jean@email.fr"
                />
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                💳 Vous serez redirigé vers la page de paiement sécurisée Stripe pour finaliser votre commande.
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">{error}</div>
            )}
            <div className="bg-forest-50 rounded-xl p-4 mb-6 flex justify-between items-center">
              <span className="text-forest-700 font-medium">Total à payer</span>
              <span className="text-2xl font-bold text-forest-700">{total}€</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('cart')} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">← Retour</button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <><span className="animate-spin">⏳</span> Traitement...</>
                ) : (
                  <>🔒 Payer {total}€</>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">Paiement sécurisé par Stripe · PCI DSS Level 1</p>
          </div>
        )}

        {/* Étape 4 : Succès */}
        {step === 'success' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Paiement confirmé !</h2>
            <p className="text-gray-500 mb-2">Merci pour votre soutien à la Ferme Tropicale de Guyane.</p>
            {form.email && <p className="text-sm text-gray-400 mb-2">Un email de confirmation a été envoyé à <strong>{form.email}</strong></p>}
            {orderRef && <p className="text-xs text-gray-400 mb-8">Référence : <code className="bg-gray-100 px-2 py-0.5 rounded">{orderRef}</code></p>}
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
              onClick={() => { setCart([]); setStep('products'); setForm({ name: '', email: '' }); setOrderRef(null); }}
              className="px-6 py-3 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700"
            >
              Retour à la boutique
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
