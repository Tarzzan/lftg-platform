import {
  Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private service: WorkflowsService) {}

  // --- Definitions ---
  @Get('definitions')
  @ApiOperation({ summary: "Liste toutes les définitions de workflows" })
  findAllDefinitions() {
    return this.service.findAllDefinitions();
  }

  @Get("definitions/:id")
  findDefinition(@Param('id') id: string) {
    return this.service.findDefinitionById(id);
  }

  @Post('definitions')
  @ApiOperation({ summary: "Crée une nouvelle définition de workflow" })
  createDefinition(@Body() body: any) {
    return this.service.createDefinition(body);
  }

  @Put("definitions/:id")
  updateDefinitionPut(@Param('id') id: string, @Body() body: any) {
    return this.service.updateDefinition(id, body);
  }

  @Patch('definitions/:id')
  updateDefinition(@Param('id') id: string, @Body() body: any) {
    return this.service.updateDefinition(id, body);
  }

  // --- Instances ---
  @Get('instances')
  @ApiOperation({ summary: "Liste les instances de workflow" })
  findAllInstances(
    @Query("state") state?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('definitionId') definitionId?: string,
  ) {
    return this.service.findAllInstances({ state, assigneeId, definitionId });
  }

  @Get('instances/:id')
  findInstance(@Param('id') id: string) {
    return this.service.findInstanceById(id);
  }

  @Post('instances')
  @ApiOperation({ summary: "Démarre une nouvelle instance de workflow" })
  createInstance(@Body() body: any) {
    return this.service.createInstance(body);
  }

  @Post("instances/:id/transition")
  @ApiOperation({ summary: "Déclenche une transition sur une instance" })
  transition(
    @Param("id") id: string,
    @Body() body: { transition: string; notes?: string; formData?: Record<string, any> },
    @CurrentUser('id') userId: string,
  ) {
    return this.service.transition(id, body.transition, userId, body.notes, body.formData);
  }
}
