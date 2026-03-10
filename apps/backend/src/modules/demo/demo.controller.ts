import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { DemoService } from "./demo.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { DemoResetDto, DemoStatusResponseDto, DemoClearResponseDto } from "./dto/demo.dto";

@ApiTags('Demo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("demo")
export class DemoController {
  constructor(private service: DemoService) {}

  @Get('status')
  @ApiOperation({ summary: "Vérifie le statut du mode démonstration" })
  @ApiResponse({ status: 200, description: "Statut du mode démo", type: DemoStatusResponseDto })
  getStatus(): Promise<DemoStatusResponseDto> {
    return this.service.getDemoStatus();
  }

  @Post('clear')
  @ApiOperation({ summary: "Supprime les données de démonstration (irréversible)" })
  @ApiBody({ type: DemoResetDto, required: false })
  @ApiResponse({ status: 200, description: "Données de démo supprimées", type: DemoClearResponseDto })
  clearDemoData(@Body() dto?: DemoResetDto): Promise<DemoClearResponseDto> {
    return this.service.clearDemoData();
  }
}
