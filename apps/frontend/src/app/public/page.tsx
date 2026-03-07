'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SPECIES_DATA = [
  { name: 'Ara ararauna', common: 'Ara bleu et jaune', count: 8, class: 'Aves', cites: 'II', iucn: 'LC', emoji: '🦜', color: 'from-blue-500 to-yellow-400' },
  { name: 'Amazona amazonica', common: 'Amazone à front bleu', count: 12, class: 'Aves', cites: 'II', iucn: 'LC', emoji: '🦜', color: 'from-green-500 to-emerald-400' },
  { name: 'Dendrobates azureus', common: 'Dendrobate azuré', count: 24, class: 'Amphibia', cites: 'II', iucn: 'VU', emoji: '🐸', color: 'from-blue-600 to-cyan-400' },
  { name: 'Boa constrictor', common: 'Boa constricteur', count: 5, class: 'Reptilia', cites: 'II', iucn: 'LC', emoji: '🐍', color: 'from-amber-600 to-yellow-500' },
  { name: 'Caiman crocodilus', common: 'Caïman à lunettes', count: 2, class: 'Reptilia', cites: 'II', iucn: 'LC', emoji: '🐊', color: 'from-green-700 to-lime-500' },
];

const NEWS = [
  { date: '28 Fév 2026', title: 'Naissance de 4 araraunas', desc: 'La couvée #COV-2026-012 a donné naissance à 4 jeunes aras bleu et jaune en parfaite santé.', tag: 'Naissance', color: 'bg-green-100 text-green-700' },
  { date: '15 Fév 2026', title: 'Certification CITES renouvelée', desc: 'La ferme a obtenu le renouvellement de sa certification CITES pour 5 ans par le MTES.', tag: 'Certification', color: 'bg-blue-100 text-blue-700' },
  { date: '01 Fév 2026', title: 'Partenariat CNRS Amazonie', desc: 'Signature d\'un accord de recherche avec le CNRS pour l\'étude de la biodiversité guyanaise.', tag: 'Partenariat', color: 'bg-purple-100 text-purple-700' },
  { date: '20 Jan 2026', title: 'Ouverture des visites nocturnes', desc: 'Nouveau programme de visites guidées nocturnes pour découvrir la faune guyanaise de nuit.', tag: 'Visite', color: 'bg-amber-100 text-amber-700' },
];

const VISITS = [
  { name: 'Visite Découverte', duration: '1h30', price: 25, desc: 'Tour complet de la ferme avec guide naturaliste', max: 15, emoji: '🌿' },
  { name: 'Visite Famille', duration: '2h', price: 40, desc: 'Visite adaptée aux enfants avec activités pédagogiques', max: 20, emoji: '👨‍👩‍👧‍👦' },
  { name: 'Visite Nocturne', duration: '2h30', price: 35, desc: 'Découvrez la faune guyanaise à la tombée de la nuit', max: 10, emoji: '🌙' },
  { name: 'Visite Scolaire', duration: '3h', price: 15, desc: 'Programme pédagogique adapté aux groupes scolaires', max: 30, emoji: '🎒' },
];

const STATS = [
  { value: '247', label: 'Animaux', icon: '🦜' },
  { value: '5', label: 'Espèces', icon: '🌿' },
  { value: '15+', label: 'Années d\'expérience', icon: '⭐' },
  { value: '4.8/5', label: 'Note visiteurs', icon: '❤️' },
];

