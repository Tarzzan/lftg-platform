'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Animal {
  name: string;
  species: string;
  description: string;
  status: string;
  statusColor: string;
  image: string;
}

interface Formation {
  title: string;
  category: string;
  duration: string;
  level: string;
  description: string;
  icon: string;
}

interface Actualite {
  date: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
}

// ─── Données ──────────────────────────────────────────────────────────────────
const animals: Animal[] = [
  {
    name: 'Pécari à collier',
    species: 'Pecari tajacu',
    description: 'Mammifère emblématique de la forêt amazonienne guyanaise, le pécari à collier vit en groupes familiaux. La LFTG héberge plusieurs individus dans un enclos forestier reconstitué.',
    status: 'Préoccupation mineure',
    statusColor: 'bg-forest-100 text-forest-800',
    image: '/vitrine/pecari.jpg',
  },
  {
    name: 'Chèvres LFTG',
    species: 'Capra aegagrus hircus',
    description: 'Le troupeau de chèvres de la LFTG compte plusieurs femelles et un bouc. Elles participent à la ferme pédagogique et permettent aux apprenants de pratiquer les soins aux animaux domestiques.',
    status: 'Espèce domestique',
    statusColor: 'bg-maroni-100 text-maroni-800',
    image: '/vitrine/chevres.jpg',
  },
  {
    name: 'Toucan toco',
    species: 'Ramphastos toco',
    description: 'Avec son bec orange caractéristique, le toucan toco est l\'un des oiseaux les plus reconnaissables de Guyane. Hébergé dans la volière de la LFTG, il est un ambassadeur de la biodiversité guyanaise.',
    status: 'Préoccupation mineure',
    statusColor: 'bg-forest-100 text-forest-800',
    image: '/vitrine/toucan.jpg',
  },
  {
    name: 'Ara rouge',
    species: 'Ara macao',
    description: 'Perroquet majestueux aux couleurs éclatantes, l\'ara rouge est une espèce protégée en Guyane. La LFTG participe à sa préservation et à la sensibilisation du public à sa protection.',
    status: 'Préoccupation mineure',
    statusColor: 'bg-forest-100 text-forest-800',
    image: '/vitrine/ara_rouge.jpg',
  },
  {
    name: 'Anaconda vert',
    species: 'Eunectes murinus',
    description: 'Le plus grand serpent du monde en masse, l\'anaconda vert est un prédateur aquatique fascinant de la faune guyanaise. Son hébergement à la LFTG permet une sensibilisation aux reptiles souvent mal compris.',
    status: 'Préoccupation mineure',
    statusColor: 'bg-forest-100 text-forest-800',
    image: '/vitrine/anaconda.jpg',
  },
];

const formations: Formation[] = [
  {
    title: 'CCAND',
    category: 'Certificat de Capacité',
    duration: '400 heures',
    level: 'Certification officielle',
    description: 'Le Certificat de Capacité Animalier Non Domestique est obligatoire pour détenir légalement des animaux non domestiques en France. La LFTG est organisme de formation agréé par la Préfecture de Guyane (N°03973232797). En partenariat avec la FEGG et le CFPPA de Macouria.',
    icon: '🏆',
  },
  {
    title: 'RNCP Soigneur animalier',
    category: 'Titre professionnel',
    duration: '260 heures',
    level: 'Niveau 3 (CAP/BEP)',
    description: 'Formation professionnelle certifiante reconnue par l\'État, structurée en 3 blocs de compétences : santé et bien-être des animaux, gestion des installations, et sensibilisation du public à la préservation des espèces.',
    icon: '📋',
  },
  {
    title: 'Formation FPA',
    category: 'Formation Professionnelle Agricole',
    duration: '480 heures',
    level: 'Niveau 4 (Bac)',
    description: 'Formation professionnelle agricole orientée élevage en Guyane. Adaptée aux spécificités de l\'élevage tropical guyanais, avec des modules pratiques sur la faune locale et les techniques d\'élevage en milieu équatorial.',
    icon: '🌿',
  },
  {
    title: 'Zootechnie Générale',
    category: 'Formation continue',
    duration: '240 heures',
    level: 'Tous niveaux',
    description: 'Bases scientifiques de l\'élevage animal : anatomie, physiologie, nutrition, reproduction et pathologies. Formation accessible à tous les passionnés d\'animaux souhaitant approfondir leurs connaissances.',
    icon: '🔬',
  },
];

