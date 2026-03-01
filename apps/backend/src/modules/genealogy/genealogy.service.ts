'''
import { Injectable } from '@nestjs/common';

@Injectable()
export class GenealogyService {
  getGenealogyTree(animalId: string) {
    // Mock data for D3.js
    return {
      name: 'AM-042',
      children: [
        { name: 'Parent A', children: [{ name: 'Grandparent A1' }, { name: 'Grandparent A2' }] },
        { name: 'Parent B', children: [{ name: 'Grandparent B1' }, { name: 'Grandparent B2' }] },
      ],
    };
  }

  getInbreedingCoefficient(animalId: string) {
    // Mock data
    return { animalId, coefficient: 0.0125 };
  }
}
'''
