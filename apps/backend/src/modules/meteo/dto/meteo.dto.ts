import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WeatherAlertDto {
  @ApiProperty({ enum: ['cyclone', 'canicule', 'pluie_intense', 'orage', 'vent_fort', 'vigilance'] })
  type: string;
  @ApiProperty({ enum: ['info', 'warning', 'danger', 'critical'] })
  severity: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty() startTime: string;
  @ApiProperty() endTime: string;
}

export class DayForecastDto {
  @ApiProperty() date: string;
  @ApiProperty() tempMin: number;
  @ApiProperty() tempMax: number;
  @ApiProperty() humidity: number;
  @ApiProperty() precipitation: number;
  @ApiProperty() description: string;
  @ApiProperty() icon: string;
}

export class AnimalImpactDto {
  @ApiProperty() species: string;
  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'] }) impact: string;
  @ApiProperty() recommendation: string;
  @ApiProperty() affectedCount: number;
}

export class WeatherDataDto {
  @ApiProperty() location: string;
  @ApiProperty() temperature: number;
  @ApiProperty() feelsLike: number;
  @ApiProperty() humidity: number;
  @ApiProperty() pressure: number;
  @ApiProperty() windSpeed: number;
  @ApiProperty() windDirection: string;
  @ApiProperty() description: string;
  @ApiProperty() icon: string;
  @ApiProperty() uvIndex: number;
  @ApiProperty() visibility: number;
  @ApiProperty() sunrise: string;
  @ApiProperty() sunset: string;
  @ApiProperty({ type: [WeatherAlertDto] }) alerts: WeatherAlertDto[];
  @ApiProperty({ type: [DayForecastDto] }) forecast: DayForecastDto[];
  @ApiProperty({ type: [AnimalImpactDto] }) animalImpact: AnimalImpactDto[];
}
