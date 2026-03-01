import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FormationService } from './formation.service';
import { JwtAuthGuard } from '../../../apps/backend/src/common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../apps/backend/src/common/decorators/current-user.decorator';

@ApiTags('Plugin: Formation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plugins/formation')
export class FormationController {
  constructor(private service: FormationService) {}

  @Get('courses')
  @ApiOperation({ summary: 'Liste tous les cours' })
  findAll(@Query('published') published?: string) {
    return this.service.findAllCourses(published === 'true');
  }

  @Get('courses/:id')
  findOne(@Param('id') id: string) { return this.service.findCourseById(id); }

  @Post('courses')
  @ApiOperation({ summary: 'Crée un nouveau cours' })
  create(@Body() body: { title: string; description?: string }) { return this.service.createCourse(body); }

  @Patch('courses/:id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.updateCourse(id, body); }

  @Post('courses/:id/chapters')
  addChapter(@Param('id') courseId: string, @Body() body: any) {
    return this.service.addChapter(courseId, body);
  }

  @Post('chapters/:id/lessons')
  addLesson(@Param('id') chapterId: string, @Body() body: any) {
    return this.service.addLesson(chapterId, body);
  }

  @Post('lessons/:id/quizzes')
  addQuiz(@Param('id') lessonId: string, @Body() body: any) {
    return this.service.addQuiz(lessonId, body);
  }

  @Post('courses/:id/cohorts')
  createCohort(@Param('id') courseId: string, @Body() body: any) {
    return this.service.createCohort(courseId, body);
  }

  @Post('cohorts/:id/enroll')
  @ApiOperation({ summary: 'Inscrit l\'utilisateur connecté à une cohorte' })
  enroll(@Param('id') cohortId: string, @CurrentUser('id') userId: string) {
    return this.service.enrollUser(cohortId, userId);
  }

  @Get('my-enrollments')
  @ApiOperation({ summary: 'Mes inscriptions aux formations' })
  myEnrollments(@CurrentUser('id') userId: string) {
    return this.service.getUserEnrollments(userId);
  }

  @Get('enrollments/:id/progress')
  getProgress(@Param('id') id: string) { return this.service.getEnrollmentProgress(id); }

  @Post('quiz-answers')
  @ApiOperation({ summary: 'Soumet une réponse à un quiz' })
  submitAnswer(@Body() body: any) { return this.service.submitQuizAnswer(body); }
}
