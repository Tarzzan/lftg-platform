'use client';

import React, { useState, useEffect } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Course {
  id: string;
  title: string;
  description?: string;
  level?: string;
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
    desc: 'Conservation des espèces endémiques de Guyane française, lutte contre le trafic d\'animaux sauvages et préservation des habitats naturels amazoniens.',
  },
  {
    icon: '🎓',
    title: 'Formation professionnelle',
    desc: 'Certifications CCAND et RNCP Soigneur Animalier, FPA, formations spécialisées en zootechnie tropicale et élevage de gibiers guyanais.',
  },
  {
    icon: '🦜',
    title: 'Sensibilisation',
    desc: 'Éducation du grand public à la biodiversité amazonienne, visites pédagogiques, ateliers scolaires et événements de sensibilisation.',
  },
  {
    icon: '🤝',
    title: 'Insertion sociale',
    desc: 'Lutte contre l\'illettrisme, formation professionnelle agricole, soutien à la néonatalité et accompagnement des publics éloignés de l\'emploi.',
  },
];

const ESPECES = [
  { nom: 'Agouti', latin: 'Dasyprocta leporina', statut: 'LC', emoji: '🐾' },
  { nom: 'Pécari à collier', latin: 'Pecari tajacu', statut: 'LC', emoji: '🐗' },
  { nom: 'Caïman noir', latin: 'Melanosuchus niger', statut: 'EN', emoji: '🐊' },
  { nom: 'Ara chloroptère', latin: 'Ara chloropterus', statut: 'LC', emoji: '🦜' },
  { nom: 'Anaconda vert', latin: 'Eunectes murinus', statut: 'LC', emoji: '🐍' },
  { nom: 'Tortue charbonnière', latin: 'Chelonoidis carbonaria', statut: 'VU', emoji: '🐢' },
];

