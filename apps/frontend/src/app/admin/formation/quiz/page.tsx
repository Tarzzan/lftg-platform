'use client';
import { toast } from 'sonner';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formationApi } from '@/lib/api';
import { Trophy, Clock, Target, BookOpen, CheckCircle, XCircle, Award, RefreshCw, ChevronRight, Lock } from 'lucide-react';

type QuizState = 'LIST' | 'INTRO' | 'QUIZ' | 'RESULT';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

interface QuizWithLesson {
  id: string;
  lessonId: string;
  question: string;
  options: string[];
  answer: string;
  lesson?: { id: string; title: string; chapter?: { title: string; course?: { title: string } } };
}

export default function QuizPage() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<QuizState>('LIST');
  const [selectedLesson, setSelectedLesson] = useState<{ id: string; title: string; courseTitle: string } | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  // Récupérer les inscriptions de l'utilisateur
  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: formationApi.myEnrollments,
  });

  // Récupérer les certificats
  const { data: certificates = [] } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: formationApi.getMyCertificates,
  });

  // Récupérer les badges
  const { data: badges = [] } = useQuery({
    queryKey: ['my-badges'],
    queryFn: formationApi.getMyBadges,
  });

  // Extraire toutes les leçons avec quiz depuis les inscriptions
  const lessonsWithQuiz: Array<{ id: string; title: string; courseTitle: string; chapterTitle: string; enrollmentId: string }> = [];
  for (const enrollment of enrollments) {
    const course = enrollment.cohort?.course;
    if (!course) continue;
    for (const chapter of course.chapters || []) {
      for (const lesson of chapter.lessons || []) {
        lessonsWithQuiz.push({
          id: lesson.id,
          title: lesson.title,
          courseTitle: course.title,
          chapterTitle: chapter.title,
          enrollmentId: enrollment.id,
        });
      }
    }
  }

  // Mutation pour soumettre une réponse
  const submitMutation = useMutation({
    mutationFn: (data: { quizId: string; enrollmentId: string; answer: string }) =>
      formationApi.submitQuizAnswer(data),
  });

  // Timer
  useEffect(() => {
    if (state ==='QUIZ'&& timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (state ==='QUIZ'&& timeLeft === 0 && questions.length > 0) {
      finishQuiz();
    }
  }, [state, timeLeft]);

  const loadQuizForLesson = async (lesson: { id: string; title: string; courseTitle: string; enrollmentId: string }) => {
    try {
      const quizzes = await formationApi.getQuizzesByLesson(lesson.id);
      if (!quizzes || quizzes.length === 0) return;
      setSelectedLesson({ id: lesson.id, title: lesson.title, courseTitle: lesson.courseTitle });
      setEnrollmentId(lesson.enrollmentId);
      setQuestions(quizzes.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: typeof q.options ==='string'? JSON.parse(q.options) : q.options,
        answer: q.answer,
      })));
      setCurrentQuestion(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(quizzes.length * 60); // 1 min par question
      setState('INTRO');
    } catch (e) {
      console.error('Erreur chargement quiz:', e);
    }
  };

  const beginQuiz = () => setState('QUIZ');

  const submitAnswer = () => {
    if (!selectedAnswer) return;
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (!selectedAnswer) return;
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    // Soumettre la réponse à l'API
    if (enrollmentId) {
      submitMutation.mutate({
        quizId: questions[currentQuestion].id,
        enrollmentId,
        answer: selectedAnswer,
      });
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      finishQuiz([...newAnswers]);
    }
  };

  const finishQuiz = (finalAnswers?: string[]) => {
    const ans = finalAnswers || answers;
    const correct = ans.filter((a, i) => a === questions[i]?.answer).length;
    const finalScore = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setScore(finalScore);
    setState('RESULT');
    queryClient.invalidateQueries({ queryKey: ['my-badges'] });
    queryClient.invalidateQueries({ queryKey: ['my-certificates'] });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const q = questions[currentQuestion];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">

      {/* ─── LISTE ─────────────────────────────────────────────────────────── */}
      {state === 'LIST' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-white flex items-center gap-2">
                <Trophy className="w-7 h-7 text-amber-500" /> Quiz & Évaluations
              </h1>
              <p className="text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-1">Testez vos connaissances sur le référentiel RNCP Soigneur Animalier</p>
            </div>
          </div>

          {/* Badges obtenus */}
          {badges.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-700">
              <h2 className="font-semibold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" /> Mes badges ({badges.length})
              </h2>
              <div className="flex flex-wrap gap-3">
                {badges.map((ub: any) => (
                  <div key={ub.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm border border-amber-100">
                    <span className="text-xl">{ub.badge?.icon || ''}</span>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-foreground dark:text-white">{ub.badge?.name}</div>
                      <div className="text-xs text-gray-400">{new Date(ub.earnedAt).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificats obtenus */}
          {certificates.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-700">
              <h2 className="font-semibold text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Mes certificats ({certificates.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {certificates.map((cert: any) => (
                  <div key={cert.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-foreground dark:text-white text-sm">{cert.course?.title}</div>
                      <div className="text-xs text-gray-400">N° {cert.number} · {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}</div>
                    </div>
                    {cert.pdfUrl && (
                      <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-200 transition-colors">PDF</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leçons avec quiz */}
          <div>
            <h2 className="font-semibold text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Quiz disponibles par leçon
            </h2>
            {lessonsWithQuiz.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune inscription active. Inscrivez-vous à une cohorte pour accéder aux quiz.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {lessonsWithQuiz.map((lesson) => (
                  <div key={lesson.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-foreground dark:text-white text-sm">{lesson.title}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        <span className="text-emerald-600 font-medium">{lesson.courseTitle}</span>
                        {'·'}{lesson.chapterTitle}
                      </div>
                    </div>
                    <button
                      onClick={() => loadQuizForLesson(lesson)}
                      className="ml-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                      Démarrer <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── INTRO ─────────────────────────────────────────────────────────── */}
      {state === 'INTRO' && selectedLesson && (
        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-6xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-white mb-2">{selectedLesson.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-400 mb-6">{selectedLesson.courseTitle}</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Questions', value: questions.length, icon: '' },
                { label: 'Durée', value: `${Math.ceil(questions.length)} min`, icon: '⏱️' },
                { label: 'Seuil', value: '70%', icon: '' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 dark:bg-muted/20 dark:bg-gray-700/50 rounded-xl p-3">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="font-bold text-gray-900 dark:text-foreground dark:text-white">{item.value}</div>
                  <div className="text-xs text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setState('LIST')}
                className="flex-1 py-3 border border-gray-200 dark:border-border dark:border-gray-600 text-gray-600 dark:text-gray-400 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:bg-muted/20 transition-colors">
                Annuler
              </button>
              <button onClick={beginQuiz}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                Commencer le quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUIZ EN COURS ─────────────────────────────────────────────────── */}
      {state === 'QUIZ' && q && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400">
              Question {currentQuestion + 1}/{questions.length}
            </div>
            <div className={`font-mono font-bold text-lg flex items-center gap-1 ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
              <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-start space-x-3 mb-6">
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {currentQuestion + 1}
              </span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-foreground dark:text-white leading-relaxed">{q.question}</h3>
            </div>

            <div className="space-y-3">
              {q.options.map((option, i) => {
                const letter = ['A', 'B', 'C', 'D'][i];
                let cls = 'border-gray-200 dark:border-border dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer';
                if (showExplanation) {
                  if (option === q.answer) cls = 'border-green-500 bg-green-50 dark:bg-green-900/20';
                  else if (option === selectedAnswer) cls = 'border-red-400 bg-red-50 dark:bg-red-900/20';
                  else cls = 'border-gray-200 dark:border-border dark:border-gray-600 opacity-50';
                } else if (selectedAnswer === option) {
                  cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
                }

                return (
                  <button
                    key={i}
                    onClick={() => !showExplanation && setSelectedAnswer(option)}
                    className={`w-full flex items-center space-x-3 p-4 rounded-xl border-2 transition-all text-left ${cls}`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      showExplanation && option === q.answer ? 'bg-green-500 text-white' :
                      showExplanation && option === selectedAnswer ? 'bg-red-400 text-white' :
                      selectedAnswer === option ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-300'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-200">{option}</span>
                    {showExplanation && option === q.answer && <CheckCircle className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />}
                    {showExplanation && option === selectedAnswer && option !== q.answer && <XCircle className="w-5 h-5 text-red-400 ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Bonne réponse :</strong> {q.answer}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            {!showExplanation ? (
              <button onClick={submitAnswer} disabled={!selectedAnswer}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Valider
              </button>
            ) : (
              <button onClick={nextQuestion}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                {currentQuestion < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── RÉSULTATS ─────────────────────────────────────────────────────── */}
      {state === 'RESULT' && (
        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-6xl mb-4">{score >= 70 ? '' : ''}</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground dark:text-white mb-2">
              {score >= 70 ? 'Félicitations !' : 'Continuez vos efforts !'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-400 mb-6">{selectedLesson?.title}</p>

            <div className={`text-6xl font-bold mb-2 ${score >= 70 ? 'text-emerald-600' : 'text-amber-500'}`}>
              {score}%
            </div>
            <p className="text-sm text-gray-400 mb-8">
              {answers.filter((a, i) => a === questions[i]?.answer).length} / {questions.length} bonnes réponses
            </p>

            <div className={`p-4 rounded-xl mb-6 ${score >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200'}`}>
              <p className={`text-sm font-medium ${score >= 70 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {score >= 70
                  ? 'Seuil de réussite atteint (70%). Ce résultat est enregistré dans votre parcours Qualiopi.'
                  : '️ Seuil de réussite non atteint. Révisez les leçons concernées et retentez le quiz.'}
              </p>
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setState('LIST')}
                className="flex-1 py-3 border border-gray-200 dark:border-border dark:border-gray-600 text-gray-600 dark:text-gray-400 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:bg-muted/20 transition-colors flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" /> Retour aux quiz
              </button>
              {score < 70 && (
                <button onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setSelectedAnswer(null);
                  setShowExplanation(false);
                  setTimeLeft(questions.length * 60);
                  setState('INTRO');
                }}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Réessayer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