const actualites: Actualite[] = [
  {
    date: 'Octobre 2024',
    title: 'Naissances au sein du troupeau de chèvres',
    excerpt: 'Doris a donné naissance à des jumeaux (1 mâle et 1 femelle) le 22 octobre 2024. Nala et Futée ont également mis bas en fin de mois. Une belle saison de naissances pour notre troupeau !',
    category: 'Vie de la ferme',
    image: '/vitrine/chevres.jpg',
  },
  {
    date: 'Septembre 2024',
    title: 'Nouvelle session de formation CCAND lancée',
    excerpt: 'La LFTG a accueilli une nouvelle promotion d\'apprenants pour la formation CCAND. Cette session de 400 heures permettra aux participants d\'obtenir leur certificat de capacité animalier non domestique.',
    category: 'Formation',
    image: '/vitrine/formation.jpg',
  },
  {
    date: 'Juillet 2024',
    title: 'Journée de sensibilisation à la biodiversité guyanaise',
    excerpt: 'Plus de 80 visiteurs, dont de nombreux scolaires, ont participé à notre journée portes ouvertes dédiée à la biodiversité guyanaise. Découverte des espèces hébergées et ateliers pédagogiques au programme.',
    category: 'Sensibilisation',
    image: '/vitrine/sensibilisation.jpg',
  },
];

