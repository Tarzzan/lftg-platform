'use client';
import React, { useState, useEffect, useRef } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Course {
  id: string;
  title: string;
  description?: string;
  level?: string;
  duration?: number;
  category?: string;
  coverImage?: string;
  imageUrl?: string;
  isPublic?: boolean;
  tags?: string[];
  chapters?: { id: string; title: string; lessons: { id: string; title: string }[] }[];
}

interface ContactForm {
  senderName: string;
  senderEmail: string;
  phone: string;
  subject: string;
  message: string;
}

// ─── Constantes ────────────────────────────────────────────────────────────────
const HELLOASSO_ADHESION = 'https://www.helloasso.com/associations/la-ferme-tropicale-de-guyane/adhesions/adhesion-lftg-2025';
const HELLOASSO_DON = 'https://www.helloasso.com/associations/la-ferme-tropicale-de-guyane/formulaires/1';

const MISSIONS = [
  {
    icon: '🌿',
    title: 'Protection de la faune',
    desc: "Conservation des espèces endémiques de Guyane française, lutte contre le trafic d'animaux sauvages et préservation des habitats naturels amazoniens.",
    color: 'from-forest-600 to-forest-400',
  },
  {
    icon: '🎓',
    title: 'Formation professionnelle',
    desc: 'Certifications CCAND et RNCP Soigneur Animalier, FPA, formations spécialisées en zootechnie tropicale et élevage de gibiers guyanais.',
    color: 'from-laterite-600 to-gold-400',
  },
  {
    icon: '🦜',
    title: 'Sensibilisation',
    desc: "Éducation du grand public à la biodiversité amazonienne, visites pédagogiques, ateliers scolaires et événements de sensibilisation.",
    color: 'from-maroni-700 to-maroni-400',
  },
  {
    icon: '🤝',
    title: 'Insertion sociale',
    desc: "Lutte contre l'illettrisme, formation professionnelle agricole, soutien à la néonatalité et accompagnement des publics éloignés de l'emploi.",
    color: 'from-wood-700 to-wood-500',
  },
];

const ESPECES = [
  { nom: 'Agouti', latin: 'Dasyprocta leporina', statut: 'LC', emoji: '🐾', desc: "Rongeur forestier emblématique de la forêt amazonienne guyanaise." },
  { nom: 'Pécari à collier', latin: 'Pecari tajacu', statut: 'LC', emoji: '🐗', desc: "Suidé sauvage vivant en groupes familiaux dans les forêts tropicales." },
  { nom: 'Caïman noir', latin: 'Melanosuchus niger', statut: 'EN', emoji: '🐊', desc: "Le plus grand crocodilien d'Amérique du Sud, en danger d'extinction." },
  { nom: 'Ara chloroptère', latin: 'Ara chloropterus', statut: 'LC', emoji: '🦜', desc: "Le plus grand ara du monde, aux couleurs éclatantes rouge et vert." },
  { nom: 'Anaconda vert', latin: 'Eunectes murinus', statut: 'LC', emoji: '🐍', desc: "Le plus lourd serpent du monde, prédateur aquatique des marécages." },
  { nom: 'Tortue charbonnière', latin: 'Chelonoidis carbonaria', statut: 'VU', emoji: '🐢', desc: "Tortue terrestre vulnérable, symbole de la faune guyanaise." },
];

const STATUT_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  LC: { label: 'Préoccupation mineure', bg: 'bg-forest-100', text: 'text-forest-700' },
  VU: { label: 'Vulnérable', bg: 'bg-gold-100', text: 'text-gold-700' },
  EN: { label: 'En danger', bg: 'bg-laterite-100', text: 'text-laterite-700' },
  CR: { label: 'En danger critique', bg: 'bg-red-100', text: 'text-red-700' },
};

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  'débutant':      { label: 'Débutant',      color: 'bg-forest-100 text-forest-700' },
  'intermédiaire': { label: 'Intermédiaire', color: 'bg-gold-100 text-gold-700' },
  'avancé':        { label: 'Avancé',        color: 'bg-laterite-100 text-laterite-700' },
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  'Soins animaliers': 'from-forest-700 to-forest-500',
  'Sécurité': 'from-laterite-600 to-gold-500',
  'Gestion de stock': 'from-maroni-700 to-maroni-500',
  'Réglementation': 'from-wood-700 to-wood-500',
  'Premiers secours': 'from-red-700 to-red-500',
  'Autre': 'from-forest-800 to-maroni-600',
};

