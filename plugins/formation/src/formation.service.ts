import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../apps/backend/src/modules/prisma/prisma.service';

@Injectable()
export class FormationService {
  constructor(private prisma: PrismaService) {}

  // --- Courses ---
  async findAllCourses(publishedOnly = false) {
    return this.prisma.course.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      include: {
        _count: { select: { chapters: true, cohorts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' }, include: { quizzes: true } } },
        },
        cohorts: true,
      },
    });
    if (!course) throw new NotFoundException(`Cours ${id} introuvable`);
    return course;
  }

  async createCourse(data: { title: string; description?: string }) {
    return this.prisma.course.create({ data });
  }

  async updateCourse(id: string, data: { title?: string; description?: string; isPublished?: boolean }) {
    await this.findCourseById(id);
    return this.prisma.course.update({ where: { id }, data });
  }

  // --- Chapters & Lessons ---
  async addChapter(courseId: string, data: { title: string; order: number }) {
    return this.prisma.chapter.create({ data: { ...data, courseId } });
  }

  async addLesson(chapterId: string, data: { title: string; content?: string; order: number }) {
    return this.prisma.lesson.create({ data: { ...data, chapterId } });
  }

  async addQuiz(lessonId: string, data: { question: string; options: string[]; answer: string }) {
    return this.prisma.quiz.create({ data: { ...data, lessonId } });
  }

  // --- Cohorts & Enrollments ---
  async createCohort(courseId: string, data: { name: string; startDate?: Date; endDate?: Date }) {
    return this.prisma.cohort.create({ data: { ...data, courseId } });
  }

  async enrollUser(cohortId: string, userId: string) {
    return this.prisma.enrollment.upsert({
      where: { id: `${cohortId}_${userId}` },
      update: {},
      create: { id: `${cohortId}_${userId}`, cohortId, userId },
    });
  }

  async getEnrollmentProgress(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        cohort: { include: { course: { include: { chapters: { include: { lessons: { include: { quizzes: true } } } } } } } },
        quizAnswers: true,
      },
    });
    if (!enrollment) throw new NotFoundException(`Inscription ${enrollmentId} introuvable`);

    const totalQuizzes = enrollment.cohort.course.chapters
      .flatMap((c) => c.lessons)
      .flatMap((l) => l.quizzes).length;
    const answeredQuizzes = enrollment.quizAnswers.length;
    const progress = totalQuizzes > 0 ? (answeredQuizzes / totalQuizzes) * 100 : 0;

    return { ...enrollment, progress: Math.round(progress) };
  }

  async submitQuizAnswer(data: { quizId: string; enrollmentId: string; answer: string }) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: data.quizId } });
    if (!quiz) throw new NotFoundException(`Quiz ${data.quizId} introuvable`);
    const isCorrect = quiz.answer === data.answer;
    return this.prisma.quizAnswer.create({
      data: { ...data, isCorrect },
    });
  }

  async getUserEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: { cohort: { include: { course: { select: { id: true, title: true } } } } },
    });
  }
}
