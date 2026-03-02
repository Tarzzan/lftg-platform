// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../apps/backend/src/modules/prisma/prisma.service';

@Injectable()
export class FormationService {
  constructor(private prisma: PrismaService) {}

  // ─── Courses ──────────────────────────────────────────────────────────────
  async findAllCourses(publishedOnly = false) {
    return this.prisma.course.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      include: {
        chapters: { include: { lessons: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } },
        cohorts: { select: { id: true, name: true, status: true, startDate: true, endDate: true, _count: { select: { enrollments: true } } } },
        documents: { orderBy: { order: 'asc' } },
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
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: { quizzes: true, documents: { orderBy: { order: 'asc' } } },
            },
          },
        },
        cohorts: { include: { _count: { select: { enrollments: true } } } },
        documents: { orderBy: { order: 'asc' } },
      },
    });
    if (!course) throw new NotFoundException(`Cours ${id} introuvable`);
    return course;
  }

  async createCourse(data: any) {
    return this.prisma.course.create({ data });
  }

  async updateCourse(id: string, data: any) {
    return this.prisma.course.update({ where: { id }, data });
  }

  async deleteCourse(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }

  // ─── Chapters ─────────────────────────────────────────────────────────────
  async addChapter(courseId: string, data: { title: string; order: number }) {
    return this.prisma.chapter.create({ data: { ...data, courseId } });
  }

  async updateChapter(id: string, data: any) {
    return this.prisma.chapter.update({ where: { id }, data });
  }

  async deleteChapter(id: string) {
    return this.prisma.chapter.delete({ where: { id } });
  }

  // ─── Lessons ──────────────────────────────────────────────────────────────
  async addLesson(chapterId: string, data: any) {
    return this.prisma.lesson.create({ data: { ...data, chapterId } });
  }

  async updateLesson(id: string, data: any) {
    return this.prisma.lesson.update({ where: { id }, data });
  }

  async deleteLesson(id: string) {
    return this.prisma.lesson.delete({ where: { id } });
  }

  // ─── Documents (supports multi-format) ───────────────────────────────────
  async addDocument(data: {
    courseId?: string;
    lessonId?: string;
    title: string;
    type: string;
    url: string;
    size?: number;
    mimeType?: string;
    displayMode?: string;
    order?: number;
  }) {
    return this.prisma.formationDocument.create({ data });
  }

  async updateDocument(id: string, data: any) {
    return this.prisma.formationDocument.update({ where: { id }, data });
  }

  async deleteDocument(id: string) {
    return this.prisma.formationDocument.delete({ where: { id } });
  }

  async getDocumentsByLesson(lessonId: string) {
    return this.prisma.formationDocument.findMany({ where: { lessonId }, orderBy: { order: 'asc' } });
  }

  async getDocumentsByCourse(courseId: string) {
    return this.prisma.formationDocument.findMany({ where: { courseId }, orderBy: { order: 'asc' } });
  }

  // ─── Quiz ─────────────────────────────────────────────────────────────────
  async addQuiz(lessonId: string, data: { question: string; options: string[]; answer: string }) {
    return this.prisma.quiz.create({ data: { ...data, lessonId } });
  }

  async submitQuizAnswer(data: { quizId: string; enrollmentId: string; answer: string }) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: data.quizId } });
    if (!quiz) throw new NotFoundException(`Quiz ${data.quizId} introuvable`);
    const isCorrect = quiz.answer === data.answer;
    return this.prisma.quizAnswer.create({ data: { ...data, isCorrect } });
  }

  // ─── Cohorts ──────────────────────────────────────────────────────────────
  async createCohort(courseId: string, data: any) {
    return this.prisma.cohort.create({ data: { ...data, courseId } });
  }

  async updateCohort(id: string, data: any) {
    return this.prisma.cohort.update({ where: { id }, data });
  }

  async getCohortById(id: string) {
    return this.prisma.cohort.findUnique({
      where: { id },
      include: {
        course: true,
        enrollments: {
          include: {
            learnerNotes: { include: { author: { select: { name: true } } } },
            signatures: true,
          },
        },
        attendanceSheets: { orderBy: { sessionDate: 'desc' } },
      },
    });
  }

  async getAllCohorts() {
    return this.prisma.cohort.findMany({
      include: {
        course: { select: { id: true, title: true } },
        _count: { select: { enrollments: true, attendanceSheets: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  // ─── Enrollments ──────────────────────────────────────────────────────────
  async enrollUser(cohortId: string, userId: string) {
    const existing = await this.prisma.enrollment.findFirst({ where: { cohortId, userId } });
    if (existing) return existing;
    return this.prisma.enrollment.create({ data: { cohortId, userId } });
  }

  async unenrollUser(enrollmentId: string) {
    return this.prisma.enrollment.delete({ where: { id: enrollmentId } });
  }

  async getUserEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        cohort: {
          include: {
            course: {
              include: { chapters: { include: { lessons: { select: { id: true } } } } },
            },
          },
        },
        learnerNotes: { where: { isPrivate: false }, include: { author: { select: { name: true } } } },
      },
    });
  }

  async getEnrollmentProgress(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        cohort: { include: { course: { include: { chapters: { include: { lessons: true } } } } } },
        quizAnswers: true,
      },
    });
    if (!enrollment) throw new NotFoundException(`Inscription ${enrollmentId} introuvable`);
    const allLessons = enrollment.cohort.course.chapters.flatMap((c) => c.lessons);
    const completions = await this.prisma.lessonCompletion.findMany({
      where: { userId: enrollment.userId, lessonId: { in: allLessons.map((l) => l.id) } },
    });
    const progress = allLessons.length > 0 ? (completions.length / allLessons.length) * 100 : 0;
    return { ...enrollment, progress: Math.round(progress), completedLessons: completions.map((c) => c.lessonId) };
  }

  // ─── Lesson Completion ────────────────────────────────────────────────────
  async completeLesson(lessonId: string, userId: string, timeSpent?: number) {
    return this.prisma.lessonCompletion.upsert({
      where: { lessonId_userId: { lessonId, userId } },
      update: { completedAt: new Date(), timeSpent },
      create: { lessonId, userId, timeSpent },
    });
  }

  async getLessonCompletions(userId: string, courseId?: string) {
    if (courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: { chapters: { include: { lessons: { select: { id: true } } } } },
      });
      const lessonIds = course?.chapters.flatMap((c) => c.lessons.map((l) => l.id)) ?? [];
      return this.prisma.lessonCompletion.findMany({ where: { userId, lessonId: { in: lessonIds } } });
    }
    return this.prisma.lessonCompletion.findMany({ where: { userId } });
  }

  // ─── Attendance Sheets & Signatures ──────────────────────────────────────
  async createAttendanceSheet(cohortId: string, data: { sessionDate: Date; sessionTitle?: string; duration?: number }) {
    return this.prisma.attendanceSheet.create({ data: { ...data, cohortId } });
  }

  async getAttendanceSheets(cohortId: string) {
    return this.prisma.attendanceSheet.findMany({
      where: { cohortId },
      include: { signatures: { include: { user: { select: { id: true, name: true, email: true } } } } },
      orderBy: { sessionDate: 'desc' },
    });
  }

  async signAttendance(data: {
    userId: string;
    enrollmentId?: string;
    attendanceSheetId?: string;
    signatureData: string;
    type?: string;
    sessionDate?: Date;
    ipAddress?: string;
  }) {
    return this.prisma.signature.create({ data });
  }

  async getSignaturesByEnrollment(enrollmentId: string) {
    return this.prisma.signature.findMany({
      where: { enrollmentId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { signedAt: 'desc' },
    });
  }

  // ─── Learner Notes ────────────────────────────────────────────────────────
  async addLearnerNote(data: { enrollmentId: string; authorId: string; content: string; type?: string; isPrivate?: boolean }) {
    return this.prisma.learnerNote.create({ data });
  }

  async getLearnerNotes(enrollmentId: string, includePrivate = false) {
    return this.prisma.learnerNote.findMany({
      where: { enrollmentId, ...(includePrivate ? {} : { isPrivate: false }) },
      include: { author: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateLearnerNote(id: string, data: { content?: string; type?: string; isPrivate?: boolean }) {
    return this.prisma.learnerNote.update({ where: { id }, data });
  }

  async deleteLearnerNote(id: string) {
    return this.prisma.learnerNote.delete({ where: { id } });
  }

  // ─── Dashboard Qualiopi ───────────────────────────────────────────────────
  async getQualiopi(cohortId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      include: {
        course: { include: { chapters: { include: { lessons: true } } } },
        enrollments: { include: { learnerNotes: true, signatures: true, quizAnswers: true } },
        attendanceSheets: { include: { signatures: true } },
      },
    });
    if (!cohort) throw new NotFoundException(`Cohorte ${cohortId} introuvable`);

    const totalLessons = cohort.course.chapters.flatMap((c) => c.lessons).length;
    const enrollmentStats = await Promise.all(
      cohort.enrollments.map(async (enrollment) => {
        const completions = await this.prisma.lessonCompletion.findMany({ where: { userId: enrollment.userId } });
        const progress = totalLessons > 0 ? Math.round((completions.length / totalLessons) * 100) : 0;
        const user = await this.prisma.user.findUnique({ where: { id: enrollment.userId }, select: { name: true, email: true } });
        const correctAnswers = enrollment.quizAnswers.filter((a) => a.isCorrect).length;
        return {
          enrollmentId: enrollment.id,
          user,
          progress,
          completedLessons: completions.length,
          totalLessons,
          signaturesCount: enrollment.signatures.length,
          notesCount: enrollment.learnerNotes.length,
          quizScore: enrollment.quizAnswers.length > 0 ? Math.round((correctAnswers / enrollment.quizAnswers.length) * 100) : null,
        };
      })
    );

    const totalSignatures = cohort.attendanceSheets.flatMap((s) => s.signatures).length;
    const maxSignatures = cohort.enrollments.length * cohort.attendanceSheets.length;

    return {
      cohort: { id: cohort.id, name: cohort.name, status: cohort.status, startDate: cohort.startDate, endDate: cohort.endDate },
      course: { id: cohort.course.id, title: cohort.course.title },
      totalEnrollments: cohort.enrollments.length,
      totalAttendanceSessions: cohort.attendanceSheets.length,
      enrollmentStats,
      attendanceRate: maxSignatures > 0 ? Math.round((totalSignatures / maxSignatures) * 100) : 0,
    };
  }

  async getFormationStats() {
    const [totalCourses, totalCohorts, totalEnrollments, activeCohorts] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.cohort.count(),
      this.prisma.enrollment.count(),
      this.prisma.cohort.count({ where: { status: 'ACTIVE' } }),
    ]);
    return { totalCourses, totalCohorts, totalEnrollments, activeCohorts };
  }
}
