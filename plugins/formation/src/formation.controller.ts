import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile, Request, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FormationService } from './formation.service';
import { JwtAuthGuard } from '../../../apps/backend/src/common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../apps/backend/src/common/decorators/current-user.decorator';
import { Public } from '../../../apps/backend/src/common/decorators/public.decorator';

const ALLOWED_EXTENSIONS = ['.pdf', '.ppt', '.pptx', '.mp4', '.mkv', '.avi', '.zip', '.html', '.txt', '.md'];

const multerOptions = {
  storage: diskStorage({
    destination: './uploads/formation',
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) cb(null, true);
    else cb(new Error(`Format non supporté. Formats acceptés : ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  },
  limits: { fileSize: 500 * 1024 * 1024 },
};

@ApiTags('Plugin: Formation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plugins/formation')
export class FormationController {
  constructor(private service: FormationService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques globales de la formation' })
  getStats() { return this.service.getFormationStats(); }

  @Public()
  @Get('courses')
  @ApiOperation({ summary: 'Liste tous les cours' })
  findAll(@Query('published') published?: string) { return this.service.findAllCourses(published === 'true'); }

  @Public()
  @Get('courses/:id')
  findOne(@Param('id') id: string) { return this.service.findCourseById(id); }

  @Post('courses')
  create(@Body() body: any) { return this.service.createCourse(body); }

  @Patch('courses/:id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.updateCourse(id, body); }


  @Post('courses/:id/image')
  @ApiOperation({ summary: 'Upload une image de couverture pour un cours' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'courses'),
      filename: (_req: any, file: any, cb: any) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `course-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (_req: any, file: any, cb: any) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Seules les images sont acceptées'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadCourseImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    const imageUrl = `/uploads/courses/${file.filename}`;
    return this.service.updateCourse(id, { imageUrl, coverImage: imageUrl });
  }

  @Delete('courses/:id')
  deleteCourse(@Param('id') id: string) { return this.service.deleteCourse(id); }

  @Post('courses/:id/chapters')
  addChapter(@Param('id') courseId: string, @Body() body: any) { return this.service.addChapter(courseId, body); }

  @Patch('chapters/:id')
  updateChapter(@Param('id') id: string, @Body() body: any) { return this.service.updateChapter(id, body); }

  @Delete('chapters/:id')
  deleteChapter(@Param('id') id: string) { return this.service.deleteChapter(id); }

  @Post('chapters/:id/lessons')
  addLesson(@Param('id') chapterId: string, @Body() body: any) { return this.service.addLesson(chapterId, body); }

  @Patch('lessons/:id')
  updateLesson(@Param('id') id: string, @Body() body: any) { return this.service.updateLesson(id, body); }

  @Delete('lessons/:id')
  deleteLesson(@Param('id') id: string) { return this.service.deleteLesson(id); }

  @Post('lessons/:id/complete')
  @ApiOperation({ summary: 'Marque une leçon comme complétée' })
  completeLesson(@Param('id') lessonId: string, @CurrentUser('id') userId: string, @Body() body: { timeSpent?: number }) {
    return this.service.completeLesson(lessonId, userId, body.timeSpent);
  }

  @Post('documents/upload')
  @ApiOperation({ summary: 'Upload un support de cours (PDF, PPT, MP4, MKV, AVI, ZIP, HTML)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadDocument(@UploadedFile() file: any, @Body() body: any) {
    if (!file) throw new Error('Aucun fichier fourni');
    const ext = extname(file.originalname).toLowerCase();
    const typeMap: Record<string, string> = { '.pdf': 'PDF', '.ppt': 'PPT', '.pptx': 'PPT', '.mp4': 'VIDEO', '.mkv': 'VIDEO', '.avi': 'VIDEO', '.zip': 'ZIP', '.html': 'HTML', '.txt': 'TEXT', '.md': 'TEXT' };
    return this.service.addDocument({
      courseId: body.courseId, lessonId: body.lessonId,
      title: body.title || file.originalname, type: typeMap[ext] || 'FILE',
      url: `/uploads/formation/${file.filename}`, size: file.size, mimeType: file.mimetype,
      displayMode: body.displayMode || 'EMBED', order: body.order ? parseInt(body.order) : 0,
    });
  }

  @Patch('documents/:id')
  updateDocument(@Param('id') id: string, @Body() body: any) { return this.service.updateDocument(id, body); }

  @Delete('documents/:id')
  deleteDocument(@Param('id') id: string) { return this.service.deleteDocument(id); }

  @Get('lessons/:id/documents')
  getDocsByLesson(@Param('id') lessonId: string) { return this.service.getDocumentsByLesson(lessonId); }

  @Get('courses/:id/documents')
  getDocsByCourse(@Param('id') courseId: string) { return this.service.getDocumentsByCourse(courseId); }

  @Post('lessons/:id/quizzes')
  addQuiz(@Param('id') lessonId: string, @Body() body: any) { return this.service.addQuiz(lessonId, body); }

  @Post('quiz-answers')
  submitAnswer(@Body() body: any) { return this.service.submitQuizAnswer(body); }

  @Get('cohorts')
  getAllCohorts() { return this.service.getAllCohorts(); }

  @Get('cohorts/:id')
  getCohort(@Param('id') id: string) { return this.service.getCohortById(id); }

  @Post('courses/:id/cohorts')
  createCohort(@Param('id') courseId: string, @Body() body: any) { return this.service.createCohort(courseId, body); }

  @Patch('cohorts/:id')
  updateCohort(@Param('id') id: string, @Body() body: any) { return this.service.updateCohort(id, body); }

  @Post('cohorts/:id/enroll')
  enroll(@Param('id') cohortId: string, @CurrentUser('id') userId: string) { return this.service.enrollUser(cohortId, userId); }

  @Delete('enrollments/:id')
  unenroll(@Param('id') enrollmentId: string) { return this.service.unenrollUser(enrollmentId); }

  @Get('my-enrollments')
  myEnrollments(@CurrentUser('id') userId: string) { return this.service.getUserEnrollments(userId); }

  @Get('enrollments/:id/progress')
  getProgress(@Param('id') id: string) { return this.service.getEnrollmentProgress(id); }

  @Post('cohorts/:id/attendance')
  createAttendance(@Param('id') cohortId: string, @Body() body: any) { return this.service.createAttendanceSheet(cohortId, body); }

  @Get('cohorts/:id/attendance')
  getAttendance(@Param('id') cohortId: string) { return this.service.getAttendanceSheets(cohortId); }

  @Post('signatures')
  sign(@Body() body: any, @Request() req: any) { return this.service.signAttendance({ ...body, ipAddress: req.ip }); }

  @Get('enrollments/:id/signatures')
  getSignatures(@Param('id') enrollmentId: string) { return this.service.getSignaturesByEnrollment(enrollmentId); }

  @Post('notes')
  addNote(@Body() body: any, @CurrentUser('id') authorId: string) { return this.service.addLearnerNote({ ...body, authorId }); }

  @Get('enrollments/:id/notes')
  getNotes(@Param('id') enrollmentId: string, @Query('private') priv?: string) { return this.service.getLearnerNotes(enrollmentId, priv === 'true'); }

  @Patch('notes/:id')
  updateNote(@Param('id') id: string, @Body() body: any) { return this.service.updateLearnerNote(id, body); }

  @Delete('notes/:id')
  deleteNote(@Param('id') id: string) { return this.service.deleteLearnerNote(id); }

  @Get('cohorts/:id/qualiopi')
  @ApiOperation({ summary: 'Tableau de bord Qualiopi (suivi pédagogique complet)' })
  getQualiopi(@Param('id') cohortId: string) { return this.service.getQualiopi(cohortId); }

  // Objectives & Prerequisites
  @Post('courses/:id/objectives')
  setCourseObjectives(@Param('id') id: string, @Body() body: { objectives: string[] }) { return this.service.setCourseObjectives(id, body.objectives); }

  @Post('courses/:id/prerequisites')
  setCoursePrerequisites(@Param('id') id: string, @Body() body: { prerequisites: string[] }) { return this.service.setCoursePrerequisites(id, body.prerequisites); }

  @Post('lessons/:id/objectives')
  setLessonObjectives(@Param('id') id: string, @Body() body: { objectives: string[] }) { return this.service.setLessonObjectives(id, body.objectives); }

  // Quiz Management
  @Get('lessons/:id/quizzes')
  getQuizzesByLesson(@Param('id') lessonId: string) { return this.service.getQuizzesByLesson(lessonId); }

  @Patch('quizzes/:id')
  updateQuiz(@Param('id') id: string, @Body() body: any) { return this.service.updateQuiz(id, body); }

  @Delete('quizzes/:id')
  deleteQuiz(@Param('id') id: string) { return this.service.deleteQuiz(id); }

  // Rewards: Certificates, Badges, Leaderboard
  @Get('my-certificates')
  getMyCertificates(@CurrentUser('id') userId: string) { return this.service.getUserCertificates(userId); }

  @Get('my-badges')
  getMyBadges(@CurrentUser('id') userId: string) { return this.service.getUserBadges(userId); }

  @Get('leaderboard')
  getLeaderboard() { return this.service.getLeaderboard(); }

  // Feedback
  @Post('feedback')
  submitFeedback(@Body() body: any, @CurrentUser('id') userId: string) { return this.service.submitLessonFeedback(body.lessonId, userId, body.rating, body.comment); }

  @Get('lessons/:id/feedbacks')
  getFeedbacks(@Param('id') lessonId: string) { return this.service.getLessonFeedbacks(lessonId); }

  @Get('cohorts/:id/feedbacks')
  getCohortFeedbacks(@Param('id') cohortId: string) { return this.service.getCohortFeedbacks(cohortId); }

  // ─── Endpoints admin : gestion granulaire des accès ──────────────────────

  @Post("cohorts/:id/admin-enroll")
  @ApiOperation({ summary: "Admin: inscrire un utilisateur spécifique dans une cohorte" })
  adminEnroll(
    @Param("id") cohortId: string,
    @Body() body: { userId: string },
  ) {
    return this.service.enrollUserAdmin(cohortId, body.userId);
  }

  @Get("cohorts/:id/enrollments")
  @ApiOperation({ summary: "Admin: lister les inscrits d'une cohorte" })
  getCohortEnrollments(@Param("id") cohortId: string) {
    return this.service.getCohortEnrollments(cohortId);
  }

  @Get("users/:userId/access")
  @ApiOperation({ summary: "Admin: voir les acces cours d'un utilisateur" })
  getUserAccess(@Param("userId") userId: string) {
    return this.service.getUserCourseAccess(userId);
  }

}