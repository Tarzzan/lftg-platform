'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, CheckCircle, Circle, Play, FileText, Video,
  Archive, ExternalLink, Layers, Clock, ChevronDown,
  ChevronRight, PenLine, BookOpen, Award, Loader2,
  Download, Maximize2, SkipForward, Star, HelpCircle,
  Trash2, RefreshCw, CheckSquare, StickyNote, MessageSquare,
  ThumbsUp, ThumbsDown, Smile, Frown, Meh, Save, Plus, X
} from 'lucide-react';
import { formationApi } from '@/lib/api';

// ─── Lecteur de document multi-format ─────────────────────────────────────────
const DOC_TYPE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  PDF:   { icon: FileText, label: 'PDF',          color: 'text-red-500' },
  PPT:   { icon: Layers,   label: 'Présentation', color: 'text-orange-500' },
  VIDEO: { icon: Video,    label: 'Vidéo',        color: 'text-blue-500' },
  HTML:  { icon: ExternalLink, label: 'Web',      color: 'text-purple-500' },
  ZIP:   { icon: Archive,  label: 'Archive',      color: 'text-gray-500' },
};

function DocumentViewer({ doc }: { doc: any }) {
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const url = doc.url?.startsWith('http') ? doc.url : `${apiBase}${doc.url}`;
  const typeConf = DOC_TYPE_CONFIG[doc.type] || DOC_TYPE_CONFIG.PDF;
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
        <video controls className="w-full max-h-[480px]" src={url} preload="metadata">
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      </div>
    );
  }

  if (doc.type === 'PDF' || doc.type === 'PPT') {
    return (
      <div className={`rounded-xl overflow-hidden border border-gray-200 shadow-sm ${fullscreen ? 'fixed inset-4 z-50 bg-white' : ''}`}>
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
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
          <div className="flex flex-col items-center justify-center h-48 bg-gray-50 gap-2">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <p className="text-xs text-gray-400">Chargement du document...</p>
          </div>
        )}
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          className={`w-full ${fullscreen ? 'h-[calc(100vh-120px)]' : 'h-[500px]'} ${loaded ? '' : 'hidden'}`}
          onLoad={() => setLoaded(true)}
          title={doc.title}
        />
      </div>
    );
  }

  if (doc.type === 'HTML') {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 py-2 bg-purple-50 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-purple-700">{doc.title}</span>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:text-purple-700">
            Ouvrir ↗
          </a>
        </div>
        <iframe src={url} className="w-full h-[500px]" title={doc.title} sandbox="allow-scripts allow-same-origin allow-forms" />
      </div>
    );
  }

  return (
    <a href={url} download
      className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
        <Archive className="w-5 h-5 text-gray-500" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{doc.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">Cliquer pour télécharger</p>
      </div>
      <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
    </a>
  );
}