const STATUT_COLORS: Record<string, string> = {
  LC: 'bg-green-100 text-green-800',
  VU: 'bg-yellow-100 text-yellow-800',
  EN: 'bg-orange-100 text-orange-800',
  CR: 'bg-red-100 text-red-800',
};

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

  // Scroll listener pour la navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Charger les cours publics
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
    fetch(`${apiUrl}/plugins/formation/courses`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || data.courses || []);
        setCourses(list);
      })
      .catch(() => setCourses([]));
  }, []);

  // Soumission du formulaire de contact
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
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ─── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-forest-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <span className="text-xl">🌿</span>
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">La Ferme Tropicale</div>
                <div className="text-green-300 text-xs">de Guyane</div>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {[
                { label: 'Association', id: 'association' },
                { label: 'Missions', id: 'missions' },
                { label: 'Formations', id: 'formations' },
                { label: 'Faune', id: 'faune' },
                { label: 'Contact', id: 'contact' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <a
                href={HELLOASSO_ADHESION}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
              >
                Adhérer
              </a>
              <a
                href="/login"
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full border border-white/20 transition-colors"
              >
                Espace membres →
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white p-2 flex flex-col gap-1.5"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
              <span className="block w-6 h-0.5 bg-white"></span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-forest-900/98 backdrop-blur-md border-t border-white/10 px-4 py-4 space-y-3">
            {[
              { label: 'Association', id: 'association' },
              { label: 'Missions', id: 'missions' },
              { label: 'Formations', id: 'formations' },
              { label: 'Faune', id: 'faune' },
              { label: 'Contact', id: 'contact' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left text-white/80 hover:text-white py-2 border-b border-white/10 text-sm"
              >
                {item.label}
              </button>
            ))}
            <a href={HELLOASSO_ADHESION} target="_blank" rel="noopener noreferrer"
              className="block bg-green-500 text-white text-center py-2 rounded-lg font-semibold mt-2 text-sm">
              Adhérer à l'association
            </a>
            <a href="/login"
              className="block bg-white/10 text-white text-center py-2 rounded-lg border border-white/20 mt-2 text-sm">
              Espace membres →
            </a>
          </div>
        )}
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #052e16 0%, #14532d 35%, #166534 65%, #15803d 100%)',
        }}
      >
        {/* Motif de fond */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #4ade80 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, #22c55e 0%, transparent 50%)`,
          }}
        />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-10">
            <span className="text-green-300 text-base">🌿</span>
            <span className="text-white/90 text-sm font-medium">Association loi 1901 — Kourou, Guyane française</span>
          </div>

          {/* Titre */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-3 leading-tight tracking-tight">
            La Ferme Tropicale
          </h1>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-green-400 mb-8 leading-tight">
            de Guyane
          </h2>

          <p className="text-xl sm:text-2xl text-white/75 mb-4 max-w-2xl mx-auto leading-relaxed">
            Protection de la faune guyanaise, formation professionnelle certifiante et sensibilisation à la biodiversité amazonienne.
          </p>

          <p className="text-lg text-green-300/80 italic mb-12">
            "Préserver, Former, Sensibiliser — au cœur de l'Amazonie guyanaise"
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection('association')}
              className="bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5"
            >
              Découvrir l'association ↓
            </button>
            <a
              href="/login"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 border border-white/20 backdrop-blur-sm"
            >
              Espace membres →
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex justify-center">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2 animate-bounce">
              <div className="w-1 h-3 bg-white/60 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ASSOCIATION ─────────────────────────────────────────────────────── */}
      <section id="association" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Qui sommes-nous</span>
              <h2 className="text-4xl font-black text-gray-900 mt-2 mb-6 leading-tight">
                Une association au service de la biodiversité guyanaise
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-5">
                La Ferme Tropicale de Guyane (LFTG) est une association loi 1901 basée à Kourou, en Guyane française.
                Fondée par des passionnés de la faune amazonienne, elle œuvre pour la protection des espèces endémiques
                et la formation des professionnels de l'élevage et de la conservation.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Agréée organisme de formation et certifiée Qualiopi, LFTG propose des certifications reconnues par l'État
                (CCAND, RNCP Soigneur Animalier) ainsi que des formations spécialisées adaptées aux réalités du territoire guyanais.
              </p>

              {/* Chiffres clés */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                {[
                  { value: '10+', label: 'Années d\'expérience' },
                  { value: '200+', label: 'Apprenants formés' },
                  { value: '30+', label: 'Espèces suivies' },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-black text-green-600">{stat.value}</div>
                    <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carte d'identité */}
            <div className="bg-gradient-to-br from-forest-50 to-green-50 rounded-3xl p-8 border border-green-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>📋</span> Carte d'identité
              </h3>
              <dl className="space-y-4">
                {[
                  { label: 'Statut', value: 'Association loi 1901' },
                  { label: 'Siège social', value: 'Kourou, Guyane française (97310)' },
                  { label: 'SIRET', value: '852 247 867 00011' },
                  { label: 'Agrément', value: 'Organisme certifié Qualiopi' },
                  { label: 'Domaines', value: 'Faune sauvage, Élevage, Formation pro' },
                  { label: 'Contact', value: 'lftg973@gmail.com' },
                ].map(item => (
                  <div key={item.label} className="flex gap-4">
                    <dt className="text-gray-400 text-sm w-28 flex-shrink-0 font-medium">{item.label}</dt>
                    <dd className="text-gray-800 text-sm">{item.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 pt-6 border-t border-green-200 flex gap-3">
                <a
                  href={HELLOASSO_ADHESION}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white text-center py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  🤝 Adhérer
                </a>
                <a
                  href={HELLOASSO_DON}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white hover:bg-gray-50 text-green-700 text-center py-3 rounded-xl font-semibold text-sm border border-green-200 transition-colors"
                >
                  💚 Faire un don
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MISSIONS ────────────────────────────────────────────────────────── */}
      <section id="missions" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Ce que nous faisons</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Nos missions</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
              Quatre piliers fondamentaux guident l'action de La Ferme Tropicale de Guyane au quotidien.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MISSIONS.map(m => (
              <div
                key={m.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 group hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-green-100 transition-colors">
                  {m.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{m.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FORMATIONS ──────────────────────────────────────────────────────── */}
      <section id="formations" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Catalogue</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Nos formations</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
              Des certifications reconnues et des formations spécialisées adaptées aux réalités du territoire guyanais.
              Cliquez sur une formation pour voir le programme détaillé.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-lg">Chargement du catalogue de formations...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="text-left bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-br from-forest-800 to-green-700 p-6">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mb-3">
                      🎓
                    </div>
                    <h3 className="text-white font-bold text-lg leading-tight">{course.title}</h3>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    {course.description && (
                      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {course.level && (
                          <span className="bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                            {course.level}
                          </span>
                        )}
                        {course.chapters && (
                          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                            {course.chapters.length} module{course.chapters.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <span className="text-green-600 text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                        Voir →
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <a
              href="/login"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-4 rounded-2xl transition-colors shadow-lg hover:shadow-green-500/25"
            >
              Accéder à l'espace de formation →
            </a>
          </div>
        </div>
      </section>

      {/* ─── MODAL PRÉVISUALISATION COURS ────────────────────────────────────── */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-forest-800 to-green-700 p-6 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-green-300 text-sm font-medium mb-1">Aperçu de la formation</div>
                  <h3 className="text-white text-2xl font-black leading-tight">{selectedCourse.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-white/60 hover:text-white text-2xl leading-none ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body scrollable */}
            <div className="overflow-y-auto flex-1 p-6">
              {selectedCourse.description && (
                <p className="text-gray-600 leading-relaxed mb-6 text-base">{selectedCourse.description}</p>
              )}

              {selectedCourse.chapters && selectedCourse.chapters.length > 0 ? (
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <span>📖</span> Programme de la formation
                  </h4>
                  <div className="space-y-3">
                    {selectedCourse.chapters.map((chapter, ci) => (
                      <div key={chapter.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
                          <span className="w-7 h-7 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {ci + 1}
                          </span>
                          <span className="font-semibold text-gray-800 text-sm flex-1">{chapter.title}</span>
                          <span className="text-gray-400 text-xs flex-shrink-0">
                            {chapter.lessons?.length || 0} séance{(chapter.lessons?.length || 0) > 1 ? 's' : ''}
                          </span>
                        </div>
                        {chapter.lessons && chapter.lessons.length > 0 && (
                          <ul className="divide-y divide-gray-100">
                            {chapter.lessons.map((lesson, li) => (
                              <li key={lesson.id} className="px-4 py-2.5 flex items-center gap-3 text-sm text-gray-600">
                                <span className="w-5 h-5 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                  {li + 1}
                                </span>
                                {lesson.title}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm">Le programme détaillé sera disponible prochainement.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <a
                href="/login"
                className="flex-1 bg-green-600 hover:bg-green-500 text-white text-center py-3 rounded-xl font-semibold transition-colors"
              >
                S'inscrire à cette formation →
              </a>
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── FAUNE GUYANAISE ─────────────────────────────────────────────────── */}
      <section id="faune" className="py-20 bg-gradient-to-br from-forest-900 to-green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-green-400 font-semibold text-sm uppercase tracking-wider">Biodiversité</span>
            <h2 className="text-4xl font-black text-white mt-2">Faune guyanaise suivie</h2>
            <p className="text-white/60 mt-4 max-w-2xl mx-auto text-lg">
              Quelques espèces emblématiques que nous accompagnons dans leur conservation et leur élevage.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ESPECES.map(esp => (
              <div
                key={esp.nom}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{esp.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold">{esp.nom}</div>
                    <div className="text-white/50 text-sm italic truncate">{esp.latin}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${STATUT_COLORS[esp.statut] || 'bg-gray-100 text-gray-800'}`}>
                    {esp.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-white/40 text-sm mt-8">
            LC = Préoccupation mineure · VU = Vulnérable · EN = En danger · CR = En danger critique
          </p>
        </div>
      </section>

      {/* ─── ADHÉSION / SOUTIEN ──────────────────────────────────────────────── */}
      <section id="adhesion" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Rejoignez-nous</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Soutenez notre mission</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
              Devenez acteur de la préservation de la biodiversité guyanaise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Adhésion */}
            <div className="border-2 border-green-200 rounded-3xl p-8 hover:border-green-400 transition-colors">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Adhérer à l'association</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Devenez membre actif de LFTG et participez à nos actions de conservation,
                de formation et de sensibilisation à la biodiversité guyanaise.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'Accès aux événements membres',
                  'Participation aux assemblées générales',
                  'Newsletter et actualités exclusives',
                  'Réductions sur les formations',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="text-green-500 font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
              <a
                href={HELLOASSO_ADHESION}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-600 hover:bg-green-500 text-white text-center py-4 rounded-2xl font-bold text-lg transition-colors"
              >
                Adhérer via HelloAsso →
              </a>
            </div>

            {/* Don */}
            <div className="border-2 border-gray-200 rounded-3xl p-8 hover:border-green-200 transition-colors">
              <div className="text-4xl mb-4">💚</div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Faire un don</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Votre soutien financier nous permet de poursuivre nos missions de protection
                de la faune guyanaise et de formation des professionnels du secteur.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'Reçu fiscal pour déduction d\'impôts',
                  'Financement des soins vétérinaires',
                  'Soutien aux programmes de formation',
                  'Conservation des espèces menacées',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="text-green-500 font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
              <a
                href={HELLOASSO_DON}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white hover:bg-gray-50 text-green-700 text-center py-4 rounded-2xl font-bold text-lg border-2 border-green-200 hover:border-green-400 transition-colors"
              >
                Faire un don via HelloAsso →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Nous écrire</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Contactez-nous</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
              Une question sur nos formations, nos activités ou un partenariat ?
              Notre équipe vous répondra dans les meilleurs délais.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Infos de contact */}
            <div className="space-y-6">
              {[
                { icon: '📍', label: 'Adresse', value: 'Kourou, Guyane française (97310)' },
                { icon: '✉️', label: 'Email', value: 'lftg973@gmail.com' },
                { icon: '🌐', label: 'Site web', value: 'lftg.info' },
                { icon: '⏰', label: 'Horaires', value: 'Lun–Ven, 8h–17h (heure locale)' },
              ].map(item => (
                <div key={item.label} className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">{item.label}</div>
                    <div className="text-gray-800 font-medium mt-0.5 text-sm">{item.value}</div>
                  </div>
                </div>
              ))}

              {/* Réseaux sociaux */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Suivez-nous</div>
                <div className="flex gap-3">
                  <a href="https://lftg.info" target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center text-lg transition-colors">
                    🌐
                  </a>
                  <a href={HELLOASSO_ADHESION} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 bg-green-100 hover:bg-green-200 rounded-xl flex items-center justify-center text-lg transition-colors">
                    🤝
                  </a>
                </div>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              {contactStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Merci pour votre message. Notre équipe vous répondra dans les meilleurs délais.
                  </p>
                  <button
                    onClick={() => setContactStatus('idle')}
                    className="mt-6 text-green-600 hover:text-green-500 font-medium text-sm"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nom complet <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.senderName}
                        onChange={e => setContactForm(f => ({ ...f, senderName: e.target.value }))}
                        placeholder="Jean Dupont"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.senderEmail}
                        onChange={e => setContactForm(f => ({ ...f, senderEmail: e.target.value }))}
                        placeholder="jean@exemple.fr"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+594 6 00 00 00 00"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Sujet <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={contactForm.subject}
                        onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Choisir un sujet...</option>
                        <option value="Formation CCAND">Formation CCAND</option>
                        <option value="Formation RNCP Soigneur Animalier">Formation RNCP Soigneur Animalier</option>
                        <option value="Formation FPA">Formation FPA</option>
                        <option value="Adhésion">Adhésion à l'association</option>
                        <option value="Don / Partenariat">Don / Partenariat</option>
                        <option value="Visite pédagogique">Visite pédagogique</option>
                        <option value="Autre">Autre demande</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={contactForm.message}
                      onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Décrivez votre demande en détail..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {contactStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                      Une erreur s'est produite. Veuillez réessayer ou nous contacter directement par email à lftg973@gmail.com.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={contactStatus === 'sending'}
                    className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-colors text-lg"
                  >
                    {contactStatus === 'sending' ? '⏳ Envoi en cours...' : 'Envoyer le message →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-forest-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Logo + desc */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">🌿</div>
                <div>
                  <div className="font-bold text-base">La Ferme Tropicale de Guyane</div>
                  <div className="text-green-400 text-sm">Association loi 1901</div>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                Protection de la faune guyanaise, formation professionnelle certifiante et sensibilisation
                à la biodiversité amazonienne depuis Kourou, Guyane française.
              </p>
            </div>

            {/* Liens rapides */}
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-green-400">Liens rapides</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Association', id: 'association' },
                  { label: 'Missions', id: 'missions' },
                  { label: 'Formations', id: 'formations' },
                  { label: 'Faune guyanaise', id: 'faune' },
                  { label: 'Contact', id: 'contact' },
                ].map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Soutenir */}
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-green-400">Nous soutenir</h4>
              <ul className="space-y-2">
                <li>
                  <a href={HELLOASSO_ADHESION} target="_blank" rel="noopener noreferrer"
                    className="text-white/60 hover:text-white text-sm transition-colors">
                    Adhérer à l'association
                  </a>
                </li>
                <li>
                  <a href={HELLOASSO_DON} target="_blank" rel="noopener noreferrer"
                    className="text-white/60 hover:text-white text-sm transition-colors">
                    Faire un don
                  </a>
                </li>
                <li>
                  <a href="/login" className="text-white/60 hover:text-white text-sm transition-colors">
                    Espace membres
                  </a>
                </li>
                <li>
                  <a href="https://lftg.info" target="_blank" rel="noopener noreferrer"
                    className="text-white/60 hover:text-white text-sm transition-colors">
                    Site officiel lftg.info
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} La Ferme Tropicale de Guyane — Tous droits réservés
            </p>
            <p className="text-white/40 text-sm">
              SIRET : 852 247 867 00011 · Kourou, Guyane française
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
