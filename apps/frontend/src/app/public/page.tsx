'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { stockApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface PublicCourse {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: number;
  category: string;
  coverImage?: string;
  imageUrl?: string;
  isPublic: boolean;
  tags?: string;
}

/* ─────────────────────────────────────────────
   HOOK — Scroll parallax
───────────────────────────────────────────── */
function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrollY;
}

/* ─────────────────────────────────────────────
   HOOK — Intersection Observer (reveal on scroll)
───────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─────────────────────────────────────────────
   COMPOSANT — Navbar
───────────────────────────────────────────── */
function Navbar({ scrollY }: { scrollY: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isScrolled = scrollY > 60;

  const navLinks = [
    { label: 'Association', href: '#association' },
    { label: 'Missions', href: '#missions' },
    { label: 'Formations', href: '#formations' },
    { label: 'Faune', href: '#faune' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0d2b1a]/95 backdrop-blur-md shadow-2xl shadow-black/30 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 group"
        >
          <div className="relative w-10 h-10">
            <Image src="/mascot_peco.webp" alt="Péco" fill className="object-contain drop-shadow-lg group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-left">
            <div className="text-white font-bold text-sm leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              La Ferme Tropicale
            </div>
            <div className="text-[#c17f3a] text-xs font-medium">de Guyane</div>
          </div>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-white/80 hover:text-[#c17f3a] text-sm font-medium transition-colors duration-200 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#c17f3a] group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm text-white/80 hover:text-white border border-white/20 hover:border-white/50 rounded-full transition-all duration-200"
          >
            Espace membres
          </Link>
          <a
            href="https://www.helloasso.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-semibold text-white bg-[#c17f3a] hover:bg-[#d4924a] rounded-full transition-all duration-200 shadow-lg shadow-[#c17f3a]/30"
          >
            Adhérer
          </a>
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-2"
          aria-label="Menu"
        >
          <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`w-6 h-0.5 bg-white mt-1.5 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-6 h-0.5 bg-white mt-1.5 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d2b1a]/98 backdrop-blur-md border-t border-white/10 px-6 py-4 space-y-3">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-white/80 hover:text-[#c17f3a] py-2 text-sm font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link href="/auth/login" className="text-center py-2 text-sm text-white border border-white/20 rounded-full">
              Espace membres
            </Link>
            <a href="https://www.helloasso.com" target="_blank" rel="noopener noreferrer"
              className="text-center py-2 text-sm font-semibold text-white bg-[#c17f3a] rounded-full">
              Adhérer
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────────────────────────────
   COMPOSANT — Hero
───────────────────────────────────────────── */
function HeroSection({ scrollY }: { scrollY: number }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image avec parallax */}
      <div
        className="absolute inset-0 scale-110"
        style={{ transform: `scale(1.1) translateY(${scrollY * 0.3}px)` }}
      >
        <Image
          src="/hero_background.webp"
          alt="Forêt tropicale de Guyane"
          fill
          priority
          className="object-cover"
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d2b1a]/90 via-[#0d2b1a]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d2b1a] via-transparent to-transparent" />

      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#c17f3a]/40 animate-pulse"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2 + i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Contenu hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Texte */}
          <div className={`transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c17f3a]/20 border border-[#c17f3a]/40 rounded-full text-[#c17f3a] text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#c17f3a] animate-pulse" />
              Association loi 1901 — Kourou, Guyane française
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              La Ferme{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c17f3a] to-[#f0b060]">
                Tropicale
              </span>
              <br />de Guyane
            </h1>

            <p className="text-lg text-white/75 leading-relaxed mb-8 max-w-lg">
              Protection de la faune amazonienne, formation professionnelle certifiante
              et sensibilisation à la biodiversité guyanaise depuis Kourou.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#formations"
                className="group px-8 py-4 bg-[#c17f3a] hover:bg-[#d4924a] text-white font-semibold rounded-full transition-all duration-300 shadow-xl shadow-[#c17f3a]/40 hover:shadow-[#c17f3a]/60 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Nos formations
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>
              <a
                href="https://www.helloasso.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-full transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
              >
                Adhérer à l'association
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              {[
                { value: '15+', label: 'Espèces protégées' },
                { value: '200+', label: 'Membres formés' },
                { value: 'Qualiopi', label: 'Certification' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-[#c17f3a]" style={{ fontFamily: 'Georgia, serif' }}>{stat.value}</div>
                  <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mascottes */}
          <div className={`hidden lg:flex items-end justify-center gap-8 pb-8 transition-all duration-1000 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {/* Péco */}
            <div className="relative group" style={{ animation: 'float 4s ease-in-out infinite' }}>
              <div className="relative w-52 h-64 drop-shadow-2xl">
                <Image src="/mascot_peco.webp" alt="Péco le pécari" fill className="object-contain group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0d2b1a]/80 backdrop-blur-sm border border-[#c17f3a]/30 rounded-full px-4 py-1 text-white text-xs font-medium whitespace-nowrap">
                Péco 🐗
              </div>
            </div>

            {/* Capi */}
            <div className="relative group" style={{ animation: 'float 4s ease-in-out infinite', animationDelay: '1.5s' }}>
              <div className="relative w-44 h-56 drop-shadow-2xl">
                <Image src="/mascot_capi.webp" alt="Capi le capucin" fill className="object-contain group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0d2b1a]/80 backdrop-blur-sm border border-[#2d7d7d]/30 rounded-full px-4 py-1 text-white text-xs font-medium whitespace-nowrap">
                Capi 🐒
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs">
        <span>Découvrir</span>
        <div className="w-0.5 h-8 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
      </div>

      {/* Vague de transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#faf7f2" />
        </svg>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPOSANT — Section Association
───────────────────────────────────────────── */
function AssociationSection() {
  const { ref, visible } = useReveal();

  return (
    <section id="association" className="py-24 bg-[#faf7f2]">
      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          {/* Texte */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a4731]/10 rounded-full text-[#1a4731] text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              Notre association
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#0d2b1a] leading-tight mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              Une mission au cœur<br />
              <span className="text-[#1a4731]">de l'Amazonie guyanaise</span>
            </h2>
            <p className="text-[#4a5568] leading-relaxed mb-4 text-lg">
              Fondée à Kourou en Guyane française, la <strong className="text-[#1a4731]">Ferme Tropicale de Guyane</strong> est
              une association loi 1901 dédiée à la protection de la faune sauvage amazonienne
              et à la formation professionnelle dans le domaine animalier.
            </p>
            <p className="text-[#4a5568] leading-relaxed mb-8">
              Notre établissement accueille des espèces endémiques de Guyane, offre des formations
              certifiantes reconnues par l'État et sensibilise le grand public à la richesse de
              la biodiversité guyanaise.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.helloasso.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#1a4731] hover:bg-[#0d2b1a] text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Adhérer à l'association
              </a>
              <a
                href="https://www.helloasso.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border-2 border-[#c17f3a] text-[#c17f3a] hover:bg-[#c17f3a] hover:text-white font-semibold rounded-full transition-all duration-300"
              >
                Faire un don
              </a>
            </div>
          </div>

          {/* Carte info */}
          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-[#1a4731]/10 border border-[#1a4731]/5">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-[#1a4731]/10 flex items-center justify-center">
                  <div className="relative w-10 h-10">
                    <Image src="/mascot_peco.webp" alt="LFTG" fill className="object-contain" />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-[#0d2b1a] text-lg" style={{ fontFamily: 'Georgia, serif' }}>La Ferme Tropicale de Guyane</div>
                  <div className="text-[#1a4731] text-sm font-medium">Association loi 1901</div>
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
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-medium">{item.label}</div>
                      <div className="text-[#0d2b1a] font-medium text-sm mt-0.5">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Décoration */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#c17f3a]/10 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#1a4731]/10 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPOSANT — Section Missions
───────────────────────────────────────────── */
function MissionsSection() {
  const { ref, visible } = useReveal();

  const missions = [
    {
      icon: '🌿',
      title: 'Protection de la faune',
      desc: 'Conservation des espèces endémiques de Guyane française, lutte contre le trafic d\'animaux sauvages et préservation des habitats naturels amazoniens.',
      color: '#1a4731',
    },
    {
      icon: '🎓',
      title: 'Formation professionnelle',
      desc: 'Certifications CCAND et RNCP Soigneur Animalier, FPA, formations spécialisées en zootechnie tropicale et élevage de gibiers guyanais.',
      color: '#2d7d7d',
    },
    {
      icon: '🦜',
      title: 'Sensibilisation',
      desc: 'Éducation du grand public à la biodiversité amazonienne, visites pédagogiques, ateliers scolaires et événements de sensibilisation.',
      color: '#c17f3a',
    },
    {
      icon: '🤝',
      title: 'Insertion sociale',
      desc: 'Lutte contre l\'illettrisme, formation professionnelle agricole, soutien à la néonatalité et accompagnement des publics éloignés de l\'emploi.',
      color: '#7b5ea7',
    },
  ];

  return (
    <section id="missions" className="relative py-24 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image src="/bg_missions.webp" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-[#0d2b1a]/88" />
      </div>

      {/* Vague haut */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full rotate-180">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#faf7f2" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c17f3a]/20 border border-[#c17f3a]/30 rounded-full text-[#c17f3a] text-sm font-medium mb-6">
            Nos missions
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Quatre piliers d'action
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Notre engagement pour la faune guyanaise se décline en quatre axes complémentaires.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {missions.map((mission, i) => (
            <div
              key={mission.title}
              className={`group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-default transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: `${mission.color}25`, border: `1px solid ${mission.color}40` }}
              >
                {mission.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-3" style={{ fontFamily: 'Georgia, serif' }}>{mission.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{mission.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vague bas */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#faf7f2" />
        </svg>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPOSANT — Section Formations
───────────────────────────────────────────── */
function FormationsSection() {
  const { ref, visible } = useReveal();
  const [selectedCourse, setSelectedCourse] = useState<PublicCourse | null>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['public-courses'],
    queryFn: async () => {
      const res = await fetch('/api/v1/plugins/formation/courses?publicOnly=true');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const levelLabels: Record<string, string> = {
    BEGINNER: 'Débutant',
    INTERMEDIATE: 'Intermédiaire',
    ADVANCED: 'Avancé',
    EXPERT: 'Expert',
  };

  const levelColors: Record<string, string> = {
    BEGINNER: '#1a4731',
    INTERMEDIATE: '#2d7d7d',
    ADVANCED: '#c17f3a',
    EXPERT: '#7b5ea7',
  };

  return (
    <section id="formations" className="py-24 bg-[#faf7f2]">
      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a4731]/10 rounded-full text-[#1a4731] text-sm font-medium mb-6">
            🎓 Formations certifiantes
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0d2b1a] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Nos programmes de formation
          </h2>
          <p className="text-[#4a5568] text-lg max-w-2xl mx-auto">
            Des formations professionnelles certifiantes pour les passionnés de la faune sauvage guyanaise.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <Image src="/mascot_capi.webp" alt="Capi" fill className="object-contain" />
            </div>
            <p className="text-[#4a5568] text-lg">Les formations arrivent bientôt !</p>
            <p className="text-[#4a5568]/60 text-sm mt-2">Revenez nous voir prochainement.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: PublicCourse, i: number) => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#1a4731]/15 transition-all duration-500 hover:-translate-y-2 cursor-pointer transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Image de couverture */}
                <div className="relative h-56 overflow-hidden">
                  {course.coverImage || course.imageUrl ? (
                    <Image
                      src={course.coverImage || course.imageUrl || ''}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="relative h-full">
                      <Image src="/formation_bg.webp" alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-white text-xs font-semibold backdrop-blur-sm"
                      style={{ backgroundColor: `${levelColors[course.level] || '#1a4731'}cc` }}
                    >
                      {levelLabels[course.level] || course.level}
                    </span>
                    {course.duration && (
                      <span className="px-3 py-1 rounded-full bg-black/40 text-white text-xs backdrop-blur-sm">
                        ⏱ {course.duration} min
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <div className="text-[#c17f3a] text-xs font-semibold uppercase tracking-wider mb-2">
                    {course.category}
                  </div>
                  <h3 className="text-[#0d2b1a] font-bold text-xl mb-3 group-hover:text-[#1a4731] transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
                    {course.title}
                  </h3>
                  <p className="text-[#4a5568] text-sm leading-relaxed line-clamp-3 mb-4">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-[#1a4731] text-sm font-semibold group-hover:text-[#c17f3a] transition-colors">
                      Voir le programme →
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#1a4731]/10 flex items-center justify-center group-hover:bg-[#c17f3a] transition-colors">
                      <svg className="w-4 h-4 text-[#1a4731] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#1a4731] hover:bg-[#0d2b1a] text-white font-semibold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Accéder à l'espace formation complet
          </Link>
        </div>
      </div>

      {/* Modal cours */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-64">
              {selectedCourse.coverImage || selectedCourse.imageUrl ? (
                <Image src={selectedCourse.coverImage || selectedCourse.imageUrl || ''} alt={selectedCourse.title} fill className="object-cover rounded-t-3xl" />
              ) : (
                <Image src="/formation_bg.webp" alt="" fill className="object-cover rounded-t-3xl" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-t-3xl" />
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-6">
                <h3 className="text-white text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>{selectedCourse.title}</h3>
              </div>
            </div>
            <div className="p-8">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-[#1a4731]/10 text-[#1a4731] rounded-full text-sm font-medium">
                  {levelLabels[selectedCourse.level] || selectedCourse.level}
                </span>
                {selectedCourse.duration && (
                  <span className="px-3 py-1 bg-[#c17f3a]/10 text-[#c17f3a] rounded-full text-sm font-medium">
                    ⏱ {selectedCourse.duration} min
                  </span>
                )}
                <span className="px-3 py-1 bg-[#2d7d7d]/10 text-[#2d7d7d] rounded-full text-sm font-medium">
                  {selectedCourse.category}
                </span>
              </div>
              <p className="text-[#4a5568] leading-relaxed mb-8">{selectedCourse.description}</p>
              <Link
                href="/auth/login"
                className="block text-center px-8 py-4 bg-[#1a4731] hover:bg-[#0d2b1a] text-white font-semibold rounded-full transition-all duration-300"
              >
                S'inscrire à cette formation →
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPOSANT — Section Faune
───────────────────────────────────────────── */
function FauneSection() {
  const { ref, visible } = useReveal();

  const species = [
    { name: 'Agouti', latin: 'Dasyprocta leporina', status: 'LC', desc: 'Rongeur forestier emblématique de la forêt amazonienne guyanaise.' },
    { name: 'Pécari à collier', latin: 'Pecari tajacu', status: 'LC', desc: 'Suidé sauvage vivant en groupes familiaux dans les forêts tropicales.' },
    { name: 'Caïman noir', latin: 'Melanosuchus niger', status: 'EN', desc: 'Le plus grand crocodilien d\'Amérique du Sud, en danger d\'extinction.' },
    { name: 'Ara chloroptère', latin: 'Ara chloropterus', status: 'LC', desc: 'Le plus grand ara du monde, aux couleurs éclatantes rouge et vert.' },
    { name: 'Anaconda vert', latin: 'Eunectes murinus', status: 'LC', desc: 'Le plus lourd serpent du monde, prédateur aquatique des marécages.' },
    { name: 'Tortue charbonnière', latin: 'Chelonoidis carbonaria', status: 'VU', desc: 'Tortue terrestre vulnérable, symbole de la faune guyanaise.' },
  ];

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    LC: { bg: '#1a4731', text: 'white', label: 'Préoccupation mineure' },
    VU: { bg: '#c17f3a', text: 'white', label: 'Vulnérable' },
    EN: { bg: '#c0392b', text: 'white', label: 'En danger' },
    CR: { bg: '#7b1d1d', text: 'white', label: 'En danger critique' },
  };

  return (
    <section id="faune" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Illustration faune */}
          <div className="relative rounded-3xl overflow-hidden mb-16 h-80 lg:h-96">
            <Image src="/wildlife_showcase.webp" alt="Faune guyanaise" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d2b1a]/80 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="px-12 max-w-lg">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c17f3a]/20 border border-[#c17f3a]/30 rounded-full text-[#c17f3a] text-sm font-medium mb-4">
                  🦜 Faune guyanaise
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                  Espèces que nous protégeons
                </h2>
                <p className="text-white/70">
                  La Guyane abrite l'une des biodiversités les plus riches du monde.
                </p>
              </div>
            </div>
          </div>

          {/* Grille espèces */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {species.map((sp, i) => {
              const statusInfo = statusColors[sp.status] || statusColors.LC;
              return (
                <div
                  key={sp.name}
                  className={`group bg-[#faf7f2] hover:bg-white border border-[#1a4731]/8 hover:border-[#1a4731]/20 rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-[#0d2b1a] text-lg group-hover:text-[#1a4731] transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
                        {sp.name}
                      </h3>
                      <div className="text-[#4a5568]/60 text-xs italic mt-0.5">{sp.latin}</div>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}
                    >
                      {sp.status}
                    </span>
                  </div>
                  <p className="text-[#4a5568] text-sm leading-relaxed">{sp.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Légende */}
          <div className="flex flex-wrap justify-center gap-4 mt-10 pt-8 border-t border-gray-100">
            {Object.entries(statusColors).map(([code, info]) => (
              <div key={code} className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: info.bg, color: info.text }}>
                  {code}
                </span>
                <span className="text-[#4a5568] text-sm">{info.label}</span>
              </div>
            ))}
            <span className="text-[#4a5568]/50 text-xs self-center">Source : Liste rouge UICN</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPOSANT — Section Contact
───────────────────────────────────────────── */
function ContactSection() {
  const { ref, visible } = useReveal();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    await new Promise(r => setTimeout(r, 1500));
    setStatus('sent');
  };

  return (
    <section id="contact" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d2b1a] via-[#1a4731] to-[#0d2b1a]" />
      <div className="absolute inset-0 opacity-20">
        <Image src="/bg_missions.webp" alt="" fill className="object-cover" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-16 items-start transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Info contact */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#c17f3a]/20 border border-[#c17f3a]/30 rounded-full text-[#c17f3a] text-sm font-medium mb-6">
              📬 Nous contacter
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              Parlons de<br />votre projet
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Vous souhaitez en savoir plus sur nos formations, adhérer à l'association
              ou simplement nous rendre visite à Kourou ? N'hésitez pas à nous écrire.
            </p>

            <div className="space-y-4 mb-10">
              {[
                { icon: '📧', label: 'Email', value: 'lftg973@gmail.com' },
                { icon: '📍', label: 'Adresse', value: 'Kourou, Guyane française (973)' },
                { icon: '🌐', label: 'Site web', value: 'lftg.info' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-white/50 text-xs uppercase tracking-wider">{item.label}</div>
                    <div className="text-white font-medium">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mascotte Capi */}
            <div className="flex items-end gap-4">
              <div className="relative w-24 h-28 flex-shrink-0" style={{ animation: 'float 3s ease-in-out infinite' }}>
                <Image src="/mascot_capi.webp" alt="Capi" fill className="object-contain drop-shadow-xl" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-none px-5 py-3 text-white/80 text-sm">
                On vous répond dans les plus brefs délais ! 🌿
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
            <h3 className="text-white font-bold text-2xl mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              Envoyez-nous un message
            </h3>

            {status === 'sent' ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h4 className="text-white font-bold text-xl mb-2">Message envoyé !</h4>
                <p className="text-white/60">Nous vous répondrons dans les plus brefs délais.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/70 text-sm mb-1.5 block">Votre nom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jean Dupont"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c17f3a] transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-1.5 block">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="jean@exemple.fr"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c17f3a] transition-colors text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-1.5 block">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+594 6 00 00 00 00"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c17f3a] transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-1.5 block">Sujet *</label>
                  <select
                    required
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c17f3a] transition-colors text-sm"
                  >
                    <option value="" className="bg-[#1a4731]">Choisir un sujet...</option>
                    <option value="formations" className="bg-[#1a4731]">Renseignements sur les formations</option>
                    <option value="adhesion" className="bg-[#1a4731]">Adhésion à l'association</option>
                    <option value="visite" className="bg-[#1a4731]">Visite de l'établissement</option>
                    <option value="don" className="bg-[#1a4731]">Don ou partenariat</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-1.5 block">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Décrivez votre demande en détail..."
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c17f3a] transition-colors text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-4 bg-[#c17f3a] hover:bg-[#d4924a] disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#c17f3a]/30 hover:shadow-[#c17f3a]/50"
                >
                  {status === 'sending' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : '📬 Envoyer le message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPOSANT — Footer
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-[#060f09] text-white/60 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Jungle divider */}
        <div className="relative h-24 mb-12 -mt-12 overflow-hidden">
          <Image src="/jungle_divider.webp" alt="" fill className="object-cover object-top opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#060f09]" />
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                <Image src="/mascot_peco.webp" alt="Péco" fill className="object-contain" />
              </div>
              <div>
                <div className="text-white font-bold" style={{ fontFamily: 'Georgia, serif' }}>La Ferme Tropicale de Guyane</div>
                <div className="text-[#c17f3a] text-xs">Association loi 1901</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Protection de la faune amazonienne, formation professionnelle certifiante
              et sensibilisation à la biodiversité guyanaise depuis Kourou.
            </p>
            <div className="text-xs">SIRET : 852 247 867 00011</div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Navigation</h4>
            <div className="space-y-2 text-sm">
              {['Association', 'Missions', 'Formations', 'Faune', 'Contact'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="block hover:text-[#c17f3a] transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Liens */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Liens utiles</h4>
            <div className="space-y-2 text-sm">
              <Link href="/auth/login" className="block hover:text-[#c17f3a] transition-colors">Espace membres</Link>
              <a href="https://www.helloasso.com" target="_blank" rel="noopener noreferrer" className="block hover:text-[#c17f3a] transition-colors">Adhésion HelloAsso</a>
              <a href="https://www.helloasso.com" target="_blank" rel="noopener noreferrer" className="block hover:text-[#c17f3a] transition-colors">Don HelloAsso</a>
              <a href="https://lftg.info" target="_blank" rel="noopener noreferrer" className="block hover:text-[#c17f3a] transition-colors">Site officiel lftg.info</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <span>© {new Date().getFullYear()} La Ferme Tropicale de Guyane — Tous droits réservés</span>
          <span className="text-white/30">Kourou, Guyane française 🌿</span>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────────── */
export default function PublicPage() {
  const scrollY = useScrollY();

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        html { scroll-behavior: smooth; }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className="min-h-screen">
        <Navbar scrollY={scrollY} />
        <HeroSection scrollY={scrollY} />
        <AssociationSection />
        <MissionsSection />
        <FormationsSection />
        <FauneSection />
        <ContactSection />
        <Footer />
      </div>
    </>
  );
}