// ─── Composants ───────────────────────────────────────────────────────────────

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-forest-950/95 backdrop-blur-sm border-b border-forest-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#f5f0e8]">
              <Image
                src="/lftg_improved_v1.png"
                alt="Logo LFTG"
                width={40}
                height={40}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div>
              <span className="text-white font-display font-bold text-sm leading-tight block">La Ferme Tropicale</span>
              <span className="text-forest-400 text-xs leading-tight block">de Guyane</span>
            </div>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { href: '#mission', label: 'Notre mission' },
              { href: '#animaux', label: 'Nos animaux' },
              { href: '#formations', label: 'Formations' },
              { href: '#actualites', label: 'Actualités' },
              { href: '#contact', label: 'Contact' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-forest-200 hover:text-white text-sm font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-forest-600 hover:bg-forest-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <span>Espace membres</span>
              <span>→</span>
            </Link>
            {/* Burger mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-forest-300 hover:text-white p-1"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden border-t border-forest-800 py-3 space-y-1">
            {[
              { href: '#mission', label: 'Notre mission' },
              { href: '#animaux', label: 'Nos animaux' },
              { href: '#formations', label: 'Formations' },
              { href: '#actualites', label: 'Actualités' },
              { href: '#contact', label: 'Contact' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-forest-200 hover:text-white text-sm font-medium rounded-md hover:bg-forest-800 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/login"
              className="block px-3 py-2 text-forest-400 hover:text-forest-300 text-sm font-medium"
            >
              Espace membres →
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Image de fond */}
      <div className="absolute inset-0">
        <Image
          src="/vitrine/hero_bg.jpg"
          alt="La Ferme Tropicale de Guyane"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-950/50 to-forest-950/80" />
      </div>

      {/* Contenu */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto pt-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-600/30 border border-forest-500/40 text-forest-300 text-sm font-medium mb-6">
          <span>🌿</span>
          <span>Association loi 1901 — Kourou, Guyane française</span>
        </div>

        {/* Titre */}
        <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-4">
          La Ferme Tropicale
          <br />
          <span className="text-forest-400">de Guyane</span>
        </h1>

        {/* Sous-titre */}
        <p className="text-forest-100 text-lg sm:text-xl max-w-2xl mx-auto mb-3 leading-relaxed">
          Protection de la faune guyanaise, formation professionnelle certifiante et sensibilisation à la biodiversité amazonienne.
        </p>
        <p className="text-forest-300 text-base max-w-xl mx-auto mb-10 italic">
          "Préserver, Former, Sensibiliser — au cœur de l'Amazonie guyanaise"
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#mission"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-forest-600 hover:bg-forest-500 text-white font-semibold rounded-xl transition-all shadow-lftg hover:shadow-lftg-lg"
          >
            <span>Découvrir l&apos;association</span>
            <span>↓</span>
          </a>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl transition-all backdrop-blur-sm"
          >
            <span>Espace membres</span>
            <span>→</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { value: '10+', label: 'Espèces hébergées' },
            { value: '400h', label: 'Formation CCAND' },
            { value: '2016', label: 'Fondée en' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-display font-bold text-forest-400">{stat.value}</div>
              <div className="text-forest-300 text-xs sm:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-forest-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section id="mission" className="py-20 bg-wood-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 bg-forest-100 text-forest-700 text-sm font-semibold rounded-full mb-4">
            Notre mission
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-wood-900 mb-4">
            Une association au service de la biodiversité guyanaise
          </h2>
          <p className="text-wood-600 text-lg max-w-2xl mx-auto">
            Fondée à Kourou, la LFTG agit depuis plusieurs années pour la protection de la faune non domestique, la formation professionnelle et l&apos;éducation environnementale.
          </p>
        </div>

        {/* Trois piliers */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: '🦜',
              color: 'bg-forest-50 border-forest-200',
              iconBg: 'bg-forest-100',
              title: 'Protection animale',
              description: 'La LFTG héberge et soigne des animaux non domestiques de la faune guyanaise dans des enclos adaptés à leurs besoins. Chaque animal bénéficie d\'un suivi vétérinaire rigoureux et d\'une alimentation adaptée à son espèce.',
            },
            {
              icon: '📚',
              color: 'bg-laterite-50 border-laterite-200',
              iconBg: 'bg-laterite-100',
              title: 'Formation professionnelle',
              description: 'Organisme de formation agréé par la Préfecture de Guyane, la LFTG dispense des formations certifiantes reconnues par l\'État : CCAND, RNCP Soigneur animalier, FPA. Nos formations allient théorie et pratique sur le terrain.',
            },
            {
              icon: '🌍',
              color: 'bg-maroni-50 border-maroni-200',
              iconBg: 'bg-maroni-100',
              title: 'Sensibilisation',
              description: 'La LFTG accueille scolaires, familles et professionnels pour des visites pédagogiques et des animations de sensibilisation à la biodiversité amazonienne, aux enjeux de conservation et à la réglementation CITES.',
            },
          ].map((pilier) => (
            <div key={pilier.title} className={`rounded-2xl border p-8 ${pilier.color}`}>
              <div className={`w-14 h-14 rounded-xl ${pilier.iconBg} flex items-center justify-center text-2xl mb-5`}>
                {pilier.icon}
              </div>
              <h3 className="font-display font-bold text-xl text-wood-900 mb-3">{pilier.title}</h3>
              <p className="text-wood-600 leading-relaxed">{pilier.description}</p>
            </div>
          ))}
        </div>

        {/* Bloc informatif */}
        <div className="bg-forest-950 rounded-2xl p-8 sm:p-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-display font-bold text-2xl text-white mb-4">
              Qui sommes-nous ?
            </h3>
            <p className="text-forest-200 leading-relaxed mb-4">
              L&apos;association <strong className="text-forest-400">La Ferme Tropicale de Guyane (LFTG)</strong> est une association loi 1901 dont le siège est situé au PK 20,5 de la Route du Dégrad Saramacca, à Kourou (97310). Elle est dirigée par <strong className="text-forest-400">Mme Élodie Tranquard</strong> et son équipe de soigneurs animaliers.
            </p>
            <p className="text-forest-300 leading-relaxed text-sm">
              La LFTG est enregistrée comme organisme de formation auprès du Préfet de Région de Guyane sous le numéro <strong className="text-forest-400">03973232797</strong>. Son SIRET est le <strong className="text-forest-400">813 099 215 000 28</strong>.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Siège social', value: 'PK 20,5 Route du Dégrad Saramacca, Kourou' },
              { label: 'Téléphone', value: '06 94 96 13 76' },
              { label: 'Email', value: 'lftg973@gmail.com' },
              { label: 'N° formation', value: '03973232797' },
            ].map((info) => (
              <div key={info.label} className="bg-forest-900/50 rounded-xl p-4">
                <div className="text-forest-500 text-xs font-medium uppercase tracking-wide mb-1">{info.label}</div>
                <div className="text-forest-200 text-sm font-medium">{info.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TemoignageSection() {
  return (
    <section className="py-20 bg-forest-950 relative overflow-hidden">
      {/* Motif décoratif */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-forest-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-forest-400 rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Citation Goethe */}
        <div className="text-center mb-14">
          <p className="text-forest-300 text-lg sm:text-xl italic font-light leading-relaxed">
            &laquo;&nbsp;Quoi que tu rêves d&apos;entreprendre, commence-le.
            <br className="hidden sm:block" />
            L&apos;audace a du génie, du pouvoir, de la magie.&nbsp;&raquo;
          </p>
          <p className="text-forest-500 text-sm mt-3">— Johann Wolfgang von Goethe</p>
        </div>

        {/* Témoignage fondateur */}
        <div className="bg-forest-900/60 border border-forest-700 rounded-2xl p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-forest-700 flex items-center justify-center text-3xl">
                🌿
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <div className="font-display font-bold text-white text-lg">Swann MERI</div>
                  <div className="text-forest-400 text-sm">Fondateur FEGG &amp; LFTG &mdash; Formateur-Capacitaire</div>
                </div>
              </div>

              <blockquote className="text-forest-200 leading-relaxed text-sm sm:text-base space-y-3">
                <p>
                  &laquo;&nbsp;Il m&apos;a fallu plusieurs années pour atteindre les capacités animalières. J&apos;ai finalement obtenu mes certifications et ouvertures d&apos;établissement après un parcours long de plusieurs expériences et qualifications professionnelles.
                </p>
                <p>
                  Outre les raisons de l&apos;absence d&apos;accompagnement, de structure de formation et de coordination pour ces types d&apos;élevages au sein de mon territoire — la Guyane — il y avait aussi la complexité des multiples disciplines et différents contenus notionnels abordés au sein du parcours de formation.
                </p>
                <p>
                  Ce qui m&apos;a permis de perserver, c&apos;est ma curiosité et ma passion pour la biologie, la nature, et particulièrement la faune locale qui embellit le paysage local. Aujourd&apos;hui, entouré de l&apos;équipe pédagogique de la LFTG, je propose en tant que formateur-capacitaire un dispositif d&apos;accompagnement individualisé au travers d&apos;une formation certifiante.&nbsp;&raquo;
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimauxSection() {
  const [selected, setSelected] = useState<Animal>(animals[0]);

  return (
    <section id="animaux" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 bg-forest-100 text-forest-700 text-sm font-semibold rounded-full mb-4">
            Nos animaux
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-wood-900 mb-4">
            La faune guyanaise à la LFTG
          </h2>
          <p className="text-wood-600 text-lg max-w-2xl mx-auto">
            Découvrez les espèces hébergées et soignées par notre équipe de soigneurs animaliers professionnels.
          </p>
        </div>

        {/* Galerie interactive */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Liste des animaux */}
          <div className="lg:col-span-2 space-y-3">
            {animals.map((animal) => (
              <button
                key={animal.name}
                onClick={() => setSelected(animal)}
                className={`w-full text-left rounded-xl p-4 border-2 transition-all ${
                  selected.name === animal.name
                    ? 'border-forest-500 bg-forest-50'
                    : 'border-wood-200 bg-white hover:border-forest-300 hover:bg-forest-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <Image src={animal.image} alt={animal.name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="font-semibold text-wood-900 text-sm">{animal.name}</div>
                    <div className="text-wood-500 text-xs italic">{animal.species}</div>
                  </div>
                  {selected.name === animal.name && (
                    <div className="ml-auto text-forest-600">→</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Détail de l'animal sélectionné */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden border border-wood-200 h-full">
              <div className="relative h-64 sm:h-80">
                <Image
                  src={selected.image}
                  alt={selected.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${selected.statusColor} mb-2`}>
                    {selected.status}
                  </span>
                  <h3 className="font-display font-bold text-2xl text-white">{selected.name}</h3>
                  <p className="text-white/70 text-sm italic">{selected.species}</p>
                </div>
              </div>
              <div className="p-6 bg-white">
                <p className="text-wood-600 leading-relaxed">{selected.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FormationsSection() {
  return (
    <section id="formations" className="py-20 bg-forest-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 bg-forest-800 text-forest-300 text-sm font-semibold rounded-full mb-4">
            Nos formations
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
            Devenez soigneur animalier professionnel
          </h2>
          <p className="text-forest-300 text-lg max-w-2xl mx-auto">
            Organisme de formation agréé par la Préfecture de Guyane, la LFTG propose des formations certifiantes reconnues par l&apos;État.
          </p>
        </div>

        {/* Grille des formations */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {formations.map((formation) => (
            <div
              key={formation.title}
              className="bg-forest-900/60 border border-forest-800 rounded-2xl p-7 hover:border-forest-600 transition-colors group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-3xl">{formation.icon}</div>
                <div>
                  <div className="text-forest-400 text-xs font-semibold uppercase tracking-wide mb-1">{formation.category}</div>
                  <h3 className="font-display font-bold text-xl text-white">{formation.title}</h3>
                </div>
              </div>
              <p className="text-forest-300 text-sm leading-relaxed mb-5">{formation.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-forest-400">
                  <span>⏱</span>
                  <span>{formation.duration}</span>
                </span>
                <span className="flex items-center gap-1.5 text-forest-400">
                  <span>📊</span>
                  <span>{formation.level}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Prochaine session */}
        <div className="bg-laterite-900/40 border border-laterite-700 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="text-4xl flex-shrink-0">📅</div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg text-white mb-1">Prochaine session CCAND-EGG</h3>
            <p className="text-laterite-300 font-semibold text-base mb-1">Démarrage le 20 Avril 2026 &mdash; Inscriptions ouvertes !</p>
            <p className="text-forest-400 text-sm">Lieux : Kourou &middot; Macouria &middot; Sinnamary &middot; Régina &middot; Saint-Laurent &mdash; Formation multimodale (distanciel + présentiel)</p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <a
              href="https://drive.google.com/file/d/11OCODo5xHGq_UaT8oTjfw7hMueQjXyuQ/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-laterite-600 hover:bg-laterite-500 text-white font-semibold rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              📄 Télécharger le programme
            </a>
            <a
              href="#contact"
              className="px-5 py-2.5 bg-forest-700 hover:bg-forest-600 text-white font-semibold rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              S&apos;inscrire
            </a>
          </div>
        </div>

        {/* Modalités d'accès */}
        <div className="bg-forest-900/40 border border-forest-700 rounded-2xl p-6 mb-6">
          <h3 className="font-display font-bold text-base text-white mb-3">📌 Comment accéder à la formation ?</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { step: '1', title: 'Candidature', desc: 'Inscriptions ouvertes jusqu’à 15 jours avant le début de session' },
              { step: '2', title: 'Entretien', desc: 'Entretien de motivation + vérification des prérequis et positionnement' },
              { step: '3', title: 'Réponse', desc: 'Réponse garantie sous 15 jours après votre entretien' },
            ].map((s) => (
              <div key={s.step} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-forest-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{s.step}</div>
                <div>
                  <div className="text-white font-semibold mb-0.5">{s.title}</div>
                  <div className="text-forest-400">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bloc accréditation */}
        <div className="bg-forest-800/40 border border-forest-700 rounded-2xl p-7 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="text-4xl flex-shrink-0">🎓</div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg text-white mb-2">Organisme de formation certifié</h3>
            <p className="text-forest-300 text-sm">
              La LFTG est enregistrée auprès du Préfet de Région de Guyane sous le numéro <strong className="text-forest-400">03973232797</strong>. Nos formations sont éligibles aux financements CPF, OPCO et aides régionales.
            </p>
          </div>
          <a
            href="#contact"
            className="flex-shrink-0 px-6 py-3 bg-forest-600 hover:bg-forest-500 text-white font-semibold rounded-xl transition-colors text-sm whitespace-nowrap"
          >
            Nous contacter
          </a>
        </div>
      </div>
    </section>
  );
}

function PartenairesSection() {
  return (
    <section className="py-12 bg-white border-t border-wood-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-wood-400 text-sm font-semibold uppercase tracking-widest">Nos partenaires</span>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-14">
          {[
            { name: 'FEGG', full: 'Fédération des Éleveurs de Gibiers de Guyane', icon: '🦜' },
            { name: 'CFPPA Macouria', full: 'Centre de Formation Professionnelle et de Promotion Agricole', icon: '🌱' },
            { name: 'Préfecture de Guyane', full: 'Organisme de formation agréé N°03973232797', icon: '🏦' },
            { name: 'CPF / OPCO', full: 'Formations éligibles aux financements CPF et OPCO', icon: '💳' },
          ].map((p) => (
            <div key={p.name} className="text-center group">
              <div className="text-3xl mb-2">{p.icon}</div>
              <div className="font-semibold text-wood-800 text-sm">{p.name}</div>
              <div className="text-wood-400 text-xs max-w-[140px] leading-tight">{p.full}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActualitesSection() {
  return (
    <section id="actualites" className="py-20 bg-wood-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 bg-forest-100 text-forest-700 text-sm font-semibold rounded-full mb-4">
            Actualités
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-wood-900 mb-4">
            La vie de la LFTG
          </h2>
          <p className="text-wood-600 text-lg max-w-2xl mx-auto">
            Naissances, formations, événements de sensibilisation — suivez l&apos;actualité de la ferme.
          </p>
        </div>

        {/* Cartes d'actualités */}
        <div className="grid md:grid-cols-3 gap-7">
          {actualites.map((actu) => (
            <article key={actu.title} className="bg-white rounded-2xl overflow-hidden border border-wood-200 hover:shadow-lftg transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={actu.image}
                  alt={actu.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-forest-600 text-white text-xs font-semibold rounded-full">
                    {actu.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="text-wood-400 text-xs font-medium mb-2">{actu.date}</div>
                <h3 className="font-display font-bold text-lg text-wood-900 mb-3 leading-snug">{actu.title}</h3>
                <p className="text-wood-600 text-sm leading-relaxed">{actu.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdhesionSection() {
  return (
    <section id="adhesion" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Texte */}
          <div>
            <span className="inline-block px-4 py-1 bg-gold-100 text-gold-700 text-sm font-semibold rounded-full mb-4">
              Nous rejoindre
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-wood-900 mb-5">
              Devenez membre de la LFTG
            </h2>
            <p className="text-wood-600 leading-relaxed mb-6">
              En adhérant à l&apos;association, vous soutenez directement nos actions de protection animale, nos formations certifiantes et nos programmes de sensibilisation à la biodiversité guyanaise.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Soutien aux soins des animaux hébergés',
                'Accès aux événements et portes ouvertes',
                'Réductions sur les formations',
                'Newsletter et actualités exclusives',
                'Vote lors des assemblées générales',
              ].map((avantage) => (
                <li key={avantage} className="flex items-center gap-3 text-wood-700">
                  <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-600 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                  {avantage}
                </li>
              ))}
            </ul>
          </div>

          {/* Carte d'adhésion */}
          <div className="bg-gradient-to-br from-forest-950 to-forest-800 rounded-2xl p-8 text-center shadow-lftg-lg">
            <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-4 bg-[#f5f0e8]">
              <Image src="/lftg_improved_v1.png" alt="Logo LFTG" width={64} height={64} className="object-cover w-full h-full" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-2">Adhésion annuelle</h3>
            <p className="text-forest-300 text-sm mb-6">Association La Ferme Tropicale de Guyane</p>

            <div className="bg-forest-900/60 rounded-xl p-6 mb-6">
              <div className="text-forest-400 text-sm mb-1">Cotisation annuelle</div>
              <div className="text-4xl font-display font-bold text-white mb-1">24 €</div>
              <div className="text-forest-400 text-xs">Option A — Adhésion simple</div>
            </div>

            <a
              href="https://www.helloasso.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3.5 bg-forest-500 hover:bg-forest-400 text-white font-semibold rounded-xl transition-colors mb-3"
            >
              Adhérer via HelloAsso
            </a>
            <p className="text-forest-500 text-xs">Paiement sécurisé — Reçu fiscal disponible</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.firstName || !contactForm.email || !contactForm.message) return;
    setContactStatus('sending');
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${contactForm.firstName} ${contactForm.lastName}`.trim(),
          email: contactForm.email,
          subject: contactForm.subject,
          message: contactForm.message,
        }),
      });
      if (res.ok) {
        setContactStatus('success');
        setContactForm({ firstName: '', lastName: '', email: '', subject: '', message: '' });
      } else {
        setContactStatus('error');
      }
    } catch {
      setContactStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20 bg-wood-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 bg-forest-100 text-forest-700 text-sm font-semibold rounded-full mb-4">
            Contact
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-wood-900 mb-4">
            Contactez-nous
          </h2>
          <p className="text-wood-600 text-lg max-w-2xl mx-auto">
            Pour toute demande d&apos;information sur nos formations, nos animaux ou pour organiser une visite pédagogique.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Informations de contact */}
          <div className="space-y-6">
            {[
              {
                icon: '📍',
                title: 'Adresse',
                content: 'PK 20,5 Route du Dégrad Saramacca\n97310 Kourou, Guyane française',
              },
              {
                icon: '📞',
                title: 'Téléphone',
                content: '06 94 96 13 76\n+33 6 77 12 87 27',
              },
              {
                icon: '✉️',
                title: 'Email',
                content: 'lftg973@gmail.com\nlftg.secretariat@gmail.com',
              },
              {
                icon: '🕐',
                title: 'Horaires',
                content: 'Lundi – Vendredi : 8h00 – 17h00\nSamedi : 8h00 – 12h00 (sur rendez-vous)',
              },
            ].map((info) => (
              <div key={info.title} className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-forest-100 flex items-center justify-center text-xl flex-shrink-0">
                  {info.icon}
                </div>
                <div>
                  <div className="font-semibold text-wood-900 mb-1">{info.title}</div>
                  <div className="text-wood-600 text-sm whitespace-pre-line">{info.content}</div>
                </div>
              </div>
            ))}

            {/* Lien espace membres */}
            <div className="mt-8 p-5 bg-forest-50 border border-forest-200 rounded-xl">
              <div className="font-semibold text-forest-900 mb-2">Vous êtes membre ou apprenant ?</div>
              <p className="text-forest-700 text-sm mb-4">
                Accédez à votre espace personnel pour suivre vos formations, consulter les plannings et gérer votre suivi animalier.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-600 hover:bg-forest-500 text-white font-semibold rounded-lg text-sm transition-colors"
              >
                <span>Accéder à l&apos;espace membres</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="bg-white rounded-2xl border border-wood-200 p-7">
            <h3 className="font-display font-bold text-xl text-wood-900 mb-6">Envoyer un message</h3>
            {contactStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-4">✅</div>
                <h4 className="font-bold text-lg text-wood-900 mb-2">Message envoyé !</h4>
                <p className="text-wood-600 text-sm mb-6">Nous avons bien reçu votre message et vous répondrons sous 48h ouvrées. Un accusé de réception vous a été envoyé par email.</p>
                <button onClick={() => setContactStatus('idle')} className="px-5 py-2 bg-forest-600 hover:bg-forest-500 text-white font-semibold rounded-lg text-sm transition-colors">Envoyer un autre message</button>
              </div>
            ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              {contactStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email.</div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-1.5">Prénom <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm(p => ({ ...p, firstName: e.target.value }))}
                    placeholder="Votre prénom"
                    className="w-full px-4 py-2.5 border border-wood-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-wood-700 mb-1.5">Nom</label>
                  <input
                    type="text"
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm(p => ({ ...p, lastName: e.target.value }))}
                    placeholder="Votre nom"
                    className="w-full px-4 py-2.5 border border-wood-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-2.5 border border-wood-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1.5">Sujet</label>
                <select
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-wood-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent bg-white"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="formation">Renseignements sur une formation</option>
                  <option value="visite">Organiser une visite pédagogique</option>
                  <option value="adhesion">Adhésion à l&apos;association</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Votre message..."
                  className="w-full px-4 py-2.5 border border-wood-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={contactStatus === 'sending'}
                className="w-full py-3 bg-forest-600 hover:bg-forest-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
              >
                {contactStatus === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-forest-950 border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Logo et description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#f5f0e8]">
                <Image src="/lftg_improved_v1.png" alt="Logo LFTG" width={40} height={40} className="object-cover w-full h-full" />
              </div>
              <div>
                <div className="text-white font-display font-bold text-sm">La Ferme Tropicale de Guyane</div>
                <div className="text-forest-400 text-xs">Association loi 1901</div>
              </div>
            </div>
            <p className="text-forest-400 text-sm leading-relaxed max-w-xs">
              Protection de la faune guyanaise, formation professionnelle certifiante et sensibilisation à la biodiversité amazonienne depuis Kourou, Guyane.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Navigation</h4>
            <ul className="space-y-2">
              {[
                { href: '#mission', label: 'Notre mission' },
                { href: '#animaux', label: 'Nos animaux' },
                { href: '#formations', label: 'Formations' },
                { href: '#actualites', label: 'Actualités' },
                { href: '#adhesion', label: 'Adhésion' },
                { href: '#contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-forest-400 hover:text-forest-300 text-sm transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations légales */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Informations légales</h4>
            <ul className="space-y-2 text-forest-400 text-sm">
              <li>SIRET : 813 099 215 000 28</li>
              <li>N° formation : 03973232797</li>
              <li>Association loi 1901</li>
              <li className="pt-2">
                <Link href="/login" className="text-forest-500 hover:text-forest-400 transition-colors">
                  Espace membres →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bas de footer */}
        <div className="border-t border-forest-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-forest-500 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} La Ferme Tropicale de Guyane — Tous droits réservés
          </p>
          <p className="text-forest-600 text-xs">
            PK 20,5 Route du Dégrad Saramacca, 97310 Kourou, Guyane française
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function VitrinePage() {
  return (
    <main className="min-h-screen bg-wood-50 font-sans">
      <NavBar />
      <HeroSection />
      <MissionSection />
      <TemoignageSection />
      <AnimauxSection />
      <FormationsSection />
      <PartenairesSection />
      <ActualitesSection />
      <AdhesionSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
