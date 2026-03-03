import { Injectable } from '@nestjs/common';

@Injectable()
export class SitesService {
  private sites = [
    { id: 'lftg-cayenne', name: 'La Ferme Tropicale de Guyane - Cayenne', location: 'Cayenne, Guyane Française' },
    { id: 'lftg-kourou', name: 'La Ferme Tropicale de Guyane - Kourou', location: 'Kourou, Guyane Française' },
  ];

  getAllSites() {
    return this.sites;
  }

  createSite(createSiteDto: any) {
    const newSite = { id: `lftg-${createSiteDto.name.toLowerCase()}`, ...createSiteDto };
    this.sites.push(newSite);
    return newSite;
  }

  getSiteById(id: string) {
    return this.sites.find(site => site.id === id);
  }

  transferAnimal(fromSiteId: string, toSiteId: string, animalId: string) {
    console.log(`Transferring animal ${animalId} from ${fromSiteId} to ${toSiteId}`);
    // Logic to update animal's site in the database would go here
    return { status: 'transfer initiated', animalId, fromSiteId, toSiteId };
  }
}
