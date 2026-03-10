import { Injectable, Logger } from '@nestjs/common';

export interface GbifSpecies {
  key: number;
  scientificName: string;
  canonicalName: string;
  vernacularName?: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
  taxonomicStatus: string;
  rank: string;
  iucnStatus?: 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX' | 'DD';
  citesAppendix?: 'I' | 'II' | 'III';
  occurrenceCount?: number;
  imageUrl?: string;
  description?: string;
  habitat?: string;
  distribution?: string[];
}

export interface GbifOccurrence {
  key: string;
  scientificName: string;
  decimalLatitude: number;
  decimalLongitude: number;
  country: string;
  locality?: string;
  eventDate: string;
  recordedBy?: string;
  institutionCode?: string;
  collectionCode?: string;
}

@Injectable()
export class GbifService {
  private readonly logger = new Logger(GbifService.name);
  private readonly gbifApiBase = 'https://api.gbif.org/v1';

  // Base de données locale des espèces LFTG avec données GBIF enrichies
  private readonly speciesDatabase: GbifSpecies[] = [
    {
      key: 2479407,
      scientificName: 'Ara ararauna (Linnaeus, 1758)',
      canonicalName: 'Ara ararauna',
      vernacularName: 'Ara bleu et jaune',
      kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves',
      order: 'Psittaciformes', family: 'Psittacidae', genus: 'Ara', species: 'ararauna',
      taxonomicStatus: 'ACCEPTED', rank: 'SPECIES',
      iucnStatus: 'LC', citesAppendix: 'II',
      occurrenceCount: 48291,
      description: "Grand perroquet néotropical au plumage bleu vif sur le dessus et jaune sur le dessous.",
      habitat: "Forêts tropicales, zones humides, savanes arborées",
      distribution: ['Brésil', 'Colombie', 'Venezuela', 'Guyane', 'Bolivie', 'Équateur', 'Pérou'],
    },
    {
      key: 2481089,
      scientificName: 'Amazona amazonica (Linnaeus, 1766)',
      canonicalName: 'Amazona amazonica',
      vernacularName: 'Amazone à front bleu',
      kingdom: 'Animalia', phylum: 'Chordata', class: 'Aves',
      order: 'Psittaciformes', family: 'Psittacidae', genus: 'Amazona', species: 'amazonica',
      taxonomicStatus: 'ACCEPTED', rank: 'SPECIES',
      iucnStatus: 'LC', citesAppendix: 'II',
      occurrenceCount: 32156,
      description: "Perroquet vert de taille moyenne avec des marques rouges et bleues sur les ailes.",
      habitat: "Forêts tropicales humides, mangroves, zones côtières",
      distribution: ['Brésil', 'Guyane', 'Suriname', 'Venezuela', 'Trinidad'],
    },
    {
      key: 2441176,
      scientificName: 'Dendrobates azureus Hoogmoed, 1969',
      canonicalName: 'Dendrobates azureus',
      vernacularName: 'Dendrobate azuré',
      kingdom: 'Animalia', phylum: 'Chordata', class: 'Amphibia',
      order: 'Anura', family: 'Dendrobatidae', genus: 'Dendrobates', species: 'azureus',
      taxonomicStatus: 'ACCEPTED', rank: 'SPECIES',
      iucnStatus: 'VU', citesAppendix: 'II',
      occurrenceCount: 1247,
      description: "Grenouille venimeuse aux couleurs vives bleu azur avec des taches noires.",
      habitat: "Forêts tropicales humides, litière forestière",
      distribution: ['Suriname', 'Brésil (Pará)'],
    },
    {
      key: 2441893,
      scientificName: 'Boa constrictor Linnaeus, 1758',
      canonicalName: 'Boa constrictor',
      vernacularName: 'Boa constricteur',
      kingdom: 'Animalia', phylum: 'Chordata', class: 'Reptilia',
      order: 'Squamata', family: 'Boidae', genus: 'Boa', species: 'constrictor',
      taxonomicStatus: 'ACCEPTED', rank: 'SPECIES',
      iucnStatus: 'LC', citesAppendix: 'II',
      occurrenceCount: 28934,
      description: "Grand serpent constricteur non venimeux. Peut atteindre 4 mètres.",
      habitat: "Forêts tropicales, zones semi-arides, mangroves",
      distribution: ['Mexique', 'Amérique Centrale', 'Amérique du Sud', 'Guyane'],
    },
    {
      key: 2440777,
      scientificName: 'Caiman crocodilus (Linnaeus, 1758)',
      canonicalName: 'Caiman crocodilus',
      vernacularName: 'Caïman à lunettes',
      kingdom: 'Animalia', phylum: 'Chordata', class: 'Reptilia',
      order: 'Crocodilia', family: 'Alligatoridae', genus: 'Caiman', species: 'crocodilus',
      taxonomicStatus: 'ACCEPTED', rank: 'SPECIES',
      iucnStatus: 'LC', citesAppendix: 'II',
      occurrenceCount: 15678,
      description: "Crocodilien de taille moyenne avec une crête osseuse entre les yeux ressemblant à des lunettes.",
      habitat: "Zones humides, rivières, marécages, mangroves",
      distribution: ['Mexique', 'Amérique Centrale', 'Amérique du Sud', 'Guyane', 'Brésil'],
    },
  ];

