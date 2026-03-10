'use client';

/**
 * CoursePreviewModal — Mode prévisualisation admin
 * Reproduit fidèlement le rendu apprenant (sidebar + LessonViewer) en lecture seule.
 * Accessible depuis la page cours/[id] via le bouton "Prévisualiser".
 */

import { useState, useEffect } from 'react';
import {
  X, BookOpen, Clock, ChevronDown, ChevronRight, CheckCircle,
  Play, Circle, ArrowLeft, SkipForward, FileText, Video, Archive,
  Globe, Layers, ExternalLink, Download, Maximize2, Eye, Award,
  AlertTriangle, GraduationCap
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Lesson {
  id: string;
  title: string;
  content?: string;
  duration?: number;
  order: number;
  documents?: Document[];
  quizzes?: Quiz[];
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Document {
  id: string;
  title: string;
  type: string;
  url: string;
  displayMode: string;
}

interface Quiz {
  id: string;
  question: string;
  options: string[] | string;
  answer: string;
  explanation?: string;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  duration?: number;
  coverImage?: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
  chapters: Chapter[];
  documents?: Document[];
}

// ─── Document Viewer (lecture seule) ─────────────────────────────────────────
const DOC_TYPE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  PDF:   { icon: FileText,     label: 'PDF',          color: 'text-red-500' },
  TEXT:  { icon: FileText,     label: 'Texte',        color: 'text-gray-500' },
  FILE:  { icon: FileText,     label: 'Fichier',      color: 'text-gray-500' },
  PPT:   { icon: Layers,       label: 'Présentation', color: 'text-orange-500' },
  VIDEO: { icon: Video,        label: 'Vidéo',        color: 'text-blue-500' },
  HTML:  { icon: ExternalLink, label: 'Web',          color: 'text-purple-500' },
  ZIP:   { icon: Archive,      label: 'Archive',      color: 'text-yellow-500' },
};

function DocumentViewerPreview({ doc }: { doc: Document }) {
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const url = doc.url?.startsWith('http') ? doc.url : `${apiBase}${doc.url}`;
  const typeConf = DOC_TYPE_CONFIG[doc.type] || DOC_TYPE_CONFIG.FILE;
  const TypeIcon = typeConf.icon;

  if (doc.displayMode === 'NEW_TAB') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 bg-gradient-to-r from-maroni-50 to-maroni-100/50 border border-maroni-200 rounded-xl hover:shadow-sm transition-all group"
      >
        <div className="w-10 h-10 rounded-lg bg-maroni-100 flex items-center justify-center flex-shrink-0">
          <TypeIcon className={`w-5 h-5 ${typeConf.color}`} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-maroni-800 group-hover:text-maroni-900">{doc.title}</p>
          <p className="text-xs text-maroni-500 mt-0.5">Ouvrir dans un nouvel onglet</p>
        </div>
        <ExternalLink className="w-4 h-4 text-maroni-400 group-hover:text-maroni-600 transition-colors" />
      </a>
    );
  }

  if (doc.type === 'VIDEO') {
    return (
      <div className="rounded-xl overflow-hidden bg-black shadow-lg">
        <video controls className="w-full max-h-[400px]" src={url} preload="metadata">
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      </div>
    );
  }

  if (doc.type === 'PDF' || doc.type === 'PPT') {
    return (
      <div className={`rounded-xl overflow-hidden border border-gray-200 dark:border-border shadow-sm ${fullscreen ? 'fixed inset-4 z-[200] bg-white' : ''}`}>
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-muted/20 border-b border-gray-200 dark:border-border">
          <div className="flex items-center gap-2">
            <TypeIcon className={`w-4 h-4 ${typeConf.color}`} />
            <span className="text-xs font-medium text-gray-700">{doc.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <a href={url} download className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Télécharger">
              <Download className="w-3.5 h-3.5 text-gray-500" />
            </a>
            <button onClick={() => setFullscreen(!fullscreen)} className="p-1.5 rounded hover:bg-gray-200 transition-colors" title="Plein écran">
              <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>
        {!loaded && (
          <div className="flex flex-col items-center justify-center h-40 bg-gray-50 dark:bg-muted/20 gap-2">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Chargement du document...</p>
          </div>
        )}
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          className={`w-full ${fullscreen ? 'h-[calc(100vh-120px)]' : 'h-[450px]'} ${loaded ? '' : 'hidden'}`}
          onLoad={() => setLoaded(true)}
          title={doc.title}
        />
      </div>
    );
  }

  if (doc.type === 'HTML') {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-border shadow-sm">
        <div className="flex items-center justify-between px-3 py-2 bg-purple-50 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-purple-700">{doc.title}</span>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:text-purple-700">
            Ouvrir ↗
          </a>
        </div>
        <iframe src={url} className="w-full h-[450px]" title={doc.title} sandbox="allow-scripts allow-same-origin allow-forms" />
      </div>
    );
  }

  return (
    <a href={url} download
      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-muted/20 border border-gray-200 dark:border-border rounded-xl hover:bg-gray-100 dark:bg-gray-800 transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
        <Archive className="w-5 h-5 text-gray-500" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{doc.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Cliquer pour télécharger</p>
      </div>
      <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
    </a>
  );
}

