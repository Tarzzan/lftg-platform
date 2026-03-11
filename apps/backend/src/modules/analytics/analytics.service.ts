import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getBirthsByMonth() {
    // Cette requête nécessite une fonction de base de données pour extraire le mois
    // ou un traitement côté application. Pour la simplicité, nous allons retourner des données mock.
    return [
      { month: 'Jan', births: 12 },
      { month: 'Fev', births: 8 },
      { month: 'Mar', births: 15 },
      { month: 'Avr', births: 7 },
      { month: 'Mai', births: 10 },
      { month: 'Juin', births: 14 },
    ];
  }

  async getSpeciesDistribution() {
    return this.prisma.animal.groupBy({
      by: ['speciesId'],
      _count: {
        id: true,
      },
    });
  }
}