  /**
   * Rechercher une espèce dans GBIF
   */
  async searchSpecies(query: string, limit = 10): Promise<GbifSpecies[]> {
    this.logger.log(`Recherche GBIF: "${query}"`);

    const results = this.speciesDatabase.filter(s =>
      s.canonicalName.toLowerCase().includes(query.toLowerCase()) ||
      (s.vernacularName && s.vernacularName.toLowerCase().includes(query.toLowerCase())) ||
      s.family.toLowerCase().includes(query.toLowerCase()),
    );

    return results.slice(0, limit);
  }

  /**
   * Récupérer les détails d'une espèce par son nom scientifique
   */
  async getSpeciesDetails(scientificName: string): Promise<GbifSpecies | null> {
    const species = this.speciesDatabase.find(s =>
      s.canonicalName.toLowerCase() === scientificName.toLowerCase(),
    );
    return species || null;
  }

  /**
   * Récupérer les occurrences d'une espèce en Guyane
   */
  async getOccurrencesInGuyane(scientificName: string): Promise<GbifOccurrence[]> {
    // Données simulées pour la Guyane
    return Array.from({ length: 5 }, (_, i) => ({
      key: `gbif_occ_${i + 1}`,
      scientificName,
      decimalLatitude: 4.0 + Math.random() * 3,
      decimalLongitude: -54.0 + Math.random() * 4,
      country: 'GF',
      locality: ['Cayenne', 'Saint-Laurent-du-Maroni', 'Kourou', 'Maripasoula', 'Saül'][i],
      eventDate: new Date(Date.now() - i * 30 * 86400000).toISOString().split('T')[0],
      recordedBy: `Observateur ${i + 1}`,
      institutionCode: 'MNHN',
    }));
  }

  /**
   * Vérifier le statut UICN d'une espèce
   */
  async checkConservationStatus(scientificName: string) {
    const species = await this.getSpeciesDetails(scientificName);
    if (!species) {
      return { found: false, scientificName, iucnStatus: null, citesAppendix: null };
    }

    const statusLabels: Record<string, string> = {
      LC: 'Préoccupation mineure',
      NT: 'Quasi menacée',
      VU: 'Vulnérable',
      EN: 'En danger',
      CR: 'En danger critique',
      EW: "Éteinte à l'état sauvage",
      EX: 'Éteinte',
      DD: 'Données insuffisantes',
    };

    return {
      found: true,
      scientificName: species.canonicalName,
      vernacularName: species.vernacularName,
      iucnStatus: species.iucnStatus,
      iucnLabel: species.iucnStatus ? statusLabels[species.iucnStatus] : null,
      citesAppendix: species.citesAppendix,
      isProtected: ['VU', 'EN', 'CR', 'EW', 'EX'].includes(species.iucnStatus || ''),
      requiresCitesPermit: !!species.citesAppendix,
    };
  }

  /**
   * Récupérer toutes les espèces de la base LFTG enrichies GBIF
   */
  async getAllSpecies(): Promise<GbifSpecies[]> {
    return this.speciesDatabase;
  }

  /**
   * Statistiques de biodiversité
   */
  async getBiodiversityStats() {
    const species = this.speciesDatabase;
    return {
      totalSpecies: species.length,
      byClass: {
        Aves: species.filter(s => s.class === 'Aves').length,
        Reptilia: species.filter(s => s.class === 'Reptilia').length,
        Amphibia: species.filter(s => s.class === 'Amphibia').length,
        Mammalia: species.filter(s => s.class === 'Mammalia').length,
      },
      byIucnStatus: {
        LC: species.filter(s => s.iucnStatus === 'LC').length,
        NT: species.filter(s => s.iucnStatus === 'NT').length,
        VU: species.filter(s => s.iucnStatus === 'VU').length,
        EN: species.filter(s => s.iucnStatus === 'EN').length,
        CR: species.filter(s => s.iucnStatus === 'CR').length,
      },
      byCitesAppendix: {
        I: species.filter(s => s.citesAppendix === 'I').length,
        II: species.filter(s => s.citesAppendix === 'II').length,
        III: species.filter(s => s.citesAppendix === 'III').length,
        none: species.filter(s => !s.citesAppendix).length,
      },
      protectedSpecies: species.filter(s => ['VU', 'EN', 'CR'].includes(s.iucnStatus || '')).length,
      totalOccurrences: species.reduce((sum, s) => sum + (s.occurrenceCount || 0), 0),
    };
  }
}
