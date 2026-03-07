'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// ─── Compte à rebours ─────────────────────────────────────────────────────────
function Countdown() {
  const target = new Date('2026-04-20T08:00:00');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      {[
        { value: timeLeft.days, label: 'Jours' },
        { value: timeLeft.hours, label: 'Heures' },
        { value: timeLeft.minutes, label: 'Minutes' },
        { value: timeLeft.seconds, label: 'Secondes' },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[72px]">
          <span className="text-3xl font-display font-bold text-white tabular-nums">
            {String(item.value).padStart(2, '0')}
          </span>
          <span className="text-forest-300 text-xs font-medium mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Accordéon ────────────────────────────────────────────────────────────────
function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-forest-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-forest-50 transition-colors text-left"
      >
        <span className="font-semibold text-forest-900">{title}</span>
        <svg
          className={`w-5 h-5 text-forest-600 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 py-4 bg-forest-50 border-t border-forest-200 text-forest-800 text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Données espèces ──────────────────────────────────────────────────────────
const especesCat2 = [
  { name: 'Agouti', latin: 'Dasyprocta leporina', desc: 'Rongeur forestier, excellent disperseur de graines, emblème de la forêt guyanaise.' },
  { name: 'Capybara', latin: 'Hydrochaerus hydrochaeris', desc: 'Plus grand rongeur du monde, semi-aquatique, présent dans les zones humides de Guyane.' },
  { name: 'Iguane vert', latin: 'Iguana iguana', desc: 'Lézard arboricole emblématique, très apprécié pour sa viande, en fort déclin dans la nature.' },
  { name: 'Hocco', latin: 'Crax alector', desc: 'Grand gallinacé forestier, indicateur de la santé des forêts tropicales, gibier traditionnel.' },
  { name: 'Paca', latin: 'Cuniculus paca', desc: 'Rongeur nocturne, gibier très prisé, à fort potentiel pour l\'élevage durable en Guyane.' },
  { name: 'Marail & Agami', latin: 'Penelope marail / Psophia crepitans', desc: 'Oiseaux forestiers emblématiques, espèces sensibles nécessitant des conditions d\'élevage spécifiques.' },
  { name: 'Ameive commun', latin: 'Ameiva ameiva', desc: 'Grand lézard diurne des lisières et savanes guyanaises, espèce robuste à fort potentiel d\'élevage.' },
  { name: 'Téju commun', latin: 'Tupinambis teguixin', desc: 'Grand lézard omnivore de Guyane, espèce valorisable pour sa viande et son cuir, élevage durable.' },
  { name: 'Agami trompette', latin: 'Psophia crepitans', desc: 'Oiseau forestier grégaire, excellent gardien naturel, espèce à comportement social très développé.' },
];

const especesCat1 = [
  { name: 'Pécari à lèvres blanches', latin: 'Tayassu pecari', desc: 'Suidé forestier vivant en grands groupes, indicateur de la santé des forêts tropicales guyanaises.' },
  { name: 'Pécari à collier', latin: 'Tayassu tajacu', desc: 'Plus adaptable, présent en lisière de forêt, espèce phare de l\'élevage extensif en Guyane.' },
  { name: 'Boa constricteur', latin: 'Boa constrictor', desc: 'Grand serpent non venimeux, régulateur naturel des rongeurs, espèce protégée à fort potentiel pédagogique.' },
  { name: 'Boa brodé', latin: 'Corallus hortulanus', desc: 'Serpent arboricole nocturne aux écailles irisées, espèce emblématique de la canopée guyanaise.' },
  { name: 'Amazone Aourou', latin: 'Amazona amazonica', desc: 'Perroquet vert emblématique de Guyane, très intelligent, nécessitant une stimulation comportementale importante.' },
  { name: 'Grand tinamou', latin: 'Tinamus major', desc: 'Oiseau forestier discret, excellent indicateur de la santé des sous-bois, gibier traditionnel apprécié.' },
  { name: 'Tocro de Guyane', latin: 'Odontophorus gujanensis', desc: 'Colin forestier guyanais, espèce peu connue à fort potentiel pour l\'élevage durable en sous-bois.' },
  { name: 'Paresseux à trois doigts', latin: 'Bradypus tridactylus', desc: 'Mammifère arboricole symbole de la forêt guyanaise, aux besoins très spécifiques en captivité.' },
];

// ─── Page principale ──────────────────────────────────────────────────────────
export default function CCandEggPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', telephone: '', lieu: '', situation: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prenom || !formData.nom || !formData.email || !formData.telephone) return;
    setSubmitStatus('sending');
    try {
      const res = await fetch('/api/public/contact/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.prenom,
          lastName: formData.nom,
          email: formData.email,
          phone: formData.telephone,
          site: formData.lieu,
          situation: formData.situation,
          message: formData.message,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setSubmitStatus('idle');
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-forest-950/95 backdrop-blur-sm border-b border-forest-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#f5f0e8]">
                <Image src="/lftg_improved_v1.png" alt="Logo LFTG" width={40} height={40} className="object-cover w-full h-full" priority />
              </div>
              <div>
                <span className="text-white font-display font-bold text-sm leading-tight block">La Ferme Tropicale</span>
                <span className="text-forest-400 text-xs leading-tight block">de Guyane</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/#mission" className="text-forest-200 hover:text-white text-sm font-medium transition-colors">Notre mission</Link>
              <Link href="/#animaux" className="text-forest-200 hover:text-white text-sm font-medium transition-colors">Nos animaux</Link>
              <Link href="/#formations" className="text-forest-200 hover:text-white text-sm font-medium transition-colors">Formations</Link>
              <Link href="/#contact" className="text-forest-200 hover:text-white text-sm font-medium transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-forest-600 hover:bg-forest-500 text-white text-sm font-semibold rounded-lg transition-colors">
                <span>Espace membres</span><span>→</span>
              </Link>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-forest-300 hover:text-white p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="md:hidden border-t border-forest-800 py-3 space-y-1">
              {[
                { href: '/#mission', label: 'Notre mission' },
                { href: '/#animaux', label: 'Nos animaux' },
                { href: '/#formations', label: 'Formations' },
                { href: '/#contact', label: 'Contact' },
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-forest-200 hover:text-white text-sm font-medium rounded-md hover:bg-forest-800 transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800" />
        <div className="absolute inset-0 jungle-overlay opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-20">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-forest-400 text-sm mb-6">
            <Link href="/" className="hover:text-forest-200 transition-colors">Accueil</Link>
            <span>›</span>
            <Link href="/#formations" className="hover:text-forest-200 transition-colors">Formations</Link>
            <span>›</span>
            <span className="text-forest-200">CCAND-EGG</span>
          </div>

          {/* Badge session */}
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Session Avril 2026 — Inscriptions ouvertes
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-4">
            Formation<br />
            <span className="text-forest-400">CCAND-EGG</span>
          </h1>
          <p className="text-forest-200 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-2">
            Préqualification au métier de <strong className="text-white">Soigneur animalier</strong> & <strong className="text-white">Éleveur de Gibiers de Guyane</strong>
          </p>
          <p className="text-forest-400 text-base max-w-2xl mx-auto mb-8">
            Préparation au passage des Certificats de Capacité pour Animaux Non Domestiques &amp; NACs — Formation unique en Guyane
          </p>

          {/* Compte à rebours */}
          <p className="text-forest-300 text-sm font-medium mb-2">Démarrage dans</p>
          <Countdown />

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a href="#inscription"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest-500 hover:bg-forest-400 text-white font-semibold rounded-xl transition-colors shadow-lg">
              S'inscrire maintenant →
            </a>
            <a href="/docs/livret-ccand-egg.pdf" target="_blank"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors">
              📄 Télécharger le programme
            </a>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
            {[
              { value: '22h', label: 'Théorie / espèce' },
              { value: '50h', label: 'Pratique / espèce' },
              { value: '17', label: 'Espèces couvertes' },
              { value: '5', label: 'Sites de formation' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-display font-bold text-white">{s.value}</div>
                <div className="text-forest-300 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bandeau urgence ────────────────────────────────────────────────── */}
      <div className="bg-amber-50 border-y border-amber-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left">
          <span className="text-amber-700 font-semibold text-sm">⚠️ Places limitées</span>
          <span className="hidden sm:block text-amber-400">·</span>
          <span className="text-amber-600 text-sm">Inscriptions ouvertes jusqu'à 15 jours avant le début de session</span>
          <span className="hidden sm:block text-amber-400">·</span>
          <span className="text-amber-600 text-sm">Réponse garantie sous 15 jours après entretien de motivation</span>
        </div>
      </div>

      {/* ── Présentation ───────────────────────────────────────────────────── */}
      <section id="presentation" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-forest-100 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">La formation</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-forest-950 mb-4">Une formation unique en Guyane</h2>
            <p className="text-stone-600 max-w-3xl mx-auto text-lg leading-relaxed">
              La formation CCAND-EGG est une formation professionnelle spécialisée qui vous prépare à exercer les métiers de l'élevage de la faune sauvage dans le strict respect de la réglementation en vigueur.
            </p>
          </div>

          {/* 4 cartes infos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: '⏱', title: 'Durée', desc: '22h de théorie + 50h de pratique par espèce, conformément à l\'arrêté du 12 décembre 2000 modifié' },
              { icon: '🎓', title: 'Format', desc: 'Apprentissage mixte : sessions en présentiel sur site et modules à distance (blended learning)' },
              { icon: '📍', title: 'Lieux', desc: 'Kourou (LFTG) · Macouria (CFPPA) · Sinnamary · Régina · Saint-Laurent' },
              { icon: '🏆', title: 'Certifications', desc: 'CCAND (Certificat de Capacité) + EGG (Éleveur de Gibiers de Guyane)' },
            ].map((card) => (
              <div key={card.title} className="bg-stone-50 border border-stone-200 rounded-2xl p-6 hover:border-forest-300 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-display font-bold text-forest-900 mb-2">{card.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Citation Swann MERI */}
          <div className="bg-forest-950 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 jungle-overlay opacity-20" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-forest-700 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <blockquote className="text-forest-100 text-lg sm:text-xl italic leading-relaxed max-w-3xl mx-auto mb-4">
                « La forêt guyanaise nous enseigne que chaque être vivant s'épanouit grâce à un écosystème qui le nourrit et le soutient. Chez LFTG, nous cultivons ce même esprit pour votre formation. »
              </blockquote>
              <p className="text-forest-400 font-semibold">— MERI Swann, Directeur de La Ferme Tropicale de Guyane</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Certifications ─────────────────────────────────────────────────── */}
      <section id="certifications" className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-forest-100 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">Certifications visées</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-forest-950 mb-4">Deux certifications officielles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* CCAND */}
            <div className="bg-white rounded-3xl border border-forest-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center text-2xl">🏆</div>
                <div>
                  <h3 className="font-display font-bold text-forest-900 text-xl">CCAND</h3>
                  <p className="text-forest-600 text-sm">Certificat de Capacité pour Animaux Non Domestiques</p>
                </div>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                Obligatoire pour détenir légalement des animaux non domestiques en France. Délivré après passage en commission CDNPS (Commission Départementale de la Nature, des Paysages et des Sites).
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-xs">
                ⚠️ La détention d'animaux non domestiques sans CCAND est passible de sanctions pénales.
              </div>
            </div>

            {/* EGG */}
            <div className="bg-white rounded-3xl border border-forest-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center text-2xl">🌿</div>
                <div>
                  <h3 className="font-display font-bold text-forest-900 text-xl">EGG</h3>
                  <p className="text-forest-600 text-sm">Éleveur de Gibiers de Guyane</p>
                </div>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                Reconnaissance professionnelle spécifique au contexte guyanais, délivrée par la FEGG. Atteste de la maîtrise des techniques d'élevage des espèces gibiers endémiques de Guyane.
              </p>
              <div className="bg-forest-50 border border-forest-200 rounded-xl p-3 text-forest-800 text-xs">
                🌱 Certification unique en Guyane, en partenariat avec la FEGG et le CFPPA de Macouria.
              </div>
            </div>
          </div>

          {/* Processus en 7 étapes */}
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
            <h3 className="font-display font-bold text-forest-900 text-xl mb-6 text-center">Processus d'obtention du Certificat de Capacité</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { n: '1', label: 'Formation LFTG', desc: 'Suivi du programme complet CCAND-EGG (théorie + pratique)', color: 'bg-forest-100 text-forest-700' },
                { n: '2', label: 'Dossier CCAND', desc: 'Rédaction et dépôt du dossier de demande de certificat de capacité', color: 'bg-forest-100 text-forest-700' },
                { n: '3', label: 'Commission CDNPS', desc: 'Passage devant la Commission Départementale de la Nature, des Paysages et des Sites', color: 'bg-amber-100 text-amber-700' },
                { n: '4', label: 'Obtention CCAND', desc: 'Délivrance officielle du CCAND par les autorités compétentes', color: 'bg-green-100 text-green-700' },
                { n: '5', label: "Dossier d'ouverture", desc: "Dossier d'ouverture d'établissement d'élevage", color: 'bg-forest-100 text-forest-700' },
                { n: '6', label: "Commission d'ouverture", desc: "Passage en commission et obtention de l'autorisation d'ouverture", color: 'bg-amber-100 text-amber-700' },
                { n: '7', label: "Déclaration d'activité", desc: "Enregistrement officiel et démarrage de l'activité professionnelle d'éleveur", color: 'bg-green-100 text-green-700' },
              ].map((step) => (
                <div key={step.n} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${step.color}`}>
                    {step.n}
                  </div>
                  <div>
                    <p className="font-semibold text-forest-900 text-sm">{step.label}</p>
                    <p className="text-stone-500 text-xs leading-relaxed mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-forest-50 border border-forest-200 rounded-xl p-4 text-forest-800 text-sm">
              <strong>Périodes d'Application en Entreprise (PAE) :</strong> 2 périodes de stage obligatoire en milieu professionnel. Alternance possible au CFPPA de Macouria, dans les exploitations agricoles partenaires, ou directement chez un exploitant en activité.
            </div>
          </div>
        </div>
      </section>

      {/* ── Espèces couvertes ──────────────────────────────────────────────── */}
      <section id="especes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-forest-100 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">Faune guyanaise</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-forest-950 mb-4">17 espèces emblématiques</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Toutes classées selon l'arrêté du 12 décembre 2000 modifié. Leur élevage requiert l'obtention préalable d'un certificat de capacité.
            </p>
          </div>

          {/* Catégorie 2 */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-forest-600 text-white text-xs font-bold px-3 py-1 rounded-full">Catégorie 2</span>
              <h3 className="font-display font-bold text-forest-900 text-lg">Espèces requérant un Certificat de Capacité</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {especesCat2.map((e) => (
                <div key={e.name} className="bg-stone-50 border border-stone-200 rounded-2xl p-5 hover:border-forest-300 hover:shadow-sm transition-all">
                  <h4 className="font-display font-bold text-forest-900">{e.name}</h4>
                  <p className="text-forest-500 text-xs italic mb-2">{e.latin}</p>
                  <p className="text-stone-600 text-sm leading-relaxed">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Catégorie 1 */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">Catégorie 1</span>
              <h3 className="font-display font-bold text-forest-900 text-lg">Espèces requérant CCAND + Autorisation d'ouverture d'établissement</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {especesCat1.map((e) => (
                <div key={e.name} className="bg-amber-50 border border-amber-200 rounded-2xl p-5 hover:border-amber-400 hover:shadow-sm transition-all">
                  <h4 className="font-display font-bold text-amber-900">{e.name}</h4>
                  <p className="text-amber-600 text-xs italic mb-2">{e.latin}</p>
                  <p className="text-amber-800 text-sm leading-relaxed">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800 text-sm">
            ⚠️ <strong>Rappel réglementaire :</strong> La détention de ces espèces sans certificat de capacité est passible de sanctions pénales. La formation CCAND-EGG vous prépare à exercer dans le strict respect du Code de l'environnement et de la réglementation DGTM.
          </div>
        </div>
      </section>

      {/* ── Programme ──────────────────────────────────────────────────────── */}
      <section id="programme" className="py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-forest-100 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">Contenu pédagogique</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-forest-950 mb-4">Programme de formation</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">Cliquez sur chaque module pour découvrir son contenu détaillé.</p>
          </div>
          <div className="space-y-3">
            <Accordion title="Module 1 — Réglementation et cadre juridique">
              <ul className="space-y-2 list-disc list-inside">
                <li>Arrêté du 12 décembre 2000 modifié — Classification des espèces</li>
                <li>Code de l'environnement — Articles L.413-1 à L.413-5</li>
                <li>Réglementation CITES et Convention de Washington</li>
                <li>Procédures d'obtention du Certificat de Capacité</li>
                <li>Obligations déclaratives et registres d'élevage</li>
                <li>Sanctions pénales et contrôles DGTM</li>
              </ul>
            </Accordion>
            <Accordion title="Module 2 — Biologie et éthologie des espèces">
              <ul className="space-y-2 list-disc list-inside">
                <li>Anatomie et physiologie des espèces guyanaises (mammifères, oiseaux, reptiles)</li>
                <li>Comportement naturel et besoins éthologiques en captivité</li>
                <li>Cycles biologiques, reproduction et néonatalité</li>
                <li>Alimentation et nutrition adaptée à chaque espèce</li>
                <li>Indicateurs de bien-être animal et signaux de stress</li>
              </ul>
            </Accordion>
            <Accordion title="Module 3 — Techniques d'élevage et gestion des installations">
              <ul className="space-y-2 list-disc list-inside">
                <li>Conception et aménagement des enclos selon les espèces</li>
                <li>Gestion sanitaire : prophylaxie, vaccinations, protocoles vétérinaires</li>
                <li>Contention et manipulation des animaux en toute sécurité</li>
                <li>Tenue des registres d'élevage et traçabilité</li>
                <li>Gestion des naissances, sevrage et socialisation</li>
                <li>Techniques d'enrichissement du milieu</li>
              </ul>
            </Accordion>
            <Accordion title="Module 4 — Pratique en entreprise (PAE)">
              <ul className="space-y-2 list-disc list-inside">
                <li>2 périodes de stage obligatoire en milieu professionnel</li>
                <li>Accueil possible au CFPPA de Macouria ou chez des éleveurs partenaires FEGG</li>
                <li>Suivi individualisé par un formateur-capacitaire</li>
                <li>Évaluation des compétences pratiques sur le terrain</li>
                <li>Rédaction du rapport de stage et du dossier de candidature CCAND</li>
              </ul>
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── Lieux ──────────────────────────────────────────────────────────── */}
      <section id="lieux" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-forest-100 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">Accessibilité</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-forest-950 mb-4">5 sites de formation</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Pour faciliter l'accès à la formation sur l'ensemble du territoire guyanais, les sessions se déroulent sur plusieurs sites.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Kourou — LFTG', address: 'PK 20,5 Route du Dégrad Saramacca, 97310 Kourou', note: 'Site principal — Ferme pédagogique', icon: '🏠' },
              { name: 'Macouria — CFPPA', address: 'Centre de Formation Professionnelle et de Promotion Agricole de Macouria', note: 'Site partenaire — Modules agricoles', icon: '🌱' },
              { name: 'Sinnamary', address: 'Site à confirmer — Commune de Sinnamary', note: 'Antenne régionale', icon: '📍' },
              { name: 'Régina', address: 'Site à confirmer — Commune de Régina', note: 'Antenne régionale', icon: '📍' },
              { name: 'Saint-Laurent-du-Maroni', address: 'Site à confirmer — Commune de Saint-Laurent', note: 'Antenne régionale Ouest', icon: '📍' },
            ].map((lieu) => (
              <div key={lieu.name} className="bg-stone-50 border border-stone-200 rounded-2xl p-6 hover:border-forest-300 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{lieu.icon}</div>
                <h3 className="font-display font-bold text-forest-900 mb-1">{lieu.name}</h3>
                <p className="text-stone-500 text-sm mb-2">{lieu.address}</p>
                <span className="inline-block bg-forest-100 text-forest-700 text-xs px-2 py-0.5 rounded-full">{lieu.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Financement ────────────────────────────────────────────────────── */}
      <section id="financement" className="py-20 bg-forest-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 jungle-overlay opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-forest-700 text-forest-200 text-xs font-semibold px-3 py-1 rounded-full mb-3">Financement</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">Des aides pour financer votre formation</h2>
            <p className="text-forest-300 max-w-2xl mx-auto">
              La formation CCAND-EGG est éligible à plusieurs dispositifs de financement. Renseignez-vous auprès de votre OPCO ou de Pôle Emploi.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '💳', title: 'CPF', desc: 'Compte Personnel de Formation — Financement individuel mobilisable sur moncompteformation.gouv.fr' },
              { icon: '🏦', title: 'OPCO', desc: 'Opérateurs de Compétences — Financement pour les salariés et indépendants selon votre secteur d\'activité' },
              { icon: '🇪🇺', title: 'FEADER / PDRG', desc: 'Programme de Développement Rural de Guyane — Mesure 01 : Formation des acteurs agricoles' },
              { icon: '🏛', title: 'Aides régionales', desc: 'Collectivité Territoriale de Guyane — Dispositifs d\'aide à la formation professionnelle agricole' },
            ].map((f) => (
              <div key={f.title} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>
                <p className="text-forest-300 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white/10 rounded-2xl p-6 text-center">
            <p className="text-forest-200 text-sm">
              Pour toute question sur le financement, contactez-nous au <strong className="text-white">+594 694 96 13 76</strong> ou par email à <strong className="text-white">lftg973@gmail.com</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── Documents à fournir ────────────────────────────────────────────── */}
      <section id="documents" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-forest-100 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">Dossier de candidature</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-forest-950 mb-4">Documents à fournir</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">Munissez-vous de ces documents pour votre entretien de motivation et votre inscription définitive.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
              <h3 className="font-display font-bold text-forest-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">!</span>
                Documents obligatoires
              </h3>
              <ul className="space-y-3">
                {[
                  'Une pièce d\'identité en cours de validité',
                  'Deux photos d\'identité récentes',
                  'Un curriculum vitae (CV)',
                  'Documents Pôle Emploi (si demandeur d\'emploi)',
                  'Un avis de situation foncière (demande en cours, le cas échéant)',
                ].map((doc) => (
                  <li key={doc} className="flex items-start gap-2 text-sm text-stone-700">
                    <span className="text-forest-500 mt-0.5 flex-shrink-0">✓</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-forest-50 border border-forest-200 rounded-2xl p-6">
              <h3 className="font-display font-bold text-forest-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-forest-100 text-forest-700 rounded-full flex items-center justify-center text-xs font-bold">+</span>
                Documents facultatifs (valorisés)
              </h3>
              <ul className="space-y-3">
                {[
                  'Diplômes agricoles ou vétérinaires',
                  'Attestations d\'expériences professionnelles',
                  'Lettre de motivation détaillée',
                  'Tout document attestant d\'une expérience avec les animaux',
                ].map((doc) => (
                  <li key={doc} className="flex items-start gap-2 text-sm text-stone-700">
                    <span className="text-forest-400 mt-0.5 flex-shrink-0">◦</span>
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-sm text-center">
            Merci de vous présenter <strong>15 minutes avant le début</strong> de chaque session. En cas d'empêchement, contactez Mme TRANQUARD Élodie au <strong>+33 6 77 12 87 27</strong>.
          </div>
        </div>
      </section>

      {/* ── Formulaire d'inscription ───────────────────────────────────────── */}
      <section id="inscription" className="py-20 bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-forest-100 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">Pré-inscription</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-forest-950 mb-4">S'inscrire à la session Avril 2026</h2>
            <p className="text-stone-600 max-w-xl mx-auto">
              Remplissez ce formulaire pour exprimer votre intérêt. Notre équipe vous contactera sous 15 jours pour organiser votre entretien de motivation.
            </p>
          </div>

          {submitted ? (
            <div className="bg-forest-50 border border-forest-300 rounded-3xl p-12 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-display font-bold text-forest-900 text-2xl mb-2">Demande envoyée !</h3>
              <p className="text-forest-700 mb-6">
                Merci pour votre intérêt. Notre équipe vous contactera dans les <strong>15 jours</strong> pour organiser votre entretien de motivation.
              </p>
              <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-forest-600 hover:bg-forest-500 text-white font-semibold rounded-xl transition-colors">
                ← Retour à l'accueil
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Prénom *</label>
                  <input type="text" required value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    placeholder="Votre prénom"
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nom *</label>
                  <input type="text" required value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Votre nom"
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email *</label>
                  <input type="email" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Téléphone *</label>
                  <input type="tel" required value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+594 6XX XX XX XX"
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Site de formation souhaité *</label>
                <select required value={formData.lieu}
                  onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent bg-white">
                  <option value="">Sélectionnez un site</option>
                  <option value="kourou">Kourou — LFTG (site principal)</option>
                  <option value="macouria">Macouria — CFPPA</option>
                  <option value="sinnamary">Sinnamary</option>
                  <option value="regina">Régina</option>
                  <option value="saint-laurent">Saint-Laurent-du-Maroni</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Situation professionnelle actuelle</label>
                <select value={formData.situation}
                  onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent bg-white">
                  <option value="">Sélectionnez votre situation</option>
                  <option value="exploitant">Exploitant agricole</option>
                  <option value="salarie">Salarié d'exploitation agricole</option>
                  <option value="demandeur">Demandeur d'emploi</option>
                  <option value="reconversion">En reconversion professionnelle</option>
                  <option value="etudiant">Étudiant / Jeune</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Message / Motivation</label>
                <textarea value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Décrivez brièvement votre projet d'élevage, votre expérience avec les animaux, et vos motivations pour cette formation..."
                  rows={5}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent resize-none" />
              </div>
              <div className="bg-stone-50 rounded-xl p-4 text-stone-500 text-xs">
                En soumettant ce formulaire, vous acceptez d'être contacté par l'équipe LFTG dans le cadre de votre demande d'inscription. Vos données ne seront pas transmises à des tiers.
              </div>
              {submitStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">Une erreur est survenue. Veuillez réessayer ou nous contacter directement à lftg973@gmail.com.</div>
              )}
              <button type="submit"
                disabled={submitStatus === 'sending'}
                className="w-full py-3.5 bg-forest-600 hover:bg-forest-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-md text-base">
                {submitStatus === 'sending' ? 'Envoi en cours...' : 'Envoyer ma demande d’inscription →'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-forest-100 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-forest-950 mb-4">Questions fréquentes</h2>
          </div>
          <div className="space-y-3">
            <Accordion title="Faut-il déjà avoir des animaux pour s'inscrire ?">
              Non, il n'est pas nécessaire de posséder des animaux avant la formation. La formation vous prépare justement à obtenir les autorisations légales nécessaires pour détenir des animaux non domestiques. Cependant, une expérience ou une passion pour les animaux est fortement valorisée lors de l'entretien de motivation.
            </Accordion>
            <Accordion title="La formation est-elle finançable via le CPF ?">
              Oui, la formation CCAND-EGG est éligible au Compte Personnel de Formation (CPF). Elle est également finançable via les OPCO pour les salariés, et via le dispositif FEADER/PDRG Mesure 01 pour les acteurs agricoles. Contactez-nous pour vous accompagner dans les démarches de financement.
            </Accordion>
            <Accordion title="Quelle est la durée totale de la formation ?">
              La formation comprend 22h de théorie et 50h de pratique par espèce couverte, conformément à l'arrêté du 12 décembre 2000 modifié. La durée totale varie selon le nombre d'espèces choisies et les expériences préalables du candidat. Elle inclut également 2 périodes de stage obligatoire en entreprise (PAE).
            </Accordion>
            <Accordion title="Peut-on suivre la formation à distance ?">
              La formation est proposée en format mixte (blended learning) : les modules théoriques peuvent être suivis à distance via la plateforme en ligne LFTG, tandis que les modules pratiques se déroulent obligatoirement en présentiel sur les sites de formation. Cette organisation permet de concilier formation et activité professionnelle.
            </Accordion>
            <Accordion title="Quels débouchés professionnels après la formation ?">
              À l'issue de la formation, vous pouvez : ouvrir votre propre élevage de gibiers guyanais, travailler comme soigneur animalier dans un parc zoologique ou une ferme pédagogique, devenir formateur-capacitaire, ou intégrer une exploitation agricole spécialisée. Le CCAND est également requis pour certains postes dans les associations de protection animale.
            </Accordion>
            <Accordion title="Comment se déroule l'entretien de motivation ?">
              L'entretien de motivation est individuel et dure environ 30 minutes. Il permet à l'équipe pédagogique d'évaluer votre projet professionnel, votre connaissance de la faune guyanaise et votre motivation. Aucune connaissance technique préalable n'est requise. Une réponse vous est garantie dans les 15 jours suivant l'entretien.
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── Footer de page ─────────────────────────────────────────────────── */}
      <footer className="bg-forest-950 text-forest-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#f5f0e8] flex-shrink-0">
                  <Image src="/lftg_improved_v1.png" alt="Logo LFTG" width={40} height={40} className="object-cover w-full h-full" />
                </div>
                <div>
                  <span className="text-white font-display font-bold text-sm block">LFTG Formation</span>
                  <span className="text-forest-400 text-xs">Centre de Formation</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Organisme de formation agréé par la Préfecture de Guyane — N° 03973232797<br />
                SIRET : 813 099 215 000 28
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>📍 PK 20,5 Route du Dégrad Saramacca, 97310 Kourou</li>
                <li>📞 +594 694 96 13 76</li>
                <li>📞 +33 6 77 12 87 27 (secrétariat)</li>
                <li>✉️ lftg973@gmail.com</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Partenaires</h4>
              <ul className="space-y-2 text-sm">
                <li>🦜 FEGG — Fédération des Éleveurs de Gibiers de Guyane</li>
                <li>🌱 CFPPA de Macouria</li>
                <li>🇪🇺 Europe s'engage en Guyane / FEADER</li>
                <li>🏛 Préfecture de Guyane</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-forest-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-forest-500">© 2026 LFTG — La Ferme Tropicale de Guyane. Tous droits réservés.</p>
            <Link href="/" className="text-forest-400 hover:text-forest-200 text-sm transition-colors">← Retour à l'accueil</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