// ─── Quiz Preview (lecture seule, non soumissible) ────────────────────────────
function QuizPreview({ quiz }: { quiz: Quiz }) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = typeof quiz.options === 'string' ? JSON.parse(quiz.options) : (quiz.options || []);
  const isCorrect = selected === quiz.answer;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-base">🎯</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">Quiz</p>
          <p className="font-semibold text-gray-900 dark:text-foreground">{quiz.question}</p>
        </div>
      </div>
      <div className="space-y-2 pl-11">
        {options.map((opt: string, idx: number) => {
          const isSelected = selected === opt;
          const isAnswer = opt === quiz.answer;
          let cls = 'border-gray-200 dark:border-border bg-white dark:bg-card text-gray-700 dark:text-gray-300 hover:border-amber-300 hover:bg-amber-50/50';
          if (isSelected && isCorrect) cls = 'border-forest-400 bg-forest-50 dark:bg-forest-900/20 text-forest-800 dark:text-forest-300';
          else if (isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300';
          else if (selected && isAnswer) cls = 'border-forest-300 bg-forest-50/50 dark:bg-forest-900/10 text-forest-700 dark:text-forest-400';
          return (
            <button
              key={idx}
              onClick={() => !selected && setSelected(opt)}
              disabled={!!selected}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${cls} disabled:cursor-default`}
            >
              <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
              {selected && isAnswer && <CheckCircle className="w-4 h-4 text-forest-500 ml-auto flex-shrink-0" />}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className={`pl-11 flex items-start gap-2 text-sm rounded-xl p-3 ${isCorrect ? 'bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
          {isCorrect ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <X className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          <span>{isCorrect ? 'Bonne réponse !' : `Mauvaise réponse. La bonne réponse est : ${quiz.answer}`}</span>
        </div>
      )}
      <p className="pl-11 text-xs text-amber-500 dark:text-amber-400 italic">
        ⚠ Mode prévisualisation — les réponses ne sont pas enregistrées
      </p>
    </div>
  );
}

// ─── Lesson Viewer Preview ────────────────────────────────────────────────────
function LessonViewerPreview({ lesson }: { lesson: Lesson }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* En-tête leçon */}
      <div className="border-b border-gray-100 dark:border-border pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">{lesson.title}</h2>
        {lesson.duration && (
          <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            <Clock className="w-4 h-4" />
            Durée estimée : <strong>{lesson.duration} minutes</strong>
          </p>
        )}
      </div>

      {/* Contenu textuel */}
      {lesson.content && (
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-card dark:to-card rounded-2xl p-6 border border-gray-100 dark:border-border">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Contenu pédagogique
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {lesson.content}
          </div>
        </div>
      )}

      {/* Documents */}
      {lesson.documents && lesson.documents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4" /> Supports de cours
          </h3>
          <div className="space-y-3">
            {lesson.documents.map((doc) => (
              <DocumentViewerPreview key={doc.id} doc={doc} />
            ))}
          </div>
        </div>
      )}

      {/* Quiz */}
      {lesson.quizzes && lesson.quizzes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            🎯 Quiz & Évaluations
          </h3>
          {lesson.quizzes.map((quiz) => (
            <QuizPreview key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}

      {/* Validation simulée (désactivée) */}
      <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-muted/30 border border-gray-200 dark:border-border rounded-2xl opacity-60">
        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-muted flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="font-semibold text-gray-600 dark:text-gray-400 text-sm">Validation désactivée en mode prévisualisation</p>
          <p className="text-xs text-gray-400 mt-0.5">L'émargement et la validation ne sont disponibles que pour les apprenants inscrits</p>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
interface CoursePreviewModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export function CoursePreviewModal({ course, isOpen, onClose }: CoursePreviewModalProps) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const allLessons = course.chapters?.flatMap((c) => c.lessons || []) || [];
  const activeIdx = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const hasNext = activeIdx < allLessons.length - 1;
  const hasPrev = activeIdx > 0;
  const totalLessons = allLessons.length;

  // Initialiser avec le premier chapitre et la première leçon
  useEffect(() => {
    if (isOpen && course.chapters?.length > 0) {
      setExpandedChapters(new Set([course.chapters[0].id]));
      const firstLesson = course.chapters[0].lessons?.[0];
      if (firstLesson) setActiveLesson(firstLesson);
    }
  }, [isOpen, course]);

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-background">
      {/* ── Bannière admin ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-amber-500 text-white shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-600/60 rounded-lg px-3 py-1">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-wide">Mode Prévisualisation Admin</span>
          </div>
          <span className="text-amber-100 text-sm hidden sm:block">
            Vue apprenant simulée — aucune action n'est enregistrée
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-100 text-xs hidden md:block">
            Appuyez sur <kbd className="bg-amber-600/50 px-1.5 py-0.5 rounded text-xs font-mono">Échap</kbd> pour fermer
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-amber-600/60 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <X className="w-4 h-4" /> Fermer
          </button>
        </div>
      </div>

      {/* ── Corps principal ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar — Plan de cours ── */}
        <div className="w-72 flex-shrink-0 border-r border-gray-100 dark:border-border bg-white dark:bg-card flex flex-col overflow-hidden">
          {/* Header sidebar */}
          <div className="p-4 border-b border-gray-100 dark:border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forest-600 to-forest-400 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-800 dark:text-foreground text-sm leading-tight line-clamp-2">{course.title}</h2>
                {course.category && (
                  <p className="text-xs text-gray-400 mt-0.5">{course.category}</p>
                )}
              </div>
            </div>
            {/* Progression simulée */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Progression simulée</span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {activeIdx >= 0 ? Math.round(((activeIdx) / totalLessons) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-forest-500 transition-all duration-500"
                  style={{ width: `${activeIdx >= 0 ? Math.round(((activeIdx) / totalLessons) * 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">{activeIdx >= 0 ? activeIdx : 0}/{totalLessons} leçons</p>
            </div>
          </div>

          {/* Chapitres */}
          <div className="flex-1 overflow-y-auto py-2">
            {course.chapters?.map((chapter, chIdx) => {
              const isExpanded = expandedChapters.has(chapter.id);
              return (
                <div key={chapter.id} className="mb-1">
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-muted/20 transition-colors"
                  >
                    {isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      : <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{chapter.title}</p>
                      <p className="text-xs text-gray-400">{chapter.lessons?.length || 0} leçon{(chapter.lessons?.length || 0) !== 1 ? 's' : ''}</p>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="pl-2 pr-2 pb-1 space-y-0.5">
                      {chapter.lessons?.map((lesson, lIdx) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isPast = activeIdx > allLessons.findIndex((l) => l.id === lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-all ${
                              isActive
                                ? 'bg-forest-50 dark:bg-forest-900/20 border border-forest-200 dark:border-forest-700'
                                : 'hover:bg-gray-50 dark:hover:bg-muted/20 border border-transparent'
                            }`}
                          >
                            <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                              {isPast
                                ? <CheckCircle className="w-4 h-4 text-forest-500" />
                                : isActive
                                ? <Play className="w-3.5 h-3.5 text-forest-600" />
                                : <Circle className="w-3.5 h-3.5 text-gray-200" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${
                                isActive ? 'text-forest-800 dark:text-forest-300' : isPast ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'
                              }`}>{lesson.title}</p>
                              {lesson.duration && (
                                <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                                  <Clock className="w-2.5 h-2.5" />{lesson.duration}min
                                </p>
                              )}
                            </div>
                            {lesson.documents && lesson.documents.length > 0 && (
                              <span className="text-xs text-gray-300 flex-shrink-0">{lesson.documents.length}📎</span>
                            )}
                            {lesson.quizzes && lesson.quizzes.length > 0 && (
                              <span className="text-xs flex-shrink-0">🎯</span>
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

          {/* Footer sidebar — Certificat simulé */}
          <div className="p-3 border-t border-gray-100 dark:border-border">
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gold-50 to-amber-50 dark:from-gold-900/10 dark:to-amber-900/10 rounded-xl border border-gold-200 dark:border-gold-700/50 opacity-50">
              <Award className="w-5 h-5 text-gold-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-gold-800 dark:text-gold-400">Certificat de fin de formation</p>
                <p className="text-xs text-gold-600 dark:text-gold-500">Disponible à 100% de progression</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Zone principale ── */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-background">
          {activeLesson ? (
            <div className="p-8">
              <LessonViewerPreview lesson={activeLesson} />

              {/* Navigation entre leçons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-border max-w-3xl mx-auto">
                <button
                  onClick={() => hasPrev && setActiveLesson(allLessons[activeIdx - 1])}
                  disabled={!hasPrev}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-border rounded-xl hover:bg-white dark:hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Précédente
                </button>
                <span className="text-xs text-gray-400">{activeIdx + 1} / {totalLessons}</span>
                <button
                  onClick={() => hasNext && setActiveLesson(allLessons[activeIdx + 1])}
                  disabled={!hasNext}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-border rounded-xl hover:bg-white dark:hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Suivante <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-card border border-gray-100 dark:border-border flex items-center justify-center shadow-sm">
                <BookOpen className="w-10 h-10 opacity-30" />
              </div>
              <p className="font-medium text-gray-500">Sélectionnez une leçon dans le plan de cours</p>
              <p className="text-sm">← Utilisez le menu de gauche pour naviguer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
