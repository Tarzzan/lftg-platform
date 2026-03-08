'use client';
import { toast } from 'sonner';
import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Plus, Upload, Trash2, Edit2, ChevronDown, ChevronRight,
  FileText, Video, Archive, Globe, Eye, ExternalLink, Monitor, Layers,
  BookOpen, Clock, GripVertical, Save, X, Check
} from 'lucide-react';
import { formationApi } from '@/lib/api';

const DISPLAY_MODES = [
  { value: 'EMBED', label: 'Fenêtre embarquée', icon: Monitor, description: 'Affiché dans la page (iframe)' },
  { value: 'NEW_TAB', label: 'Nouvel onglet', icon: ExternalLink, description: 'Ouvre dans un nouvel onglet' },
  { value: 'MODAL', label: 'Fenêtre modale', icon: Layers, description: 'Fenêtre popup dans la page' },
];

const FILE_ICONS: Record<string, any> = {
  PDF: FileText, VIDEO: Video, ZIP: Archive, HTML: Globe, PPT: FileText, TEXT: FileText, FILE: FileText,
};

const FILE_COLORS: Record<string, string> = {
  PDF: 'text-red-500 bg-red-50', VIDEO: 'text-purple-500 bg-purple-50',
  ZIP: 'text-yellow-500 bg-yellow-50', HTML: 'text-blue-500 bg-blue-50',
  PPT: 'text-orange-500 bg-orange-50', TEXT: 'text-gray-500 bg-gray-50', FILE: 'text-gray-500 bg-gray-50',
};

