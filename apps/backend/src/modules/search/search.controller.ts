import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SearchService } from './search.service';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Recherche full-text globale multi-entités' })
  @ApiQuery({ name: 'q', description: 'Terme de recherche (min 2 caractères)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre max de résultats (défaut: 20)' })
  async search(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.searchService.globalSearch(q, limit ? parseInt(limit) : 20);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Suggestions de recherche (autocomplete)' })
  @ApiQuery({ name: 'q', description: 'Terme partiel' })
  async suggestions(@Query('q') q: string) {
    return this.searchService.searchSuggestions(q);
  }
}
