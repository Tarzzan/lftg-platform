import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async getQuizzesByCourse(courseId: string) {
    return [
      {
        id: 'quiz-1',
        courseId,
        title: "Quiz — Soins aux perroquets",
        description: "Évaluez vos connaissances sur les soins aux psittacidés",
        questions: 10,
        timeLimit: 20,
        passingScore: 70,
        attempts: 3,
        status: 'PUBLISHED',
        createdAt: '2026-01-15T00:00:00Z',
      },
      {
        id: 'quiz-2',
        courseId,
        title: "Quiz — Réglementation CITES",
        description: "Test sur la convention CITES et les espèces protégées",
        questions: 15,
        timeLimit: 30,
        passingScore: 80,
        attempts: 2,
        status: 'PUBLISHED',
        createdAt: '2026-01-20T00:00:00Z',
      },
    ];
  }

  async getQuizDetails(quizId: string) {
    return {
      id: quizId,
      title: "Quiz — Soins aux perroquets",
      questions: [
        {
          id: "q-1",
          text: "Quelle est la fréquence de nourrissage recommandée pour un Ara adulte ?",
          type: "SINGLE_CHOICE",
          options: ['1 fois par jour', '2 fois par jour', '3 fois par jour', 'En libre service'],
          correctAnswer: 1,
          explanation: 'Les Aras adultes doivent être nourris 2 fois par jour, matin et soir.',
          points: 10,
        },
        {
          id: 'q-2',
          text: "Quels fruits sont toxiques pour les perroquets ?",
          type: "MULTIPLE_CHOICE",
          options: ['Avocat', 'Mangue', 'Raisin', 'Cerise (noyau)'],
          correctAnswers: [0, 3],
          explanation: 'L'avocat et les noyaux de cerise sont toxiques pour les perroquets.',
          points: 15,
        },
        {
          id: 'q-3',
          text: "La température idéale pour un perroquet tropical est de :",
          type: "SINGLE_CHOICE",
          options: ['15-18°C', '20-25°C', '28-32°C', '35-40°C'],
          correctAnswer: 1,
          explanation: 'Les perroquets tropicaux sont à l'aise entre 20 et 25°C.',
          points: 10,
        },
      ],
      timeLimit: 20,
      passingScore: 70,
      totalPoints: 100,
    };
  }

  async submitQuiz(quizId: string, userId: string, answers: any[]) {
    // Calculer le score
    const score = Math.floor(Math.random() * 40) + 60; // Mock: 60-100
    const passed = score >= 70;
    return {
      id: `attempt-${Date.now()}`,
      quizId,
      userId,
      score,
      passed,
      completedAt: new Date().toISOString(),
      timeSpent: 840, // secondes
      certificate: passed ? `cert-${Date.now()}` : null,
    };
  }

  async generateCertificate(userId: string, courseId: string) {
    return {
      id: `cert-${Date.now()}`,
      userId,
      courseId,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      certificateNumber: `LFTG-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      downloadUrl: `/api/quiz/certificates/${userId}/${courseId}/download`,
    };
  }

  async getUserProgress(userId: string) {
    return {
      userId,
      coursesEnrolled: 4,
      coursesCompleted: 2,
      quizzesTaken: 8,
      quizzesPassed: 6,
      averageScore: 82,
      certificatesEarned: 2,
      totalHours: 24,
      streak: 7,
    };
  }
}
