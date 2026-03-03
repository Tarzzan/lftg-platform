import { Controller, Post, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { DemoService } from "./demo.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("Demo")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("demo")
export class DemoController {
  constructor(private service: DemoService) {}

  @Get("status")
  @ApiOperation({ summary: "Vérifie le statut du mode démonstration" })
  getStatus() {
    return this.service.getDemoStatus();
  }

  @Post("clear")
  @ApiOperation({ summary: "Supprime les données de démonstration (irréversible)" })
  clearDemoData() {
    return this.service.clearDemoData();
  }
}
