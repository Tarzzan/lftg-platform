import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class PublicApiV2Service {
  private validApiKeys = ['test-key-123', 'partner-key-456'];

  validateApiKey(apiKey: string) {
    if (!this.validApiKeys.includes(apiKey)) {
      throw new UnauthorizedException('Invalid API Key');
    }
  }

  getSpecies(taxon: string) {
    // Mock data
    return [
      { taxon: 'Ara macao', status: 'Least Concern' },
      { taxon: 'Dendrobates azureus', status: 'Least Concern' },
    ].filter(s => !taxon || s.taxon.toLowerCase().includes(taxon.toLowerCase()));
  }

  addObservation(observation: any) {
    console.log('New observation received:', observation);
    // Logic to save observation to database
    return { status: 'observation received', id: new Date().getTime() };
  }
}