function DocumentUploader({ courseId, lessonId, onSuccess }: { courseId?: string; lessonId?: string; onSuccess: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayMode, setDisplayMode] = useState('EMBED');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', file.name.replace(/\.[^.]+$/, ''));
    fd.append('displayMode', displayMode);
    if (courseId) fd.append('courseId', courseId);
    if (lessonId) fd.append('lessonId', lessonId);
    try {
      await formationApi.uploadDocument(fd);
      onSuccess();
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {DISPLAY_MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setDisplayMode(m.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              displayMode === m.value
                ? 'bg-forest-600 text-white border-forest-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-forest-400'
            }`}
          >
            <m.icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        ))}
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragging ? 'border-forest-500 bg-forest-50' : 'border-gray-200 hover:border-forest-400 hover:bg-gray-50'
        }`}
      >
        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.ppt,.pptx,.mp4,.mkv,.avi,.zip,.html,.txt,.md" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Envoi en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Déposer un fichier ou cliquer</p>
            <p className="text-xs text-gray-400">PDF, PPT, MP4, MKV, AVI, ZIP, HTML — max 500 MB</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentCard({ doc, onDelete, onUpdateMode }: { doc: any; onDelete: () => void; onUpdateMode: (mode: string) => void }) {
  const [editMode, setEditMode] = useState(false);
  const [mode, setMode] = useState(doc.displayMode || 'EMBED');
  const Icon = FILE_ICONS[doc.type] || FileText;
  const colorClass = FILE_COLORS[doc.type] || FILE_COLORS.FILE;

  const handleSave = () => { onUpdateMode(mode); setEditMode(false); };

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all group">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 uppercase tracking-wide">{doc.type}</span>
          {doc.size && <span className="text-xs text-gray-300">·</span>}
          {doc.size && <span className="text-xs text-gray-400">{(doc.size / 1024 / 1024).toFixed(1)} MB</span>}
        </div>
      </div>
      {editMode ? (
        <div className="flex items-center gap-2">
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="text-xs border rounded px-2 py-1">
            {DISPLAY_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => setEditMode(false)} className="p-1 text-gray-400 hover:bg-gray-50 rounded"><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-gray-400 mr-1">{DISPLAY_MODES.find((m) => m.value === doc.displayMode)?.label || 'Embarqué'}</span>
          <button onClick={() => setEditMode(true)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
}

function LessonEditor({ lesson, onClose }: { lesson: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState(lesson.content || '');
  const [duration, setDuration] = useState(lesson.duration?.toString() || '');
  const [showUpload, setShowUpload] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () => formationApi.updateLesson(lesson.id, { title, content, duration: duration ? parseInt(duration) : undefined }),
    onSuccess: () => {
      toast.success('Opération réussie avec succès'); qc.invalidateQueries({ queryKey: ['course'] }); onClose(); },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) => formationApi.deleteDocument(docId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course'] }),
  });

  const updateDocModeMutation = useMutation({
    mutationFn: ({ id, displayMode }: { id: string; displayMode: string }) => formationApi.updateDocument(id, { displayMode }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course'] }),
  });

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-amber-800">Modifier la leçon</h4>
        <button onClick={onClose} className="p-1 text-amber-600 hover:bg-amber-100 rounded"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Titre</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Durée (min)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Contenu pédagogique</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent resize-none" />
      </div>

      {/* Documents */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">Supports de cours</label>
          <button onClick={() => setShowUpload(!showUpload)} className="flex items-center gap-1 text-xs text-forest-600 hover:text-forest-700 font-medium">
            <Upload className="w-3 h-3" /> Ajouter un fichier
          </button>
        </div>
        {showUpload && (
          <div className="mb-3">
            <DocumentUploader lessonId={lesson.id} onSuccess={() => { qc.invalidateQueries({ queryKey: ['course'] }); setShowUpload(false); }} />
          </div>
        )}
        <div className="space-y-2">
          {(lesson.documents || []).map((doc: any) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDelete={() => deleteDocMutation.mutate(doc.id)}
              onUpdateMode={(mode) => updateDocModeMutation.mutate({ id: doc.id, displayMode: mode })}
            />
          ))}
          {(lesson.documents || []).length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">Aucun support de cours — ajoutez un fichier ci-dessus</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
        <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-forest-600 text-white rounded-lg hover:bg-forest-700 disabled:opacity-50">
          <Save className="w-3.5 h-3.5" /> Enregistrer
        </button>
      </div>
    </div>
  );
}

function ChapterSection({ chapter, courseId }: { chapter: any; courseId: string }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(true);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [addingLesson, setAddingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  const addLessonMutation = useMutation({
    mutationFn: () => formationApi.addLesson(chapter.id, { title: newLessonTitle, order: chapter.lessons.length + 1 }),
    onSuccess: () => {
      toast.success('Opération réussie avec succès'); qc.invalidateQueries({ queryKey: ['course'] }); setNewLessonTitle(''); setAddingLesson(false); },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: string) => formationApi.deleteLesson(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course'] }),
  });

  const deleteChapterMutation = useMutation({
    mutationFn: () => formationApi.deleteChapter(chapter.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course'] }),
  });

  return (
    <div className="lftg-card overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-forest-50 to-transparent cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <GripVertical className="w-4 h-4 text-gray-300" />
        {expanded ? <ChevronDown className="w-4 h-4 text-forest-600" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{chapter.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{chapter.lessons?.length || 0} leçon{chapter.lessons?.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); if (confirm('Supprimer ce chapitre et toutes ses leçons ?')) deleteChapterMutation.mutate(); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-3 border-t border-gray-50">
          {chapter.lessons?.map((lesson: any) => (
            <div key={lesson.id}>
              {editingLesson === lesson.id ? (
                <LessonEditor lesson={lesson} onClose={() => setEditingLesson(null)} />
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 group transition-colors">
                  <GripVertical className="w-4 h-4 text-gray-200" />
                  <div className="w-6 h-6 rounded-full bg-forest-100 text-forest-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{lesson.order}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{lesson.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {lesson.duration && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />{lesson.duration} min
                        </span>
                      )}
                      {lesson.documents?.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-forest-600">
                          <FileText className="w-3 h-3" />{lesson.documents.length} support{lesson.documents.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {lesson.quizzes?.length > 0 && (
                        <span className="text-xs text-amber-600">🎯 {lesson.quizzes.length} quiz</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingLesson(lesson.id)} className="p-1.5 text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if (confirm('Supprimer cette leçon ?')) deleteLessonMutation.mutate(lesson.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {addingLesson ? (
            <div className="flex items-center gap-2 p-2">
              <input
                autoFocus
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newLessonTitle.trim()) addLessonMutation.mutate(); if (e.key === 'Escape') setAddingLesson(false); }}
                placeholder="Titre de la leçon..."
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
              <button onClick={() => { if (newLessonTitle.trim()) addLessonMutation.mutate(); }} disabled={!newLessonTitle.trim()} className="px-3 py-2 text-sm bg-forest-600 text-white rounded-lg hover:bg-forest-700 disabled:opacity-50">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setAddingLesson(false)} className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setAddingLesson(true)} className="flex items-center gap-2 w-full p-2 text-sm text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Ajouter une leçon
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [addingChapter, setAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showUploadCourse, setShowUploadCourse] = useState(false);

  const { data: course, isLoading } = useQuery({ queryKey: ['course', id], queryFn: () => formationApi.getCourse(id) });

  const addChapterMutation = useMutation({
    mutationFn: () => formationApi.addChapter(id, { title: newChapterTitle, order: (course?.chapters?.length || 0) + 1 }),
    onSuccess: () => {
      toast.success('Opération réussie avec succès'); qc.invalidateQueries({ queryKey: ['course', id] }); setNewChapterTitle(''); setAddingChapter(false); },
  });

  const togglePublishMutation = useMutation({
    mutationFn: () => formationApi.updateCourse(id, { isPublished: !course?.isPublished }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course', id] }),
  });

  const deleteDocCourseMutation = useMutation({
    mutationFn: (docId: string) => formationApi.deleteDocument(docId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course', id] }),
  });

  const updateDocModeCourseMutation = useMutation({
    mutationFn: ({ docId, mode }: { docId: string; mode: string }) => formationApi.updateDocument(docId, { displayMode: mode }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course', id] }),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!course) return <div className="text-center py-12 text-gray-500">Formation introuvable</div>;

  const totalDuration = course.chapters?.flatMap((c: any) => c.lessons).reduce((sum: number, l: any) => sum + (l.duration || 0), 0) || 0;
  const totalLessons = course.chapters?.flatMap((c: any) => c.lessons).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {course.isPublished ? 'Publié' : 'Brouillon'}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{course.chapters?.length || 0} chapitres</span>
            <span className="flex items-center gap-1"><Layers className="w-4 h-4" />{totalLessons} leçons</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{Math.floor(totalDuration / 60)}h{totalDuration % 60 > 0 ? `${totalDuration % 60}min` : ''}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => togglePublishMutation.mutate()}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              course.isPublished
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-forest-600 text-white hover:bg-forest-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            {course.isPublished ? 'Dépublier' : 'Publier'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Chapitres et leçons */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Programme pédagogique</h2>
          </div>

          {course.chapters?.map((chapter: any) => (
            <ChapterSection key={chapter.id} chapter={chapter} courseId={id} />
          ))}

          {addingChapter ? (
            <div className="lftg-card p-4">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && newChapterTitle.trim()) addChapterMutation.mutate(); if (e.key === 'Escape') setAddingChapter(false); }}
                  placeholder="Titre du chapitre / bloc de compétences..."
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                />
                <button onClick={() => { if (newChapterTitle.trim()) addChapterMutation.mutate(); }} disabled={!newChapterTitle.trim()} className="px-4 py-2 text-sm bg-forest-600 text-white rounded-lg hover:bg-forest-700 disabled:opacity-50">
                  Ajouter
                </button>
                <button onClick={() => setAddingChapter(false)} className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingChapter(true)}
              className="flex items-center gap-2 w-full p-4 text-sm font-medium text-forest-600 hover:text-forest-700 border-2 border-dashed border-forest-200 hover:border-forest-400 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" /> Ajouter un chapitre / bloc de compétences
            </button>
          )}
        </div>

        {/* Panneau latéral — Supports de cours du cours */}
        <div className="space-y-4">
          <div className="lftg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Supports du cours</h3>
              <button onClick={() => setShowUploadCourse(!showUploadCourse)} className="p-1.5 text-forest-600 hover:bg-forest-50 rounded-lg">
                <Upload className="w-4 h-4" />
              </button>
            </div>
            {showUploadCourse && (
              <div className="mb-4">
                <DocumentUploader courseId={id} onSuccess={() => { qc.invalidateQueries({ queryKey: ['course', id] }); setShowUploadCourse(false); }} />
              </div>
            )}
            <div className="space-y-2">
              {(course.documents || []).map((doc: any) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onDelete={() => deleteDocCourseMutation.mutate(doc.id)}
                  onUpdateMode={(mode) => updateDocModeCourseMutation.mutate({ docId: doc.id, mode })}
                />
              ))}
              {(course.documents || []).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Aucun support de cours global</p>
              )}
            </div>
          </div>

          {/* Infos formation */}
          <div className="lftg-card p-4 space-y-3">
            <h3 className="font-semibold text-gray-800">Informations</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Catégorie</span>
                <span className="font-medium text-gray-700">{course.category || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Niveau</span>
                <span className="font-medium text-gray-700">{course.level || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Durée totale</span>
                <span className="font-medium text-gray-700">{course.duration || totalDuration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cohortes</span>
                <span className="font-medium text-gray-700">{course.cohorts?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