export default function PublicHomePage() {
  const [weather, setWeather] = useState({ temp: 29, humidity: 78, desc: 'Partiellement nuageux', icon: '⛅' });
  const [activeTab, setActiveTab] = useState<'especes' | 'visites' | 'actualites' | 'contact'>('especes');
  const [contactForm, setContactForm] = useState({ senderName: '', senderEmail: '', phone: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      const res = await fetch('/api/v1/email/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactStatus('success');
        setContactForm({ senderName: '', senderEmail: '', phone: '', subject: '', message: '' });
      } else {
        setContactStatus('error');
      }
    } catch {
      setContactStatus('error');
    }
  };
  const [selectedSpecies, setSelectedSpecies] = useState<typeof SPECIES_DATA[0] | null>(null);

  useEffect(() => {
    // Simuler la météo en temps réel
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        temp: 27 + Math.floor(Math.random() * 5),
        humidity: 72 + Math.floor(Math.random() * 15),
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const iucnColors: Record<string, string> = {
    LC: 'bg-green-100 text-green-700',
    NT: 'bg-yellow-100 text-yellow-700',
    VU: 'bg-orange-100 text-orange-700',
    EN: 'bg-red-100 text-red-700',
    CR: 'bg-red-200 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 via-forest-900 to-forest-800 text-white font-sans">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-forest-950/90 backdrop-blur-md border-b border-forest-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🦜</span>
            <div>
              <div className="font-bold text-lg text-white">La Ferme Tropicale</div>
              <div className="text-xs text-forest-300">de Guyane — LFTG</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-forest-200">
            <button onClick={() => setActiveTab('especes')} className={`hover:text-white transition-colors ${activeTab === 'especes' ? 'text-gold-400 font-medium' : ''}`}>Nos Espèces</button>
            <button onClick={() => setActiveTab('visites')} className={`hover:text-white transition-colors ${activeTab === 'visites' ? 'text-gold-400 font-medium' : ''}`}>Visites</button>
            <button onClick={() => setActiveTab('actualites')} className={`hover:text-white transition-colors ${activeTab === 'actualites' ? 'text-gold-400 font-medium' : ''}`}>Actualités</button>
            <button onClick={() => setActiveTab('contact')} className={`hover:text-white transition-colors ${activeTab === 'contact' ? 'text-gold-400 font-medium' : ''}`}>Contact</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-forest-800/60 rounded-full px-3 py-1.5 text-sm">
              <span>{weather.icon}</span>
              <span className="text-forest-200">{weather.temp}°C</span>
              <span className="text-forest-400">·</span>
              <span className="text-forest-300">{weather.humidity}% HR</span>
            </div>
            <Link href="/admin" className="bg-gold-500 hover:bg-gold-400 text-forest-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              Espace Pro
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Background décoratif */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-8xl opacity-10 animate-pulse">🦜</div>
          <div className="absolute top-40 right-20 text-6xl opacity-10 animate-bounce" style={{ animationDelay: '1s' }}>🐸</div>
          <div className="absolute bottom-20 left-1/4 text-7xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}>🐍</div>
          <div className="absolute top-60 right-1/3 text-5xl opacity-10 animate-bounce" style={{ animationDelay: '0.5s' }}>🌿</div>
          <div className="absolute bottom-10 right-10 text-6xl opacity-10 animate-pulse" style={{ animationDelay: '1.5s' }}>🐊</div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 rounded-full px-4 py-1.5 text-gold-300 text-sm mb-6">
            <span>🌿</span>
            <span>Biodiversité Amazonienne — Cayenne, Guyane française</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            La Ferme Tropicale
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-maroni-400">
              de Guyane
            </span>
          </h1>

          <p className="text-xl text-forest-200 max-w-3xl mx-auto mb-10 leading-relaxed">
            Élevage professionnel et conservation d'espèces tropicales protégées au cœur de la forêt amazonienne guyanaise. 
            Certifié CITES · Partenaire CNRS · 15 ans d'expertise.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={() => setActiveTab('visites')}
              className="bg-gold-500 hover:bg-gold-400 text-forest-900 font-bold px-8 py-4 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg shadow-gold-500/25"
            >
              Réserver une visite
            </button>
            <button
              onClick={() => setActiveTab('especes')}
              className="bg-forest-700/60 hover:bg-forest-600/60 border border-forest-500/50 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all"
            >
              Découvrir nos espèces
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(stat => (
              <div key={stat.label} className="bg-forest-800/40 backdrop-blur border border-forest-600/30 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-gold-400">{stat.value}</div>
                <div className="text-sm text-forest-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Météo détaillée */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-maroni-900/60 to-forest-800/60 border border-maroni-700/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{weather.icon}</span>
              <div>
                <div className="font-bold text-xl">Cayenne, Guyane</div>
                <div className="text-forest-300 text-sm">Conditions en temps réel</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-center">
              <div><div className="text-2xl font-bold text-gold-400">{weather.temp}°C</div><div className="text-xs text-forest-400">Température</div></div>
              <div><div className="text-2xl font-bold text-maroni-400">{weather.humidity}%</div><div className="text-xs text-forest-400">Humidité</div></div>
              <div><div className="text-2xl font-bold text-green-400">UV 8</div><div className="text-xs text-forest-400">Indice UV</div></div>
              <div><div className="text-2xl font-bold text-yellow-400">18 km/h</div><div className="text-xs text-forest-400">Vent NE</div></div>
            </div>
            <div className="text-right">
              <div className="text-forest-300 text-sm">{weather.desc}</div>
              <div className="text-forest-400 text-xs mt-1">Lever 06:12 · Coucher 18:24</div>
            </div>
          </div>
        </div>
      </section>

      {/* Onglets principaux */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-forest-800/40 rounded-xl p-1 w-fit">
            {(['especes', 'visites', 'actualites', 'contact'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab
                    ? 'bg-gold-500 text-forest-900 shadow-lg'
                    : 'text-forest-300 hover:text-white'
                }`}
              >
                {tab === 'especes' ? '🦜 Nos Espèces' : tab === 'visites' ? '🌿 Visites' : tab === 'actualites' ? '📰 Actualités' : '✉️ Contact'}
              </button>
            ))}
          </div>

          {/* Tab Espèces */}
          {activeTab === 'especes' && (
            <div>
              <h2 className="text-3xl font-bold mb-2">Nos Espèces Protégées</h2>
              <p className="text-forest-300 mb-8">Toutes nos espèces sont élevées dans le respect de la réglementation CITES et des normes de bien-être animal.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SPECIES_DATA.map(sp => (
                  <div
                    key={sp.name}
                    onClick={() => setSelectedSpecies(selectedSpecies?.name === sp.name ? null : sp)}
                    className="bg-forest-800/40 border border-forest-600/30 rounded-2xl overflow-hidden cursor-pointer hover:border-gold-500/50 transition-all group"
                  >
                    <div className={`h-32 bg-gradient-to-br ${sp.color} flex items-center justify-center`}>
                      <span className="text-7xl group-hover:scale-110 transition-transform">{sp.emoji}</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-bold text-white">{sp.common}</div>
                          <div className="text-forest-400 text-sm italic">{sp.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gold-400">{sp.count}</div>
                          <div className="text-xs text-forest-400">individus</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="bg-forest-700/60 text-forest-200 text-xs px-2 py-1 rounded-full">{sp.class}</span>
                        <span className="bg-blue-900/60 text-blue-300 text-xs px-2 py-1 rounded-full">CITES Ann. {sp.cites}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${iucnColors[sp.iucn] || 'bg-gray-100 text-gray-700'}`}>UICN {sp.iucn}</span>
                      </div>
                      {selectedSpecies?.name === sp.name && (
                        <div className="mt-4 pt-4 border-t border-forest-600/30 text-sm text-forest-300">
                          <p>Espèce présente en Guyane française et dans tout le bassin amazonien. Élevage certifié CITES avec traçabilité complète de chaque individu.</p>
                          <div className="mt-2 flex gap-2">
                            <span className="text-gold-400">Habitat :</span>
                            <span>Forêt tropicale humide</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Visites */}
          {activeTab === 'visites' && (
            <div>
              <h2 className="text-3xl font-bold mb-2">Réservez Votre Visite</h2>
              <p className="text-forest-300 mb-8">Découvrez la biodiversité guyanaise avec nos guides naturalistes certifiés. Visites disponibles du mardi au dimanche.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {VISITS.map(visit => (
                  <div key={visit.name} className="bg-forest-800/40 border border-forest-600/30 rounded-2xl p-6 hover:border-gold-500/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{visit.emoji}</span>
                        <div>
                          <div className="font-bold text-lg">{visit.name}</div>
                          <div className="text-forest-400 text-sm">{visit.duration} · Max {visit.max} personnes</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gold-400">{visit.price}€</div>
                        <div className="text-xs text-forest-400">par personne</div>
                      </div>
                    </div>
                    <p className="text-forest-300 text-sm mb-5">{visit.desc}</p>
                    <button className="w-full bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/40 text-gold-300 font-semibold py-3 rounded-xl transition-all">
                      Réserver cette visite
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-8 bg-maroni-900/40 border border-maroni-700/30 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-2">📍 Comment nous trouver</h3>
                <p className="text-forest-300 text-sm">Route de Montjoly, Cayenne 97300, Guyane française</p>
                <p className="text-forest-400 text-sm mt-1">Ouvert du mardi au dimanche · 8h00 – 17h00</p>
                <p className="text-forest-400 text-sm">Tél : +594 594 123 456 · contact@lftg.fr</p>
              </div>
            </div>
          )}

          {/* Tab Actualités */}
          {activeTab === 'actualites' && (
            <div>
              <h2 className="text-3xl font-bold mb-2">Actualités de la Ferme</h2>
              <p className="text-forest-300 mb-8">Suivez la vie de nos animaux et les dernières nouvelles de La Ferme Tropicale de Guyane.</p>
              <div className="space-y-4">
                {NEWS.map((news, i) => (
                  <div key={i} className="bg-forest-800/40 border border-forest-600/30 rounded-2xl p-6 hover:border-gold-500/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${news.color}`}>{news.tag}</span>
                          <span className="text-forest-400 text-sm">{news.date}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{news.title}</h3>
                        <p className="text-forest-300 text-sm leading-relaxed">{news.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-forest-700/50 mt-16 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🦜</span>
                <span className="font-bold text-lg">LFTG</span>
              </div>
              <p className="text-forest-400 text-sm leading-relaxed">
                La Ferme Tropicale de Guyane — Élevage professionnel et conservation de la biodiversité amazonienne depuis 2010.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-forest-200">Certifications</h4>
              <div className="space-y-2 text-sm text-forest-400">
                <div className="flex items-center gap-2"><span className="text-green-400">✓</span> Certificat CITES (MTES)</div>
                <div className="flex items-center gap-2"><span className="text-green-400">✓</span> Établissement d'élevage agréé</div>
                <div className="flex items-center gap-2"><span className="text-green-400">✓</span> Partenaire CNRS Amazonie</div>
                <div className="flex items-center gap-2"><span className="text-green-400">✓</span> Membre UICN</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-forest-200">Contact</h4>
              <div className="space-y-2 text-sm text-forest-400">
                <div>📍 Route de Montjoly, Cayenne 97300</div>
                <div>📞 +594 594 123 456</div>
                <div>✉️ contact@lftg.fr</div>
                <div>🌐 www.lftg.fr</div>
              </div>
            </div>
          </div>
          <div className="border-t border-forest-700/50 pt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-forest-500">
            <span>© 2026 La Ferme Tropicale de Guyane — William MERI</span>
            <div className="flex gap-4">
              <span className="hover:text-forest-300 cursor-pointer">Mentions légales</span>
              <span className="hover:text-forest-300 cursor-pointer">Politique de confidentialité</span>
              <Link href="/admin" className="text-gold-500 hover:text-gold-400">Espace Pro →</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
