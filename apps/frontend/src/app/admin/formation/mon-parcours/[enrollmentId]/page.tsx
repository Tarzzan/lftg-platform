'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, CheckCircle, Circle, Lock, Play, FileText, Video,
  Archive, Globe, ExternalLink, Monitor, Layers, Clock, ChevronDown,
  ChevronRight, PenLine, AlertCircle, BookOpen, Award, Loader2
} from 'lucide-react';
import { formationApi } from '@/lib/api';

// ─── Lecteur de document multi-format ─────────────────────────────────────────
function DocumentViewer({ doc }: { doc: any }) {
  const [loaded, setLoaded] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const url = doc.url.startsWith('http') ? doc.url : `${apiBase}${doc.url}`;

  if (doc.displayMode === 'NEW_TAB') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group"
      >
        <ExternalLink className="w-5 h-5 text-blue-600" />
        <div className="flex-1">
          <p className="font-medium text-blue-800">{doc.title}</p>
          <p className="text-xs text-blue-500 mt-0.5">Cliquer pour ouvrir dans un nouvel onglet</p>
        </div>
        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">{doc.type}</span>
      </a>
    );
  }

  if (doc.type === 'VIDEO') {
    return (
      <div className="rounded-xl overflow-hidden bg-black">
        <video controls className="w-full max-h-96" src={url}>
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      </div>
    );
  }

  if (doc.type === 'PDF' || doc.type === 'PPT') {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-200">
        {!loaded && (
          <div className="flex items-center justify-center h-32 bg-gray-50">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}
        <iframe
          src={`${url}#toolbar=0`}
          className={`w-full h-96 ${loaded ? '' : 'hidden'}`}
          onLoad={() => setLoaded(true)}
          title={doc.title}
        />
      </div>
    );
  }

  if (doc.type === 'HTML') {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <iframe src={url} className="w-full h-96" title={doc.title} sandbox="allow-scripts allow-same-origin" />
      </div>
    );
  }

  return (
    <a
      href={url}
      download
      className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
    >
      <Archive className="w-5 h-5 text-gray-600" />
      <div className="flex-1">
        <p className="font-medium text-gray-800">{doc.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">Cliquer pour télécharger</p>
      </div>
    </a>
  );
}

