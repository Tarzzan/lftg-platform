import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { PersonnelService } from './personnel.service';
import { JwtAuthGuard } from '../../../apps/backend/src/common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../apps/backend/src/common/decorators/current-user.decorator';

const multerAvatarOptions = {
  storage: diskStorage({
    destination: join(process.cwd(), 'uploads', 'avatars'),
    filename: (_req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req: any, file: any, cb: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new BadRequestException('Seules les images sont acceptées'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};

@ApiTags('Plugin: Personnel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plugins/personnel')
export class PersonnelController {
  constructor(private service: PersonnelService) {}

  // --- Employees ---
  @Get('employees')
  @ApiOperation({ summary: 'Liste tous les employés' })
  findAll() { return this.service.findAllEmployees(); }

  @Get('employees/:id')
  findOne(@Param('id') id: string) { return this.service.findEmployeeById(id); }

  @Post('employees')
  @ApiOperation({ summary: 'Crée un nouvel employé' })
  create(@Body() body: any) { return this.service.createEmployee(body); }

  @Patch('employees/:id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.updateEmployee(id, body); }

  @Delete('employees/:id')
  @ApiOperation({ summary: 'Supprime un employé' })
  remove(@Param('id') id: string) { return this.service.deleteEmployee(id); }

  @Post('employees/:id/avatar')
  @ApiOperation({ summary: 'Upload une photo de profil pour un employé' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerAvatarOptions))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.service.updateEmployee(id, { avatarUrl });
  }

  @Post('employees/:id/skills')
  @ApiOperation({ summary: 'Ajoute une compétence à un employé' })
  addSkill(@Param('id') id: string, @Body() body: { skillName: string }) {
    return this.service.addSkill(id, body.skillName);
  }

  // --- Skills ---
  @Get('skills')
  @ApiOperation({ summary: 'Liste toutes les compétences' })
  findAllSkills() { return this.service.findAllSkills(); }

  @Post('skills')
  @ApiOperation({ summary: 'Crée une nouvelle compétence' })
  createSkill(@Body() body: { name: string }) { return this.service.createSkill(body.name); }

  // --- Leaves (Congés) ---
  @Get('leaves')
  @ApiOperation({ summary: 'Liste les congés' })
  findLeaves(@Query('employeeId') employeeId?: string) { return this.service.findAllLeaves(employeeId); }

  @Post('leaves')
  @ApiOperation({ summary: 'Crée une demande de congé' })
  createLeave(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.service.createLeave({ ...body, userId });
  }

  @Patch('leaves/:id')
  @ApiOperation({ summary: 'Met à jour un congé' })
  updateLeave(@Param('id') id: string, @Body() body: any) { return this.service.updateLeave(id, body); }
}
