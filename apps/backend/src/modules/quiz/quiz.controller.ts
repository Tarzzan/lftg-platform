import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuizService } from './quiz.service';

@ApiTags('Quiz & Certificats')
@ApiBearerAuth()
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Quiz d\'un cours' })
  getQuizzesByCourse(@Param('courseId') courseId: string) {
    return this.quizService.getQuizzesByCourse(courseId);
  }

  @Get(':quizId')
  @ApiOperation({ summary: 'Détail d\'un quiz' })
  getQuizDetails(@Param('quizId') quizId: string) {
    return this.quizService.getQuizDetails(quizId);
  }

  @Post(':quizId/submit')
  @ApiOperation({ summary: 'Soumettre les réponses d\'un quiz' })
  submitQuiz(@Param('quizId') quizId: string, @Body() body: { userId: string; answers: any[] }) {
    return this.quizService.submitQuiz(quizId, body.userId, body.answers);
  }

  @Post('certificates/generate')
  @ApiOperation({ summary: 'Générer un certificat de réussite' })
  generateCertificate(@Body() body: { userId: string; courseId: string }) {
    return this.quizService.generateCertificate(body.userId, body.courseId);
  }

  @Get('progress/:userId')
  @ApiOperation({ summary: 'Progression d\'un utilisateur' })
  getUserProgress(@Param('userId') userId: string) {
    return this.quizService.getUserProgress(userId);
  }
}