// ─── Pad de signature numérique ───────────────────────────────────────────────
function SignaturePad({ onSign, onCancel }: { onSign: (data: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDrawing(true);
    setHasSignature(true);
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e.nativeEvent, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: any) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const pos = getPos(e.nativeEvent, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSign(canvas.toDataURL());
  };

  return (
    <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <PenLine className="w-4 h-4 text-forest-600" />
          Signature numérique d'émargement
        </p>
        <button onClick={clear} className="text-xs text-gray-400 hover:text-gray-600">Effacer</button>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full border border-gray-200 rounded-lg bg-gray-50 cursor-crosshair touch-none"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <p className="text-xs text-gray-400 text-center">Signez dans le cadre ci-dessus</p>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
        <button
          onClick={handleSign}
          disabled={!hasSignature}
          className="flex-1 py-2 text-sm bg-forest-600 text-white rounded-lg hover:bg-forest-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Valider ma signature
        </button>
      </div>
    </div>
  );
}

// ─── Leçon viewer ─────────────────────────────────────────────────────────────
function LessonViewer({ lesson, enrollmentId, isCompleted, onComplete }: {
  lesson: any; enrollmentId: string; isCompleted: boolean; onComplete: () => void;
}) {
  const [showSignature, setShowSignature] = useState(false);
  const [startTime] = useState(Date.now());
  const qc = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: (timeSpent: number) => formationApi.completeLesson(lesson.id, timeSpent),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['enrollment-progress'] }); onComplete(); },
  });

  const signMutation = useMutation({
    mutationFn: (signatureData: string) => formationApi.signAttendance({
      userId: 'me',
      enrollmentId,
      signatureData,
      type: 'LESSON',
      sessionDate: new Date().toISOString(),
    }),
    onSuccess: () => {
      setShowSignature(false);
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      completeMutation.mutate(timeSpent);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{lesson.title}</h2>
        {lesson.duration && (
          <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
            <Clock className="w-4 h-4" /> Durée estimée : {lesson.duration} minutes
          </p>
        )}
      </div>

      {lesson.content && (
        <div className="prose prose-sm max-w-none">
          <div className="bg-gray-50 rounded-xl p-5 text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
            {lesson.content}
          </div>
        </div>
      )}

      {/* Documents */}
      {lesson.documents?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Supports de cours</h3>
          {lesson.documents.map((doc: any) => (
            <DocumentViewer key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {/* Quiz */}
      {lesson.quizzes?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            🎯 Évaluation — {lesson.quizzes.length} question{lesson.quizzes.length > 1 ? 's' : ''}
          </h3>
          {lesson.quizzes.map((quiz: any) => (
            <QuizBlock key={quiz.id} quiz={quiz} enrollmentId={enrollmentId} />
          ))}
        </div>
      )}

      {/* Validation */}
      <div className="pt-4 border-t border-gray-100">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <CheckCircle className="w-5 h-5" />
            Leçon validée — Émargement enregistré
          </div>
        ) : showSignature ? (
          <SignaturePad
            onSign={(data) => signMutation.mutate(data)}
            onCancel={() => setShowSignature(false)}
          />
        ) : (
          <button
            onClick={() => setShowSignature(true)}
            className="flex items-center gap-2 px-6 py-3 bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition-colors font-medium"
          >
            <PenLine className="w-4 h-4" />
            Valider et émarger cette leçon
          </button>
        )}
      </div>
    </div>
  );
}

function QuizBlock({ quiz, enrollmentId }: { quiz: any; enrollmentId: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const qc = useQueryClient();
  const options = typeof quiz.options === 'string' ? JSON.parse(quiz.options) : quiz.options;

  const submitMutation = useMutation({
    mutationFn: (answer: string) => formationApi.submitQuizAnswer({ quizId: quiz.id, enrollmentId, answer }),
    onSuccess: () => { setSubmitted(true); qc.invalidateQueries({ queryKey: ['enrollment-progress'] }); },
  });

  return (
    <div className="mb-4 last:mb-0">
      <p className="text-sm font-medium text-amber-900 mb-2">{quiz.question}</p>
      <div className="space-y-2">
        {options?.map((opt: string) => {
          const isSelected = selected === opt;
          const isCorrect = submitted && opt === quiz.answer;
          const isWrong = submitted && isSelected && opt !== quiz.answer;
          return (
            <button
              key={opt}
              onClick={() => !submitted && setSelected(opt)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all border ${
                isCorrect ? 'bg-green-100 border-green-400 text-green-800 font-medium' :
                isWrong ? 'bg-red-100 border-red-400 text-red-800' :
                isSelected ? 'bg-amber-100 border-amber-400 text-amber-800' :
                'bg-white border-gray-200 text-gray-700 hover:border-amber-300'
              } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {!submitted && selected && (
        <button
          onClick={() => submitMutation.mutate(selected)}
          className="mt-2 px-4 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          Valider ma réponse
        </button>
      )}
      {submitted && (
        <p className={`mt-2 text-xs font-medium ${selected === quiz.answer ? 'text-green-600' : 'text-red-600'}`}>
          {selected === quiz.answer ? '✅ Bonne réponse !' : `❌ La bonne réponse était : ${quiz.answer}`}
        </p>
      )}
    </div>
  );
}

export default function EnrollmentDetailPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const router = useRouter();
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const { data: progressData, isLoading } = useQuery({
    queryKey: ['enrollment-progress', enrollmentId],
    queryFn: () => formationApi.getEnrollmentProgress(enrollmentId),
  });

  const completedLessons = new Set(progressData?.completedLessons || []);
  const course = progressData?.cohort?.course;

  useEffect(() => {
    if (course?.chapters?.length > 0) {
      setExpandedChapters(new Set([course.chapters[0].id]));
      const firstLesson = course.chapters[0].lessons?.[0];
      if (firstLesson && !activeLesson) setActiveLesson(firstLesson);
    }
  }, [course]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!progressData) return <div className="text-center py-12 text-gray-500">Inscription introuvable</div>;

  const allLessons = course?.chapters?.flatMap((c: any) => c.lessons) || [];
  const progress = progressData.progress || 0;

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0 -mx-6 -mb-6">
      {/* Sidebar — Plan de cours */}
      <div className="w-80 flex-shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col overflow-hidden">
        {/* Header sidebar */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h2 className="font-semibold text-gray-800 text-sm leading-tight">{course?.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{progressData?.cohort?.name}</p>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Progression</span>
              <span className="text-xs font-bold text-gray-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{completedLessons.size}/{allLessons.length} leçons complétées</p>
          </div>
        </div>

        {/* Chapitres et leçons */}
        <div className="flex-1 overflow-y-auto p-2">
          {course?.chapters?.map((chapter: any, chIdx: number) => {
            const isExpanded = expandedChapters.has(chapter.id);
            const chapterCompleted = chapter.lessons?.every((l: any) => completedLessons.has(l.id));
            return (
              <div key={chapter.id} className="mb-1">
                <button
                  onClick={() => {
                    const next = new Set(expandedChapters);
                    if (next.has(chapter.id)) next.delete(chapter.id); else next.add(chapter.id);
                    setExpandedChapters(next);
                  }}
                  className="flex items-center gap-2 w-full p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{chapter.title}</p>
                    <p className="text-xs text-gray-400">{chapter.lessons?.filter((l: any) => completedLessons.has(l.id)).length}/{chapter.lessons?.length} leçons</p>
                  </div>
                  {chapterCompleted && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="ml-2 space-y-0.5">
                    {chapter.lessons?.map((lesson: any, lIdx: number) => {
                      const isCompleted = completedLessons.has(lesson.id);
                      const isActive = activeLesson?.id === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`flex items-center gap-2.5 w-full p-2.5 rounded-lg text-left transition-all ${
                            isActive ? 'bg-forest-100 text-forest-800' : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : isActive ? (
                              <Play className="w-4 h-4 text-forest-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isActive ? 'text-forest-800' : ''}`}>{lesson.title}</p>
                            {lesson.duration && <p className="text-xs text-gray-400 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{lesson.duration}min</p>}
                          </div>
                          {lesson.documents?.length > 0 && (
                            <span className="text-xs text-gray-300">{lesson.documents.length}📎</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone principale — Contenu de la leçon */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeLesson ? (
          <LessonViewer
            lesson={activeLesson}
            enrollmentId={enrollmentId}
            isCompleted={completedLessons.has(activeLesson.id)}
            onComplete={() => {
              // Passer à la leçon suivante automatiquement
              const idx = allLessons.findIndex((l: any) => l.id === activeLesson.id);
              if (idx < allLessons.length - 1) {
                setTimeout(() => setActiveLesson(allLessons[idx + 1]), 1500);
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <BookOpen className="w-12 h-12 mb-3 opacity-30" />
            <p>Sélectionnez une leçon dans le plan de cours</p>
          </div>
        )}
      </div>
    </div>
  );
}
