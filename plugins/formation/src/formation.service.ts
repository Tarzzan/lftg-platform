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
    const { thumbnailUrl, ...rest } = data;
    const mapped = { ...rest, ...(thumbnailUrl !== undefined ? { imageUrl: thumbnailUrl || null } : {}) };
    return this.prisma.course.create({ data: mapped });
  }

  async updateCourse(id: string, data: any) {
    const { thumbnailUrl, ...rest } = data;
    const mapped = { ...rest, ...(thumbnailUrl !== undefined ? { imageUrl: thumbnailUrl || null } : {}) };
    return this.prisma.course.update({ where: { id }, data: mapped });
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

  // ─── Objectifs pédagogiques ───────────────────────────────────────────────
  async setCourseObjectives(courseId: string, objectives: string[]) {
    await this.prisma.courseObjective.deleteMany({ where: { courseId } });
    return this.prisma.courseObjective.createMany({
      data: objectives.map((text, order) => ({ courseId, text, order })),
    });
  }

  async setCoursePrerequisites(courseId: string, prerequisites: string[]) {
    await this.prisma.coursePrerequisite.deleteMany({ where: { courseId } });
    return this.prisma.coursePrerequisite.createMany({
      data: prerequisites.map((text, order) => ({ courseId, text, order })),
    });
  }

  async setLessonObjectives(lessonId: string, objectives: string[]) {
    await this.prisma.lessonObjective.deleteMany({ where: { lessonId } });
    return this.prisma.lessonObjective.createMany({
      data: objectives.map((text, order) => ({ lessonId, text, order })),
    });
  }

  // ─── Feedback leçon ───────────────────────────────────────────────────────
  async submitLessonFeedback(lessonId: string, userId: string, rating: number, comment?: string) {
    return this.prisma.lessonFeedback.upsert({
      where: { lessonId_userId: { lessonId, userId } },
      update: { rating, comment },
      create: { lessonId, userId, rating, comment },
    });
  }

  async getLessonFeedbacks(lessonId: string) {
    return this.prisma.lessonFeedback.findMany({
      where: { lessonId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCohortFeedbacks(cohortId: string) {
    // Récupère tous les feedbacks des leçons des cours de cette cohorte
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { course: { include: { chapters: { include: { lessons: true } } } } },
    });
    if (!cohort) return [];
    const lessonIds = cohort.course.chapters.flatMap(c => c.lessons.map(l => l.id));
    return this.prisma.lessonFeedback.findMany({
      where: { lessonId: { in: lessonIds } },
      include: { user: { select: { name: true } }, lesson: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Notes privées apprenant ──────────────────────────────────────────────
  async savePrivateNote(lessonId: string, userId: string, content: string) {
    return this.prisma.learnerPrivateNote.upsert({
      where: { lessonId_userId: { lessonId, userId } },
      update: { content },
      create: { lessonId, userId, content },
    });
  }

  async getPrivateNote(lessonId: string, userId: string) {
    return this.prisma.learnerPrivateNote.findUnique({
      where: { lessonId_userId: { lessonId, userId } },
    });
  }

  // ─── Certificats ──────────────────────────────────────────────────────────
  async generateCertificate(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        cohort: { include: { course: true } },
        certificate: true,
      },
    });
    if (!enrollment) throw new NotFoundException(`Inscription ${enrollmentId} introuvable`);
    if (enrollment.certificate) return enrollment.certificate;
    const count = await this.prisma.certificate.count();
    const number = `LFTG-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    return this.prisma.certificate.create({
      data: {
        userId: enrollment.userId,
        courseId: enrollment.cohort.courseId,
        enrollmentId,
        number,
        issuedAt: new Date(),
      },
    });
  }

  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: { course: { select: { title: true, category: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  // ─── Badges & Gamification ────────────────────────────────────────────────
  async getAllBadges() {
    return this.prisma.badge.findMany({ orderBy: { code: 'asc' } });
  }

  async getUserBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async awardBadge(userId: string, badgeCode: string) {
    const badge = await this.prisma.badge.findUnique({ where: { code: badgeCode } });
    if (!badge) return null;
    return this.prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      update: {},
      create: { userId, badgeId: badge.id },
    });
  }

  async checkAndAwardBadges(userId: string) {
    const awarded: string[] = [];
    // Badge : première leçon complétée
    const completions = await this.prisma.lessonCompletion.count({ where: { userId } });
    if (completions >= 1) {
      const b = await this.awardBadge(userId, 'FIRST_LESSON');
      if (b) awarded.push('FIRST_LESSON');
    }
    // Badge : 10 leçons complétées
    if (completions >= 10) {
      const b = await this.awardBadge(userId, 'TEN_LESSONS');
      if (b) awarded.push('TEN_LESSONS');
    }
    // Badge : score quiz > 90%
    const quizAnswers = await this.prisma.quizAnswer.findMany({ where: { enrollment: { userId } } });
    if (quizAnswers.length >= 5) {
      const correctRate = quizAnswers.filter((a) => a.isCorrect).length / quizAnswers.length;
      if (correctRate >= 0.9) {
        const b = await this.awardBadge(userId, 'QUIZ_MASTER');
        if (b) awarded.push('QUIZ_MASTER');
      }
    }
    return awarded;
  }

  // ─── Quiz CRUD (constructeur admin) ──────────────────────────────────────
  async updateQuiz(id: string, data: { question?: string; options?: string[]; answer?: string }) {
    return this.prisma.quiz.update({ where: { id }, data });
  }

  async deleteQuiz(id: string) {
    return this.prisma.quiz.delete({ where: { id } });
  }

  async getQuizzesByLesson(lessonId: string) {
    return this.prisma.quiz.findMany({ where: { lessonId } });
  }

  // ─── Leaderboard ──────────────────────────────────────────────────────────────
  async getLeaderboard() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            lessonCompletions: true,
            badges: true,
            certificates: true,
          },
        },
      },
    });
    return users
      .map((u) => ({
        id: u.id,
        name: u.name,
        score: u._count.lessonCompletions * 10 + u._count.badges * 50 + u._count.certificates * 100,
        lessonCompletions: u._count.lessonCompletions,
        badges: u._count.badges,
        certificates: u._count.certificates,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }

}