// ─── Mascotte Péco (Pécari) ────────────────────────────────────────────────────
function PecoMascot({ size = 120, mood = 'happy' }: { size?: number; mood?: 'happy' | 'wave' | 'think' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
    >
      <style>{`
        @keyframes peco-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes peco-ear-left {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes peco-ear-right {
          0%, 100% { transform: rotate(5deg); }
          50% { transform: rotate(-5deg); }
        }
        @keyframes peco-tail {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes peco-wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-20deg); }
          75% { transform: rotate(20deg); }
        }
        .peco-body { animation: peco-float 3s ease-in-out infinite; transform-origin: center; }
        .peco-ear-l { animation: peco-ear-left 2s ease-in-out infinite; transform-origin: bottom center; }
        .peco-ear-r { animation: peco-ear-right 2s ease-in-out infinite; transform-origin: bottom center; }
        .peco-tail { animation: peco-tail 1.5s ease-in-out infinite; transform-origin: left center; }
        .peco-arm { animation: peco-wave 1.2s ease-in-out infinite; transform-origin: top center; }
      `}</style>

      <g className="peco-body">
        {/* Corps principal */}
        <ellipse cx="60" cy="72" rx="28" ry="24" fill="#6B4C3B" />
        {/* Bande blanche caractéristique du pécari à collier */}
        <ellipse cx="60" cy="58" rx="22" ry="6" fill="#E8D5C4" opacity="0.9" />
        {/* Tête */}
        <ellipse cx="60" cy="44" rx="22" ry="20" fill="#7A5544" />
        {/* Museau */}
        <ellipse cx="60" cy="54" rx="12" ry="9" fill="#8B6355" />
        <ellipse cx="60" cy="56" rx="8" ry="5" fill="#5C3D2E" />
        {/* Narines */}
        <circle cx="57" cy="56" r="2" fill="#3D2B1F" />
        <circle cx="63" cy="56" r="2" fill="#3D2B1F" />
        {/* Yeux */}
        <circle cx="52" cy="40" r="5" fill="#1A1A1A" />
        <circle cx="68" cy="40" r="5" fill="#1A1A1A" />
        <circle cx="53.5" cy="38.5" r="1.5" fill="white" />
        <circle cx="69.5" cy="38.5" r="1.5" fill="white" />
        {/* Oreilles */}
        <ellipse className="peco-ear-l" cx="42" cy="28" rx="7" ry="10" fill="#7A5544" />
        <ellipse className="peco-ear-l" cx="42" cy="29" rx="4" ry="6" fill="#C4927A" />
        <ellipse className="peco-ear-r" cx="78" cy="28" rx="7" ry="10" fill="#7A5544" />
        <ellipse className="peco-ear-r" cx="78" cy="29" rx="4" ry="6" fill="#C4927A" />
        {/* Pattes avant */}
        <ellipse cx="40" cy="85" rx="8" ry="12" fill="#6B4C3B" />
        <ellipse cx="80" cy="85" rx="8" ry="12" fill="#6B4C3B" />
        {/* Sabots */}
        <ellipse cx="40" cy="95" rx="7" ry="4" fill="#3D2B1F" />
        <ellipse cx="80" cy="95" rx="7" ry="4" fill="#3D2B1F" />
        {/* Queue */}
        <ellipse className="peco-tail" cx="88" cy="68" rx="5" ry="8" fill="#7A5544" />
        {/* Sourire */}
        {mood === 'happy' && (
          <path d="M 54 50 Q 60 55 66 50" stroke="#3D2B1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        )}
        {/* Bras levé si wave */}
        {mood === 'wave' && (
          <g className="peco-arm">
            <ellipse cx="36" cy="72" rx="6" ry="14" fill="#7A5544" transform="rotate(-30 36 72)" />
            <ellipse cx="30" cy="62" rx="5" ry="4" fill="#8B6355" />
          </g>
        )}
      </g>
    </svg>
  );
}

// ─── Mascotte Capi (Capucin) ───────────────────────────────────────────────────
function CapiMascot({ size = 120, mood = 'happy' }: { size?: number; mood?: 'happy' | 'wave' | 'think' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
    >
      <style>{`
        @keyframes capi-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-5px) rotate(-2deg); }
          66% { transform: translateY(-3px) rotate(2deg); }
        }
        @keyframes capi-tail-curl {
          0%, 100% { d: path("M 85 75 Q 100 65 105 50 Q 108 35 95 30"); }
          50% { d: path("M 85 75 Q 102 60 108 45 Q 112 30 98 28"); }
        }
        @keyframes capi-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes capi-wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-25deg); }
          75% { transform: rotate(25deg); }
        }
        .capi-body { animation: capi-float 3.5s ease-in-out infinite; transform-origin: center; }
        .capi-eye { animation: capi-blink 4s ease-in-out infinite; transform-origin: center; }
        .capi-arm-wave { animation: capi-wave 1s ease-in-out infinite; transform-origin: top center; }
      `}</style>

      <g className="capi-body">
        {/* Queue enroulée */}
        <path d="M 85 75 Q 100 65 105 50 Q 108 35 95 30" stroke="#4A3728" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M 85 75 Q 100 65 105 50 Q 108 35 95 30" stroke="#6B5040" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Corps */}
        <ellipse cx="58" cy="75" rx="24" ry="22" fill="#8B6B50" />
        {/* Ventre clair */}
        <ellipse cx="58" cy="76" rx="14" ry="14" fill="#D4B896" />
        {/* Tête */}
        <ellipse cx="58" cy="46" rx="22" ry="22" fill="#8B6B50" />
        {/* Calotte sombre caractéristique du capucin */}
        <ellipse cx="58" cy="34" rx="18" ry="14" fill="#3D2B1F" />
        {/* Visage clair */}
        <ellipse cx="58" cy="50" rx="14" ry="12" fill="#D4B896" />
        {/* Yeux */}
        <g className="capi-eye">
          <circle cx="51" cy="45" r="5" fill="#1A1A1A" />
          <circle cx="65" cy="45" r="5" fill="#1A1A1A" />
          <circle cx="52.5" cy="43.5" r="1.5" fill="white" />
          <circle cx="66.5" cy="43.5" r="1.5" fill="white" />
        </g>
        {/* Nez */}
        <ellipse cx="58" cy="52" rx="4" ry="3" fill="#5C3D2E" />
        <circle cx="56.5" cy="51.5" r="1" fill="#3D2B1F" />
        <circle cx="59.5" cy="51.5" r="1" fill="#3D2B1F" />
        {/* Sourire */}
        {mood === 'happy' && (
          <path d="M 52 56 Q 58 62 64 56" stroke="#5C3D2E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        )}
        {/* Oreilles */}
        <circle cx="36" cy="44" r="8" fill="#8B6B50" />
        <circle cx="36" cy="44" r="5" fill="#C4927A" />
        <circle cx="80" cy="44" r="8" fill="#8B6B50" />
        <circle cx="80" cy="44" r="5" fill="#C4927A" />
        {/* Bras */}
        <ellipse cx="36" cy="78" rx="7" ry="14" fill="#8B6B50" transform="rotate(15 36 78)" />
        {mood === 'wave' ? (
          <g className="capi-arm-wave">
            <ellipse cx="80" cy="72" rx="7" ry="14" fill="#8B6B50" transform="rotate(-30 80 72)" />
            <ellipse cx="74" cy="62" rx="6" ry="5" fill="#D4B896" />
          </g>
        ) : (
          <ellipse cx="80" cy="78" rx="7" ry="14" fill="#8B6B50" transform="rotate(-15 80 78)" />
        )}
        {/* Mains */}
        <ellipse cx="30" cy="89" rx="6" ry="5" fill="#D4B896" />
        <ellipse cx="86" cy="89" rx="6" ry="5" fill="#D4B896" />
        {/* Jambes */}
        <ellipse cx="48" cy="94" rx="8" ry="10" fill="#8B6B50" />
        <ellipse cx="68" cy="94" rx="8" ry="10" fill="#8B6B50" />
        {/* Pieds */}
        <ellipse cx="46" cy="103" rx="9" ry="5" fill="#6B5040" />
        <ellipse cx="70" cy="103" rx="9" ry="5" fill="#6B5040" />
      </g>
    </svg>
  );
}

// ─── Composant CourseCard public ───────────────────────────────────────────────
function PublicCourseCard({ course, onClick }: { course: Course; onClick: () => void }) {
  const level = LEVEL_CONFIG[course.level || ''] || null;
  const gradient = CATEGORY_GRADIENTS[course.category || ''] || 'from-forest-700 to-maroni-600';
  const totalLessons = course.chapters?.flatMap((c) => c.lessons)?.length ?? 0;
  const coverSrc = course.coverImage || course.imageUrl;

  return (
    <div
      className="group cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border border-forest-100"
      onClick={onClick}
    >
      {/* Image de fond */}
      <div className={`relative h-44 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {coverSrc ? (
          <img src={coverSrc} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-5xl filter drop-shadow-md">🌿</span>
            <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">{course.category || 'Formation'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {level && (
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${level.color}`}>
            {level.label}
          </div>
        )}
        {course.duration && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            <span>⏱</span>
            <span>{course.duration} min</span>
          </div>
        )}
      </div>
      {/* Contenu */}
      <div className="p-5">
        <h3 className="font-bold text-forest-900 text-base leading-tight mb-2 group-hover:text-forest-700 transition-colors line-clamp-2">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-forest-600 text-sm leading-relaxed line-clamp-2 mb-3">{course.description}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-forest-50">
          <span className="text-forest-500 text-xs">{totalLessons > 0 ? `${totalLessons} leçon${totalLessons > 1 ? 's' : ''}` : course.category || 'Formation'}</span>
          <span className="text-laterite-600 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            Voir le programme <span>→</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────
export default function PublicPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>({
    senderName: '', senderEmail: '', phone: '', subject: '', message: '',
  });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Charger les cours publics uniquement
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
    fetch(`${apiUrl}/plugins/formation/courses?publicOnly=true`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || data.courses || []);
        setCourses(list);
      })
      .catch(() => setCourses([]));
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const res = await fetch(`${apiUrl}/plugins/contact/messages`, {
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

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const navLinks = [
    { label: 'Association', id: 'association' },
    { label: 'Missions', id: 'missions' },
    { label: 'Formations', id: 'formations' },
    { label: 'Faune', id: 'faune' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans">
      {/* ─── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-forest-900/95 backdrop-blur-md shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => scrollToSection('hero')} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-forest-600 rounded-xl flex items-center justify-center text-xl shadow-md group-hover:bg-forest-500 transition-colors">
              🌿
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-sm leading-tight tracking-wide">La Ferme Tropicale</div>
              <div className="text-forest-300 text-xs">de Guyane</div>
            </div>
          </button>

          {/* Nav desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA + burger */}
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden sm:flex items-center gap-2 bg-laterite-600 hover:bg-laterite-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-md"
            >
              <span>🔑</span> Espace membres
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden bg-forest-900/98 backdrop-blur-md border-t border-white/10 px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="block w-full text-left text-white/80 hover:text-white text-sm font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
              >
                {link.label}
              </button>
            ))}
            <a
              href="/login"
              className="flex items-center gap-2 bg-laterite-600 text-white text-sm font-semibold px-4 py-3 rounded-xl mt-2"
            >
              <span>🔑</span> Espace membres
            </a>
          </div>
        )}
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d2b1a 0%, #1a4731 40%, #2d7d7d 100%)',
        }}
      >
        {/* Motif de feuilles en arrière-plan */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="leaves" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <text x="10" y="40" fontSize="30" opacity="0.5">🌿</text>
                <text x="50" y="70" fontSize="20" opacity="0.3">🍃</text>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#leaves)" />
          </svg>
        </div>

        {/* Cercles décoratifs */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-forest-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-maroni-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Texte */}
            <div>
              <div className="inline-flex items-center gap-2 bg-forest-500/20 border border-forest-400/30 text-forest-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <span>🌿</span>
                <span>Association loi 1901 — Kourou, Guyane française</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
                style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                La Ferme<br />
                <span className="text-forest-300">Tropicale</span><br />
                de Guyane
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
                Protection de la faune amazonienne, formation professionnelle certifiante et sensibilisation à la biodiversité guyanaise depuis Kourou.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToSection('formations')}
                  className="flex items-center gap-2 bg-laterite-600 hover:bg-laterite-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-laterite-500/30 hover:-translate-y-0.5"
                >
                  <span>🎓</span> Nos formations
                </button>
                <a
                  href={HELLOASSO_ADHESION}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition-all backdrop-blur-sm"
                >
                  <span>🤝</span> Adhérer
                </a>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
                {[
                  { value: '15+', label: 'Espèces protégées' },
                  { value: '200+', label: 'Membres formés' },
                  { value: '10+', label: "Années d'expérience" },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-white/50 text-xs mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mascottes */}
            <div className="hidden lg:flex items-end justify-center gap-8 pb-8">
              <div className="flex flex-col items-center gap-2">
                <PecoMascot size={160} mood="happy" />
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm font-medium">
                  Péco 🐗
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 mb-8">
                <CapiMascot size={140} mood="wave" />
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm font-medium">
                  Capi 🐒
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vague de transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 20C1200 70 960 0 720 30C480 60 240 10 0 40L0 80Z" fill="#faf7f2" />
          </svg>
        </div>
      </section>

      {/* ─── ASSOCIATION ─────────────────────────────────────────────────────── */}
      <section id="association" className="py-24 bg-[#faf7f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-forest-100 text-forest-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <span>🌿</span> Notre association
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-forest-900 mb-6 leading-tight"
                style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                Une mission au cœur<br />de l'Amazonie guyanaise
              </h2>
              <p className="text-forest-700 text-base leading-relaxed mb-4">
                Fondée à Kourou en Guyane française, la <strong>Ferme Tropicale de Guyane</strong> est une association loi 1901 dédiée à la protection de la faune sauvage amazonienne et à la formation professionnelle dans le domaine animalier.
              </p>
              <p className="text-forest-700 text-base leading-relaxed mb-6">
                Notre établissement accueille des espèces endémiques de Guyane, offre des formations certifiantes reconnues par l'État et sensibilise le grand public à la richesse de la biodiversité guyanaise.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={HELLOASSO_ADHESION}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-forest-700 hover:bg-forest-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  🤝 Adhérer à l'association
                </a>
                <a
                  href={HELLOASSO_DON}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border-2 border-laterite-400 text-laterite-700 hover:bg-laterite-50 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  💛 Faire un don
                </a>
              </div>
            </div>
            {/* Carte info */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-forest-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-forest-100 rounded-2xl flex items-center justify-center text-3xl">🌿</div>
                <div>
                  <div className="font-bold text-forest-900 text-lg">La Ferme Tropicale de Guyane</div>
                  <div className="text-forest-500 text-sm">Association loi 1901</div>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { icon: '📍', label: 'Localisation', value: 'Kourou, Guyane française' },
                  { icon: '🏢', label: 'SIRET', value: '852 247 867 00011' },
                  { icon: '🎓', label: 'Certification', value: 'Qualiopi — Formation professionnelle' },
                  { icon: '📧', label: 'Contact', value: 'lftg973@gmail.com' },
                  { icon: '🌐', label: 'Site officiel', value: 'lftg.info' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 py-3 border-b border-forest-50 last:border-0">
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <div>
                      <div className="text-forest-500 text-xs font-medium uppercase tracking-wider">{item.label}</div>
                      <div className="text-forest-900 text-sm font-semibold mt-0.5">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MISSIONS ────────────────────────────────────────────────────────── */}
      <section id="missions" className="py-24 bg-forest-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="leaves2" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <text x="10" y="50" fontSize="40" opacity="0.5">🌿</text>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#leaves2)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-forest-700/50 text-forest-300 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <span>🎯</span> Nos missions
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
              Quatre piliers d'action
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Notre engagement pour la faune guyanaise se décline en quatre axes complémentaires.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MISSIONS.map((mission) => (
              <div key={mission.title} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:-translate-y-1 group">
                <div className={`w-14 h-14 bg-gradient-to-br ${mission.color} rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  {mission.icon}
                </div>
                <h3 className="font-bold text-white text-base mb-3">{mission.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{mission.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FORMATIONS ──────────────────────────────────────────────────────── */}
      <section id="formations" className="py-24 bg-[#faf7f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-laterite-100 text-laterite-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <span>🎓</span> Formations certifiantes
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-forest-900 mb-4"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
              Nos programmes de formation
            </h2>
            <p className="text-forest-600 max-w-xl mx-auto">
              Des formations professionnelles certifiantes pour les passionnés de la faune sauvage guyanaise.
            </p>
          </div>

          {courses.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {courses.map((course) => (
                  <PublicCourseCard
                    key={course.id}
                    course={course}
                    onClick={() => setSelectedCourse(course)}
                  />
                ))}
              </div>
              <div className="text-center">
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 bg-forest-700 hover:bg-forest-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 text-sm"
                >
                  <span>🔑</span> Accéder à l'espace formation complet
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="flex justify-center gap-8 mb-6">
                <PecoMascot size={100} mood="think" />
                <CapiMascot size={100} mood="think" />
              </div>
              <h3 className="text-forest-700 font-semibold text-lg mb-2">Formations bientôt disponibles</h3>
              <p className="text-forest-500 text-sm mb-6">Nos programmes sont en cours de mise à jour. Revenez bientôt !</p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 bg-forest-700 hover:bg-forest-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                <span>🔑</span> Espace membres
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ─── FAUNE ───────────────────────────────────────────────────────────── */}
      <section id="faune" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-maroni-100 text-maroni-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <span>🦜</span> Faune guyanaise
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-forest-900 mb-4"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
              Espèces que nous protégeons
            </h2>
            <p className="text-forest-600 max-w-xl mx-auto">
              La Guyane abrite l'une des biodiversités les plus riches du monde. Voici quelques espèces emblématiques que nous accueillons et protégeons.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ESPECES.map((espece) => {
              const statut = STATUT_CONFIG[espece.statut] || STATUT_CONFIG.LC;
              return (
                <div key={espece.nom} className="bg-[#faf7f2] rounded-2xl p-5 border border-forest-100 hover:border-forest-300 hover:shadow-md transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-forest-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {espece.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-forest-900 text-base">{espece.nom}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statut.bg} ${statut.text}`}>
                          {espece.statut}
                        </span>
                      </div>
                      <div className="text-forest-500 text-xs italic mb-2">{espece.latin}</div>
                      <p className="text-forest-600 text-sm leading-relaxed">{espece.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Légende UICN */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {Object.entries(STATUT_CONFIG).map(([code, cfg]) => (
              <div key={code} className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{code}</span>
                <span className="text-forest-500 text-xs">{cfg.label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-forest-400 text-xs mt-3">Source : Liste rouge UICN</p>
        </div>
      </section>

      {/* ─── CONTACT ─────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 bg-[#faf7f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Info */}
            <div>
              <div className="inline-flex items-center gap-2 bg-forest-100 text-forest-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <span>📬</span> Nous contacter
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-forest-900 mb-6"
                style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                Parlons de votre projet
              </h2>
              <p className="text-forest-600 leading-relaxed mb-8">
                Vous souhaitez en savoir plus sur nos formations, adhérer à l'association ou simplement nous rendre visite à Kourou ? N'hésitez pas à nous écrire.
              </p>
              <div className="space-y-4">
                {[
                  { icon: '📧', label: 'Email', value: 'lftg973@gmail.com' },
                  { icon: '📍', label: 'Adresse', value: 'Kourou, Guyane française (973)' },
                  { icon: '🌐', label: 'Site web', value: 'lftg.info' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-forest-100 shadow-sm">
                    <div className="w-11 h-11 bg-forest-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-forest-500 text-xs font-medium uppercase tracking-wider">{item.label}</div>
                      <div className="text-forest-900 font-semibold text-sm">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Mascottes contact */}
              <div className="flex items-end gap-4 mt-8">
                <PecoMascot size={80} mood="happy" />
                <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-md border border-forest-100 text-sm text-forest-700 max-w-xs">
                  On vous répond dans les plus brefs délais ! 🌿
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-forest-100">
              {contactStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <CapiMascot size={100} mood="wave" />
                  </div>
                  <h3 className="text-forest-900 font-bold text-xl mb-2">Message envoyé !</h3>
                  <p className="text-forest-600 text-sm">Merci pour votre message. Nous vous répondrons très bientôt.</p>
                  <button
                    onClick={() => setContactStatus('idle')}
                    className="mt-6 text-forest-600 hover:text-forest-800 text-sm font-medium underline"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <h3 className="text-forest-900 font-bold text-lg mb-6">Envoyez-nous un message</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-forest-700 text-sm font-medium mb-1.5">Votre nom *</label>
                      <input
                        required
                        value={contactForm.senderName}
                        onChange={e => setContactForm(f => ({ ...f, senderName: e.target.value }))}
                        placeholder="Jean Dupont"
                        className="w-full border border-forest-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all bg-[#faf7f2]"
                      />
                    </div>
                    <div>
                      <label className="block text-forest-700 text-sm font-medium mb-1.5">Email *</label>
                      <input
                        required
                        type="email"
                        value={contactForm.senderEmail}
                        onChange={e => setContactForm(f => ({ ...f, senderEmail: e.target.value }))}
                        placeholder="jean@exemple.fr"
                        className="w-full border border-forest-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all bg-[#faf7f2]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-forest-700 text-sm font-medium mb-1.5">Téléphone</label>
                    <input
                      value={contactForm.phone}
                      onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+594 6 00 00 00 00"
                      className="w-full border border-forest-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all bg-[#faf7f2]"
                    />
                  </div>
                  <div>
                    <label className="block text-forest-700 text-sm font-medium mb-1.5">Sujet *</label>
                    <select
                      required
                      value={contactForm.subject}
                      onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full border border-forest-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all bg-[#faf7f2]"
                    >
                      <option value="">Choisir un sujet...</option>
                      <option value="formation">Renseignements sur les formations</option>
                      <option value="adhesion">Adhésion à l'association</option>
                      <option value="visite">Visite de l'établissement</option>
                      <option value="don">Don ou partenariat</option>
                      <option value="autre">Autre demande</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-forest-700 text-sm font-medium mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Décrivez votre demande en détail..."
                      className="w-full border border-forest-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all resize-none bg-[#faf7f2]"
                    />
                  </div>
                  {contactStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                      Une erreur s'est produite. Veuillez réessayer ou nous contacter directement à lftg973@gmail.com.
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={contactStatus === 'sending'}
                    className="w-full bg-forest-700 hover:bg-forest-600 disabled:bg-forest-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    {contactStatus === 'sending' ? '⏳ Envoi en cours...' : '📬 Envoyer le message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-forest-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-forest-700 rounded-2xl flex items-center justify-center text-2xl">🌿</div>
                <div>
                  <div className="font-bold text-base">La Ferme Tropicale de Guyane</div>
                  <div className="text-forest-400 text-sm">Association loi 1901</div>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-5">
                Protection de la faune guyanaise, formation professionnelle certifiante et sensibilisation à la biodiversité amazonienne depuis Kourou.
              </p>
              <div className="flex gap-3">
                <a href={HELLOASSO_ADHESION} target="_blank" rel="noopener noreferrer"
                  className="bg-forest-700 hover:bg-forest-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                  Adhérer
                </a>
                <a href={HELLOASSO_DON} target="_blank" rel="noopener noreferrer"
                  className="bg-laterite-700 hover:bg-laterite-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                  Faire un don
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-xs uppercase tracking-widest text-forest-400">Navigation</h4>
              <ul className="space-y-2.5">
                {navLinks.map(link => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className="text-white/50 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-xs uppercase tracking-widest text-forest-400">Liens utiles</h4>
              <ul className="space-y-2.5">
                <li><a href="/login" className="text-white/50 hover:text-white text-sm transition-colors">Espace membres</a></li>
                <li><a href="https://lftg.info" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white text-sm transition-colors">Site officiel lftg.info</a></li>
                <li><a href={HELLOASSO_ADHESION} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white text-sm transition-colors">Adhésion HelloAsso</a></li>
                <li><a href={HELLOASSO_DON} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white text-sm transition-colors">Don HelloAsso</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
              © {new Date().getFullYear()} La Ferme Tropicale de Guyane — Tous droits réservés
            </p>
            <p className="text-white/30 text-sm">
              SIRET : 852 247 867 00011 · Kourou, Guyane française
            </p>
          </div>
        </div>
      </footer>

      {/* ─── MODAL COURS ─────────────────────────────────────────────────────── */}
      {selectedCourse && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div className={`relative h-48 bg-gradient-to-br ${CATEGORY_GRADIENTS[selectedCourse.category || ''] || 'from-forest-700 to-maroni-600'} rounded-t-3xl overflow-hidden`}>
              {(selectedCourse.coverImage || selectedCourse.imageUrl) ? (
                <img src={selectedCourse.coverImage || selectedCourse.imageUrl} alt={selectedCourse.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            {/* Contenu */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="font-bold text-forest-900 text-xl leading-tight"
                  style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                  {selectedCourse.title}
                </h3>
                {selectedCourse.level && LEVEL_CONFIG[selectedCourse.level] && (
                  <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${LEVEL_CONFIG[selectedCourse.level].color}`}>
                    {LEVEL_CONFIG[selectedCourse.level].label}
                  </span>
                )}
              </div>
              {selectedCourse.description && (
                <p className="text-forest-600 text-sm leading-relaxed mb-5">{selectedCourse.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mb-5">
                {selectedCourse.duration && (
                  <div className="flex items-center gap-1.5 bg-forest-50 text-forest-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    <span>⏱</span> {selectedCourse.duration} min
                  </div>
                )}
                {selectedCourse.category && (
                  <div className="flex items-center gap-1.5 bg-laterite-50 text-laterite-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    <span>📚</span> {selectedCourse.category}
                  </div>
                )}
              </div>
              {selectedCourse.chapters && selectedCourse.chapters.length > 0 && (
                <div className="mb-5">
                  <h4 className="font-semibold text-forest-800 text-sm mb-3">Programme</h4>
                  <div className="space-y-2">
                    {selectedCourse.chapters.map((ch, i) => (
                      <div key={ch.id} className="flex items-start gap-3 bg-forest-50 rounded-xl p-3">
                        <div className="w-6 h-6 bg-forest-200 rounded-full flex items-center justify-center text-xs font-bold text-forest-700 flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-medium text-forest-800 text-sm">{ch.title}</div>
                          {ch.lessons?.length > 0 && (
                            <div className="text-forest-500 text-xs mt-0.5">{ch.lessons.length} leçon{ch.lessons.length > 1 ? 's' : ''}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <a
                href="/login"
                className="block w-full bg-forest-700 hover:bg-forest-600 text-white font-bold py-3.5 rounded-2xl text-center transition-all text-sm shadow-md hover:shadow-lg"
              >
                🔑 Accéder à la formation complète
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
