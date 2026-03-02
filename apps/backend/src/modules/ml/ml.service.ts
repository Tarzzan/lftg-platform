import { Injectable } from '@nestjs/common';

@Injectable()
export class MlService {
  getBreedingPredictions() {
    // Mock data
    return [
      { animalId: 'AM-042', species: 'Ara macao', probability: 0.82, expectedDate: '2026-04-15' },
      { animalId: 'DA-012', species: 'Dendrobates azureus', probability: 0.67, expectedDate: '2026-05-02' },
      { animalId: 'TT-003', species: 'Geochelone carbonaria', probability: 0.45, expectedDate: '2026-06-10' },
    ];
  }

  getBehavioralAnomalies() {
    // Mock data
    return [
      { animalId: 'AM-017', anomaly: 'Reduced activity', severity: 'warning', timestamp: '2026-03-01T10:00:00Z' },
      { animalId: 'BC-001', anomaly: 'Refusal to feed', severity: 'critical', timestamp: '2026-02-28T12:00:00Z' },
    ];
  }

  getNutritionRecommendations(animalId: string) {
    // Mock data
    return {
      animalId,
      recommendations: [
        { food: 'Papaye', quantity: '20g', reason: 'Source de vitamine C' },
        { food: 'Noix du Brésil', quantity: '5g', reason: 'Apport en sélénium' },
      ],
    };
  }
}