// ─── Pad de signature numérique amélioré ──────────────────────────────────────
function SignaturePad({ onSign, onCancel }: { onSign: (data: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [strokes, setStrokes] = useState(0);

  const getPos = useCallback((e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as MouseEvent).clientY - rect.top) * scaleY,
    };
  }, []);

  const startDraw = useCallback((e: any) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDrawing(true);
    setHasSignature(true);
    setStrokes((s) => s + 1);
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(...Object.values(getPos(e.nativeEvent, canvas)) as [number, number]);
  }, [getPos]);

  const draw = useCallback((e: any) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pos = getPos(e.nativeEvent, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [drawing, getPos]);

  const stopDraw = useCallback(() => setDrawing(false), []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setStrokes(0);
  }, []);

  const handleSign = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSign(canvas.toDataURL('image/png'));
  }, [onSign]);

  return (
    <div className="bg-white border-2 border-forest-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-forest-50 border-b border-forest-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-forest-100 flex items-center justify-center">
            <PenLine className="w-4 h-4 text-forest-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-forest-800">Signature numérique</p>
            <p className="text-xs text-forest-500">Émargement Qualiopi — Indicateur 10</p>
          </div>
        </div>
        <button
          onClick={clear}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
        >
          <RefreshCw className="w-3 h-3" /> Effacer
        </button>
      </div>

      {/* Canvas */}
      <div className="p-4">
        <div className={`relative border-2 rounded-xl overflow-hidden transition-colors ${
          hasSignature ? 'border-forest-300 bg-white' : 'border-dashed border-gray-200 bg-gray-50'
        }`}>
          <canvas
            ref={canvasRef}
            width={600}
            height={150}
            className="w-full cursor-crosshair touch-none block"
            style={{ height: '150px' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <PenLine className="w-4 h-4" /> Signez ici
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          {hasSignature
            ? `Signature en cours (${strokes} trait${strokes > 1 ? 's' : ''})`
            : 'Utilisez votre souris ou votre doigt pour signer'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSign}
          disabled={!hasSignature}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-forest-600 text-white rounded-xl hover:bg-forest-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <CheckSquare className="w-4 h-4" />
          Valider mon émargement
        </button>
      </div>
    </div>
  );
}

// ─── Quiz amélioré ────────────────────────────────────────────────────────────
function QuizBlock({ quiz, enrollmentId }: { quiz: any; enrollmentId: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const qc = useQueryClient();
  const options = typeof quiz.options === 'string' ? JSON.parse(quiz.options) : (quiz.options || []);
  const isCorrect = submitted && selected === quiz.answer;

  const submitMutation = useMutation({
    mutationFn: (answer: string) => formationApi.submitQuizAnswer({ quizId: quiz.id, enrollmentId, answer }),
    onSuccess: () => { setSubmitted(true); qc.invalidateQueries({ queryKey: ['enrollment-progress'] }); },
  });

  return (
    <div className="mb-5 last:mb-0">
      <p className="text-sm font-semibold text-gray-800 mb-3 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
        {quiz.question}
      </p>
      <div className="space-y-2">
        {options.map((opt: string, i: number) => {
          const isSelected = selected === opt;
          const isCorrectOpt = submitted && opt === quiz.answer;
          const isWrongOpt = submitted && isSelected && opt !== quiz.answer;
          const letter = String.fromCharCode(65 + i);
          return (
            <button
              key={opt}
              onClick={() => !submitted && setSelected(opt)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all border-2 ${
                isCorrectOpt ? 'bg-forest-50 border-forest-400 text-forest-800 font-medium' :
                isWrongOpt   ? 'bg-red-50 border-red-400 text-red-800' :
                isSelected   ? 'bg-gold-50 border-gold-400 text-gold-800' :
                               'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                isCorrectOpt ? 'bg-forest-500 text-white' :
                isWrongOpt   ? 'bg-red-500 text-white' :
                isSelected   ? 'bg-gold-500 text-white' :
                               'bg-gray-100 text-gray-500'
              }`}>{letter}</span>
              {opt}
              {isCorrectOpt && <CheckCircle className="w-4 h-4 text-forest-500 ml-auto" />}
            </button>
          );
        })}
      </div>
      {!submitted && selected && (
        <button
          onClick={() => submitMutation.mutate(selected)}
          disabled={submitMutation.isPending}
          className="mt-3 flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors"
        >
          {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
          Valider ma réponse
        </button>
      )}
      {submitted && (
        <div className={`mt-3 flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl ${
          isCorrect ? 'bg-forest-50 text-forest-700' : 'bg-red-50 text-red-700'
        }`}>
          {isCorrect ? '✅ Excellente réponse !' : `❌ La bonne réponse était : "${quiz.answer}"`}
        </div>
      )}
    </div>
  );
}

// ─── Bloc-notes privé ────────────────────────────────────────────────────────
function NotesPanel({ enrollmentId, lessonId }: { enrollmentId: string; lessonId: string }) {
  const qc = useQueryClient();
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', enrollmentId, lessonId],
    queryFn: () => formationApi.getNotes(enrollmentId, true),
  });

  const lessonNotes = notes.filter((n: any) => n.lessonId === lessonId || !n.lessonId);

  const addNote = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      await formationApi.addNote({ enrollmentId, lessonId, content: newNote, isPrivate: true });
      setNewNote('');
      qc.invalidateQueries({ queryKey: ['notes', enrollmentId, lessonId] });
    } catch {}
    setSaving(false);
  };

  const deleteNote = async (id: string) => {
    await formationApi.deleteNote(id);
    qc.invalidateQueries({ queryKey: ['notes', enrollmentId, lessonId] });
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <StickyNote className="w-4 h-4 text-amber-600" />
        <h4 className="text-sm font-semibold text-amber-800">Mes notes privées</h4>
        <span className="text-xs text-amber-500 ml-auto">{lessonNotes.length} note{lessonNotes.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex gap-2">
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          rows={2}
          placeholder="Ajoutez une note personnelle..."
          className="flex-1 text-sm bg-white border border-amber-200 rounded-xl px-3 py-2 text-gray-700 placeholder-amber-300 focus:outline-none focus:border-amber-400 resize-none"
        />
        <button onClick={addNote} disabled={!newNote.trim() || saving}
          className="px-3 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-40 transition-colors flex-shrink-0">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
      {lessonNotes.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {lessonNotes.map((note: any) => (
            <div key={note.id} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-amber-100 group">
              <p className="flex-1 text-xs text-gray-700 leading-relaxed">{note.content}</p>
              <button onClick={() => deleteNote(note.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Feedback de fin de leçon ─────────────────────────────────────────────────
function LessonFeedback({ enrollmentId, lessonId, onSubmit }: { enrollmentId: string; lessonId: string; onSubmit: () => void }) {
  const [rating, setRating] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async () => {
    if (!rating) return;
    try {
      await formationApi.submitFeedback({ enrollmentId, lessonId, rating, difficulty, comment });
      setSubmitted(true);
      setTimeout(onSubmit, 1500);
    } catch { onSubmit(); }
  };

  if (submitted) return (
    <div className="flex items-center gap-3 p-4 bg-forest-50 border border-forest-200 rounded-2xl">
      <CheckCircle className="w-5 h-5 text-forest-600" />
      <p className="text-sm font-semibold text-forest-800">Merci pour votre retour !</p>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-maroni-500" />
        <h4 className="text-sm font-semibold text-gray-800">Évaluez cette leçon</h4>
        <span className="text-xs text-gray-400 ml-auto">Indicateur Qualiopi I32</span>
      </div>
      {/* Étoiles */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Note globale</p>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)}
              className={`transition-transform hover:scale-110 ${s <= rating ? 'text-gold-400' : 'text-gray-200'}`}>
              <Star className="w-7 h-7 fill-current" />
            </button>
          ))}
        </div>
      </div>
      {/* Difficulté */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Niveau de difficulté ressenti</p>
        <div className="flex gap-2">
          {[
            { val: 'EASY', label: 'Facile', icon: Smile, color: 'text-forest-500 bg-forest-50 border-forest-200' },
            { val: 'MEDIUM', label: 'Moyen', icon: Meh, color: 'text-gold-500 bg-gold-50 border-gold-200' },
            { val: 'HARD', label: 'Difficile', icon: Frown, color: 'text-red-500 bg-red-50 border-red-200' },
          ].map(({ val, label, icon: Icon, color }) => (
            <button key={val} onClick={() => setDifficulty(val as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all
                ${difficulty === val ? color : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>
      {/* Commentaire */}
      <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2}
        placeholder="Un commentaire ? (optionnel)"
        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-maroni-400 resize-none" />
      <div className="flex gap-2">
        <button onClick={onSubmit} className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          Passer
        </button>
        <button onClick={submitFeedback} disabled={!rating}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold bg-maroni-600 text-white rounded-xl hover:bg-maroni-700 disabled:opacity-40 transition-colors">
          <Save className="w-4 h-4" /> Envoyer
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
  const [signed, setSigned] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
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
      setSigned(true);
      setShowSignature(false);
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      completeMutation.mutate(timeSpent);
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* En-tête leçon */}
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900">{lesson.title}</h2>
            {lesson.duration && (
              <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1.5">
                <Clock className="w-4 h-4" />
                Durée estimée : <strong>{lesson.duration} minutes</strong>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isCompleted && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-forest-100 text-forest-700 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" /> Validée
              </span>
            )}
            <button onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                ${showNotes ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300 hover:text-amber-600'}`}>
              <StickyNote className="w-3.5 h-3.5" /> Notes
            </button>
          </div>
        </div>
      </div>

      {/* Bloc-notes */}
      {showNotes && (
        <NotesPanel enrollmentId={enrollmentId} lessonId={lesson.id} />
      )}

      {/* Contenu textuel */}
      {lesson.content && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{lesson.content}</p>
        </div>
      )}

      {/* Documents */}
      {lesson.documents?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-maroni-500" />
            Supports de cours ({lesson.documents.length})
          </h3>
          {lesson.documents.map((doc: any) => (
            <DocumentViewer key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {/* Quiz */}
      {lesson.quizzes?.length > 0 && (
        <div className="bg-gradient-to-br from-gold-50 to-amber-50 border border-gold-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gold-800 mb-4 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Évaluation — {lesson.quizzes.length} question{lesson.quizzes.length > 1 ? 's' : ''}
          </h3>
          {lesson.quizzes.map((quiz: any) => (
            <QuizBlock key={quiz.id} quiz={quiz} enrollmentId={enrollmentId} />
          ))}
        </div>
      )}

      {/* Validation / Émargement + Feedback */}
      <div className="pt-4 border-t border-gray-100 space-y-4">
        {showFeedback ? (
          <LessonFeedback
            enrollmentId={enrollmentId}
            lessonId={lesson.id}
            onSubmit={() => { setShowFeedback(false); onComplete(); }}
          />
        ) : isCompleted || signed ? (
          <div className="flex items-center gap-3 p-4 bg-forest-50 border border-forest-200 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-forest-600" />
            </div>
            <div>
              <p className="font-semibold text-forest-800">Leçon validée avec succès</p>
              <p className="text-xs text-forest-600 mt-0.5">Émargement enregistré — Qualiopi I10</p>
            </div>
          </div>
        ) : showSignature ? (
          <SignaturePad
            onSign={(data) => signMutation.mutate(data)}
            onCancel={() => setShowSignature(false)}
          />
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSignature(true)}
              className="flex items-center gap-2 px-6 py-3 bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition-colors font-semibold shadow-sm hover:shadow-lftg"
            >
              <PenLine className="w-4 h-4" />
              Valider et émarger cette leçon
            </button>
            <p className="text-xs text-gray-400">
              Votre signature sera enregistrée pour l'audit Qualiopi
            </p>
          </div>
        )}
      </div>
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

  const completedLessons = new Set<string>(progressData?.completedLessons || []);
  const course = progressData?.cohort?.course;

  useEffect(() => {
    if (course?.chapters?.length > 0) {
      setExpandedChapters(new Set([course.chapters[0].id]));
      const firstLesson = course.chapters[0].lessons?.[0];
      if (firstLesson && !activeLesson) setActiveLesson(firstLesson);
    }
  }, [course]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-10 h-10 border-3 border-forest-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Chargement de votre formation...</p>
    </div>
  );

  if (!progressData) return (
    <div className="text-center py-12">
      <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">Inscription introuvable</p>
    </div>
  );

  const allLessons = course?.chapters?.flatMap((c: any) => c.lessons || []) || [];
  const progress = progressData.progress || 0;
  const activeIdx = allLessons.findIndex((l: any) => l.id === activeLesson?.id);
  const hasNext = activeIdx < allLessons.length - 1;

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 -mx-6 -mb-6">
      {/* ── Sidebar — Plan de cours ── */}
      <div className="w-72 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Retour au parcours
          </button>
          <h2 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{course?.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{progressData?.cohort?.name}</p>

          {/* Progression */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Progression</span>
              <span className="text-xs font-bold text-gray-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${
                  progress >= 80 ? 'bg-forest-500' : progress >= 50 ? 'bg-gold-500' : 'bg-maroni-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">{completedLessons.size}/{allLessons.length} leçons</p>
          </div>
        </div>

        {/* Chapitres */}
        <div className="flex-1 overflow-y-auto py-2">
          {course?.chapters?.map((chapter: any, chIdx: number) => {
            const isExpanded = expandedChapters.has(chapter.id);
            const chLessons = chapter.lessons || [];
            const chCompleted = chLessons.filter((l: any) => completedLessons.has(l.id)).length;
            const chDone = chCompleted === chLessons.length && chLessons.length > 0;

            return (
              <div key={chapter.id} className="px-2 mb-1">
                <button
                  onClick={() => {
                    const next = new Set(expandedChapters);
                    if (next.has(chapter.id)) next.delete(chapter.id); else next.add(chapter.id);
                    setExpandedChapters(next);
                  }}
                  className="flex items-center gap-2 w-full p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold bg-gray-100 text-gray-500">
                    {chIdx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{chapter.title}</p>
                    <p className="text-xs text-gray-400">{chCompleted}/{chLessons.length}</p>
                  </div>
                  {chDone
                    ? <CheckCircle className="w-3.5 h-3.5 text-forest-500 flex-shrink-0" />
                    : isExpanded
                    ? <ChevronDown className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  }
                </button>

                {isExpanded && (
                  <div className="ml-1 space-y-0.5 pb-1">
                    {chLessons.map((lesson: any) => {
                      const isDone = completedLessons.has(lesson.id);
                      const isActive = activeLesson?.id === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-all ${
                            isActive
                              ? 'bg-forest-50 border border-forest-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                            {isDone
                              ? <CheckCircle className="w-4 h-4 text-forest-500" />
                              : isActive
                              ? <Play className="w-3.5 h-3.5 text-forest-600" />
                              : <Circle className="w-3.5 h-3.5 text-gray-200" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${
                              isActive ? 'text-forest-800' : isDone ? 'text-gray-500' : 'text-gray-700'
                            }`}>{lesson.title}</p>
                            {lesson.duration && (
                              <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />{lesson.duration}min
                              </p>
                            )}
                          </div>
                          {lesson.documents?.length > 0 && (
                            <span className="text-xs text-gray-300 flex-shrink-0">{lesson.documents.length}📎</span>
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

        {/* Footer sidebar — Certificat */}
        {progress >= 100 && (
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gold-50 to-amber-50 rounded-xl border border-gold-200">
              <Award className="w-5 h-5 text-gold-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-gold-800">Formation terminée !</p>
                <p className="text-xs text-gold-600">Certificat disponible</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Zone principale ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30">
        {activeLesson ? (
          <div className="p-8">
            <LessonViewer
              lesson={activeLesson}
              enrollmentId={enrollmentId}
              isCompleted={completedLessons.has(activeLesson.id)}
              onComplete={() => {
                if (hasNext) {
                  setTimeout(() => setActiveLesson(allLessons[activeIdx + 1]), 1500);
                }
              }}
            />
            {/* Navigation entre leçons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 max-w-3xl mx-auto">
              <button
                onClick={() => activeIdx > 0 && setActiveLesson(allLessons[activeIdx - 1])}
                disabled={activeIdx === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Précédente
              </button>
              <span className="text-xs text-gray-400">{activeIdx + 1} / {allLessons.length}</span>
              <button
                onClick={() => hasNext && setActiveLesson(allLessons[activeIdx + 1])}
                disabled={!hasNext}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Suivante <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
            <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
              <BookOpen className="w-10 h-10 opacity-30" />
            </div>
            <p className="font-medium text-gray-500">Sélectionnez une leçon dans le plan de cours</p>
            <p className="text-sm">← Utilisez le menu de gauche pour naviguer</p>
          </div>
        )}
      </div>
    </div>
  );
}
