import { Injectable } from '@nestjs/common';

@Injectable()
export class PrevisionsService {
  // Régression linéaire simple
  private linearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * data[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const yMean = sumY / n;
    const ssTot = data.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
    const ssRes = data.reduce((acc, y, i) => acc + Math.pow(y - (slope * i + intercept), 2), 0);
    const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
    return { slope, intercept, r2 };
  }

  async getRevenueForecast(months: number = 6) {
    const historicalRevenue = [28500, 31200, 29800, 34100, 38600, 41200];
    const { slope, intercept, r2 } = this.linearRegression(historicalRevenue);
    const n = historicalRevenue.length;
    const forecast = Array.from({ length: months }, (_, i) => ({
      month: i + 1,
      predicted: Math.round(slope * (n + i) + intercept),
      lower: Math.round((slope * (n + i) + intercept) * 0.9),
      upper: Math.round((slope * (n + i) + intercept) * 1.1),
    }));
    const monthNames = ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return {
      historical: historicalRevenue.map((v, i) => ({
        month: ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'][i],
        value: v,
      })),
      forecast: forecast.map((f, i) => ({ ...f, month: monthNames[i] || `M+${i + 1}` })),
      model: { slope: Math.round(slope), intercept: Math.round(intercept), r2: Math.round(r2 * 100) / 100 },
      trend: slope > 0 ? 'HAUSSE' : 'BAISSE',
      trendPercent: Math.round((slope / historicalRevenue[0]) * 100 * 10) / 10,
    };
  }

  async getAnimalPopulationForecast() {
    const historicalPop = [210, 218, 225, 231, 240, 247];
    const { slope, intercept, r2 } = this.linearRegression(historicalPop);
    const n = historicalPop.length;
    return {
      historical: historicalPop.map((v, i) => ({
        month: ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'][i],
        value: v,
      })),
      forecast: Array.from({ length: 6 }, (_, i) => ({
        month: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'][i],
        predicted: Math.round(slope * (n + i) + intercept),
      })),
      r2: Math.round(r2 * 100) / 100,
      trend: slope > 0 ? 'CROISSANCE' : 'DÉCLIN',
      monthlyGrowth: Math.round(slope * 10) / 10,
    };
  }

  async getStockForecast() {
    return {
      items: [
        {
          article: 'Granulés perroquets',
          currentStock: 12,
          unit: 'kg',
          dailyConsumption: 0.8,
          daysRemaining: 15,
          reorderDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'WARNING',
        },
        {
          article: 'Insectes vivants',
          currentStock: 5000,
          unit: 'unités',
          dailyConsumption: 200,
          daysRemaining: 25,
          reorderDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'OK',
        },
        {
          article: 'Vitamines reptiles',
          currentStock: 2,
          unit: 'flacons',
          dailyConsumption: 0.05,
          daysRemaining: 40,
          reorderDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'OK',
        },
      ],
    };
  }

  async getVisiteForecast() {
    const historicalVisites = [18, 22, 25, 30, 35, 42];
    const { slope, intercept } = this.linearRegression(historicalVisites);
    const n = historicalVisites.length;
    return {
      historical: historicalVisites.map((v, i) => ({
        month: ['Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'][i],
        visites: v,
        revenue: v * 280,
      })),
      forecast: Array.from({ length: 6 }, (_, i) => ({
        month: ['Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep'][i],
        visites: Math.round(slope * (n + i) + intercept),
        revenue: Math.round((slope * (n + i) + intercept) * 280),
      })),
      peakMonth: 'Août',
      expectedPeakVisites: 68,
    };
  }
}
