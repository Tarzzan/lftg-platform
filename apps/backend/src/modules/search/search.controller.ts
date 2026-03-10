import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SearchService } from './search.service';
import { SearchResponseDto } from './dto/search.dto';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "Recherche full-text globale multi-entités" })
  @ApiQuery({ name: "q", description: "Terme de recherche (min 2 caractères)", required: true })
  @ApiQuery({ name: "type", required: false, description: "Filtrer par type: animal, espece, enclos, employe, stock, formation" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Nombre max de résultats (défaut: 20, max: 100)" })
  @ApiResponse({ status: 200, description: "Résultats de recherche", type: SearchResponseDto })
  async search(
    @Query('q') q: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.globalSearch(q, limit ? parseInt(limit) : 20);
  }

  @Get('suggestions')
  @ApiOperation({ summary: "Suggestions de recherche (autocomplete)" })
  @ApiQuery({ name: "q", description: "Terme partiel (min 1 caractère)", required: true })
  @ApiResponse({ status: 200, description: "Liste de suggestions" })
  async suggestions(@Query('q') q: string) {
    return this.searchService.searchSuggestions(q);
  }
}
