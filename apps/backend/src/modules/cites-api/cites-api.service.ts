import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class CitesApiService {
  private readonly logger = new Logger(CitesApiService.name);
  private readonly CITES_API_BASE = 'https://api.speciesplus.net/api/v1';
  private readonly CITES_TOKEN = process.env.CITES_API_TOKEN || '';

  constructor() {}

  async searchSpecies(query: string) {
    // Mock data — en production, appel à l'API Species+
    this.logger.log(`Searching CITES species: ${query}`);
    const mockResults = [
      {
        id: 'sp-1',
        full_name: 'Ara ararauna',
        author_year: '(Linnaeus, 1758)',
        rank: 'SPECIES',
        name_status: 'A',
        cites_listing: 'II',
        eu_listing: 'B',
        national_listing: null,
        higher_taxa: [{ rank: 'FAMILY', full_name: 'Psittacidae' }],
        synonyms: ['Psittacus ararauna'],
        common_names: [
          { name: 'Blue-and-yellow Macaw', language: 'English' },
          { name: 'Ara bleu et jaune', language: 'French' },
        ],
        distribution: ['Brazil', 'Bolivia', 'Colombia', 'Ecuador', 'French Guiana', 'Guyana', 'Panama', 'Paraguay', 'Peru', 'Suriname', 'Trinidad and Tobago', 'Venezuela'],
      },
      {
        id: 'sp-2',
        full_name: 'Dendrobates azureus',
        author_year: 'Hoogmoed, 1969',
        rank: 'SPECIES',
        name_status: 'A',
        cites_listing: 'II',
        eu_listing: 'B',
        national_listing: null,
        higher_taxa: [{ rank: 'FAMILY', full_name: 'Dendrobatidae' }],
        synonyms: ['Dendrobates tinctorius azureus'],
        common_names: [
          { name: 'Blue Poison Dart Frog', language: 'English' },
          { name: 'Dendrobate bleu', language: 'French' },
        ],
        distribution: ['Suriname'],
      },
    ].filter(s => s.full_name.toLowerCase().includes(query.toLowerCase()) ||
      s.common_names.some(cn => cn.name.toLowerCase().includes(query.toLowerCase())));

    return {
      results: mockResults,
      total: mockResults.length,
      source: 'CITES Species+ (mock)',
      timestamp: new Date().toISOString(),
    };
  }

  async getSpeciesDetails(taxonId: string) {
    return {
      id: taxonId,
      full_name: 'Ara ararauna',
      cites_listing: 'II',
      eu_listing: 'B',
      appendix_history: [
        { appendix: 'II', annotation: null, change_type: 'LISTED', effective_at: '1975-07-01' },
      ],
      legislation: [
        {
          type: 'CITES',
          appendix: 'II',
          notes: "Espèce inscrite à l'Annexe II de la CITES. Nécessite un permis CITES pour toute transaction internationale.",
        },
        {
          type: 'EU',
          annex: 'B',
          notes: "Inscrite à l'Annexe B du Règlement CE 338/97. Nécessite un certificat CE pour les transactions intra-UE.",
        },
      ],
      trade_restrictions: {
        import_permit_required: true,
        export_permit_required: true,
        re_export_certificate_required: true,
        eu_certificate_required: true,
      },
    };
  }

  async checkCompliance(speciesName: string, quantity: number, transactionType: string) {
    const searchResult = await this.searchSpecies(speciesName);
    const species = searchResult.results[0];
    if (!species) {
      return { compliant: false, reason: 'Espèce non trouvée dans la base CITES', requiresVerification: true };
    }
    const requiresPermit = ['I', 'II'].includes(species.cites_listing);
    return {
      compliant: true,
      species: species.full_name,
      citesListing: species.cites_listing,
      euListing: species.eu_listing,
      requiresPermit,
      requirements: requiresPermit ? [
        "Permis d'exportation CITES",
        "Permis d'importation CITES",
        'Certificat CE (si transaction intra-UE)',
        'Marquage individuel (bague ou puce)',
      ] : [],
      warnings: species.cites_listing === 'I' ? ['ATTENTION: Espèce Annexe I — commerce commercial interdit'] : [],
    };
  }

  async getPermitTemplates() {
    return [
      { id: 'tpl-1', type: 'EXPORT_PERMIT', name: "Permis d'exportation CITES", format: 'PDF' },
      { id: 'tpl-2', type: 'IMPORT_PERMIT', name: "Permis d'importation CITES", format: 'PDF' },
      { id: 'tpl-3', type: 'EU_CERTIFICATE', name: 'Certificat CE 338/97', format: 'PDF' },
      { id: 'tpl-4', type: 'CAPTIVE_BRED', name: 'Déclaration naissance en captivité', format: 'PDF' },
    ];
  }
}
