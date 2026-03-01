'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
  ArrowLeft, Save, Play, Plus, Trash2, Settings,
  GitBranch, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronRight, Zap, Users, Mail, Database,
} from 'lucide-react';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkflowStep {
  id: string;
  type: 'start' | 'approval' | 'notification' | 'condition' | 'action' | 'end';
  label: string;
  description?: string;
  assignedRole?: string;
  x: number;
  y: number;
  connections: string[]; // IDs des steps suivants
  config?: Record<string, any>;
}

const STEP_TYPES = [
  { type: 'approval', label: 'Approbation', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-forest-100 border-forest-400 text-forest-700', description: 'Requiert une approbation manuelle' },
  { type: 'notification', label: 'Notification', icon: <Mail className="w-4 h-4" />, color: 'bg-blue-100 border-blue-400 text-blue-700', description: 'Envoie une notification' },
  { type: 'condition', label: 'Condition', icon: <GitBranch className="w-4 h-4" />, color: 'bg-amber-100 border-amber-400 text-amber-700', description: 'Branchement conditionnel' },
  { type: 'action', label: 'Action', icon: <Zap className="w-4 h-4" />, color: 'bg-purple-100 border-purple-400 text-purple-700', description: 'Action automatique' },
];

const STEP_COLORS: Record<string, string> = {
  start: 'bg-green-100 border-green-500 text-green-800',
  approval: 'bg-forest-100 border-forest-500 text-forest-800',
  notification: 'bg-blue-100 border-blue-500 text-blue-800',
  condition: 'bg-amber-100 border-amber-500 text-amber-800',
  action: 'bg-purple-100 border-purple-500 text-purple-800',
  end: 'bg-red-100 border-red-500 text-red-800',
};

const STEP_ICONS: Record<string, React.ReactNode> = {
  start: <Play className="w-4 h-4" />,
  approval: <CheckCircle className="w-4 h-4" />,
  notification: <Mail className="w-4 h-4" />,
  condition: <GitBranch className="w-4 h-4" />,
  action: <Zap className="w-4 h-4" />,
  end: <XCircle className="w-4 h-4" />,
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function WorkflowEditorPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [workflowName, setWorkflowName] = useState('Nouveau workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: 'start', type: 'start', label: 'Début', x: 80, y: 200, connections: [] },
    { id: 'end', type: 'end', label: 'Fin', x: 680, y: 200, connections: [] },
  ]);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (data: any) => api.post('/workflows/definitions', data),
    onSuccess: () => router.push('/admin/workflows'),
  });

  // ─── Drag & Drop ──────────────────────────────────────────────────────────

  const handleMouseDown = useCallback((e: React.MouseEvent, stepId: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const step = steps.find(s => s.id === stepId);
    if (!step) return;
    const rect = (e.target as HTMLElement).closest('[data-step]')?.getBoundingClientRect();
    if (!rect) return;
    setDragging({ id: stepId, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top });
    setSelectedStep(stepId);
  }, [steps]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragging.offsetX;
    const y = e.clientY - canvasRect.top - dragging.offsetY;
    setSteps(prev => prev.map(s => s.id === dragging.id ? { ...s, x: Math.max(0, x), y: Math.max(0, y) } : s));
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // ─── Connexions ───────────────────────────────────────────────────────────

  const handleConnect = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    setSteps(prev => prev.map(s => {
      if (s.id === fromId && !s.connections.includes(toId)) {
        return { ...s, connections: [...s.connections, toId] };
      }
      return s;
    }));
    setConnecting(null);
  }, []);

  // ─── Ajouter une étape ────────────────────────────────────────────────────

  const addStep = useCallback((type: string) => {
    const id = `step-${Date.now()}`;
    const typeConfig = STEP_TYPES.find(t => t.type === type);
    const newStep: WorkflowStep = {
      id,
      type: type as any,
      label: typeConfig?.label || type,
      description: typeConfig?.description,
      x: 200 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      connections: [],
    };
    setSteps(prev => [...prev, newStep]);
    setSelectedStep(id);
  }, []);

  const deleteStep = useCallback((id: string) => {
    if (id === 'start' || id === 'end') return;
    setSteps(prev => prev
      .filter(s => s.id !== id)
      .map(s => ({ ...s, connections: s.connections.filter(c => c !== id) }))
    );
    if (selectedStep === id) setSelectedStep(null);
  }, [selectedStep]);

  // ─── Sauvegarder ─────────────────────────────────────────────────────────

  const handleSave = () => {
    const definition = {
      name: workflowName,
      description: workflowDescription,
      steps: steps.map(s => ({
        id: s.id,
        type: s.type,
        label: s.label,
        description: s.description,
        assignedRole: s.assignedRole,
        connections: s.connections,
        config: s.config,
        position: { x: s.x, y: s.y },
      })),
    };
    saveMutation.mutate(definition);
  };

  const selectedStepData = steps.find(s => s.id === selectedStep);

  // ─── Rendu des connexions SVG ─────────────────────────────────────────────

  const renderConnections = () => {
    const lines: React.ReactNode[] = [];
    steps.forEach(step => {
      step.connections.forEach(targetId => {
        const target = steps.find(s => s.id === targetId);
        if (!target) return;
        const x1 = step.x + 80;
        const y1 = step.y + 28;
        const x2 = target.x;
        const y2 = target.y + 28;
        const cx1 = x1 + (x2 - x1) * 0.5;
        const cy1 = y1;
        const cx2 = x1 + (x2 - x1) * 0.5;
        const cy2 = y2;
        lines.push(
          <g key={`${step.id}-${targetId}`}>
            <path
              d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
              stroke="#166534"
              strokeWidth="2"
              fill="none"
              strokeDasharray={step.type === 'condition' ? '6,3' : undefined}
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      });
    });
    return lines;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -m-6">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-6 py-3 bg-card border-b border-border flex-shrink-0">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <input
            type="text"
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            className="text-lg font-display font-bold text-foreground bg-transparent border-none outline-none focus:bg-muted rounded px-2 py-0.5 w-full max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="btn-secondary flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Paramètres
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Palette d'étapes */}
        <div className="w-56 flex-shrink-0 bg-card border-r border-border p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Étapes disponibles</p>
          <div className="space-y-2">
            {STEP_TYPES.map(stepType => (
              <button
                key={stepType.type}
                onClick={() => addStep(stepType.type)}
                className={`w-full text-left p-3 rounded-xl border-2 ${stepType.color} hover:opacity-80 transition-opacity`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {stepType.icon}
                  <span className="text-sm font-semibold">{stepType.label}</span>
                </div>
                <p className="text-xs opacity-75">{stepType.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Légende</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-forest-600" /><span>Connexion directe</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-forest-600 border-dashed border-t-2" /><span>Condition</span></div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Étapes ({steps.length})</p>
            <div className="space-y-1">
              {steps.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStep(s.id)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors ${selectedStep === s.id ? 'bg-forest-100 text-forest-700' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  {STEP_ICONS[s.type]}
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-[radial-gradient(circle,_#e5e7eb_1px,_transparent_1px)] bg-[size:24px_24px] cursor-default"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={() => { setSelectedStep(null); setConnecting(null); }}
        >
          {/* SVG pour les connexions */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#166534" />
              </marker>
            </defs>
            {renderConnections()}
          </svg>

          {/* Étapes */}
          {steps.map(step => (
            <div
              key={step.id}
              data-step={step.id}
              className={`absolute select-none cursor-move rounded-xl border-2 shadow-sm transition-shadow ${STEP_COLORS[step.type]} ${selectedStep === step.id ? 'shadow-lg ring-2 ring-forest-400 ring-offset-2' : 'hover:shadow-md'}`}
              style={{ left: step.x, top: step.y, width: 160, zIndex: 2 }}
              onMouseDown={e => handleMouseDown(e, step.id)}
              onClick={e => { e.stopPropagation(); setSelectedStep(step.id); }}
            >
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  {STEP_ICONS[step.type]}
                  <span className="text-sm font-semibold truncate">{step.label}</span>
                </div>
                {step.description && (
                  <p className="text-xs opacity-70 truncate">{step.description}</p>
                )}
                {step.assignedRole && (
                  <div className="mt-1 flex items-center gap-1 text-xs opacity-70">
                    <Users className="w-3 h-3" />
                    <span>{step.assignedRole}</span>
                  </div>
                )}
              </div>

              {/* Boutons de connexion */}
              {step.type !== 'end' && (
                <button
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-forest-600 text-white flex items-center justify-center hover:bg-forest-700 transition-colors shadow-md"
                  onClick={e => {
                    e.stopPropagation();
                    if (connecting) {
                      handleConnect(connecting, step.id);
                    } else {
                      setConnecting(step.id);
                    }
                  }}
                  title={connecting ? 'Connecter ici' : 'Démarrer une connexion'}
                >
                  {connecting === step.id ? <ChevronRight className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </button>
              )}

              {/* Bouton supprimer */}
              {step.type !== 'start' && step.type !== 'end' && (
                <button
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                  onClick={e => { e.stopPropagation(); deleteStep(step.id); }}
                >
                  <XCircle className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* Indicateur de connexion en cours */}
          {connecting && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-forest-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-10">
              Cliquez sur une autre étape pour créer la connexion — <button onClick={() => setConnecting(null)} className="underline">Annuler</button>
            </div>
          )}
        </div>

        {/* Panneau de propriétés */}
        {selectedStepData && (
          <div className="w-64 flex-shrink-0 bg-card border-l border-border p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-foreground">Propriétés</p>
              {selectedStepData.type !== 'start' && selectedStepData.type !== 'end' && (
                <button onClick={() => deleteStep(selectedStepData.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Libellé</label>
                <input
                  type="text"
                  value={selectedStepData.label}
                  onChange={e => setSteps(prev => prev.map(s => s.id === selectedStepData.id ? { ...s, label: e.target.value } : s))}
                  className="input w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  value={selectedStepData.description || ''}
                  onChange={e => setSteps(prev => prev.map(s => s.id === selectedStepData.id ? { ...s, description: e.target.value } : s))}
                  rows={2}
                  className="input w-full text-sm resize-none"
                />
              </div>

              {selectedStepData.type === 'approval' && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Rôle approbateur</label>
                  <select
                    value={selectedStepData.assignedRole || ''}
                    onChange={e => setSteps(prev => prev.map(s => s.id === selectedStepData.id ? { ...s, assignedRole: e.target.value } : s))}
                    className="input w-full text-sm"
                  >
                    <option value="">Sélectionner un rôle</option>
                    {['admin', 'gestionnaire', 'responsable', 'soigneur'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedStepData.type === 'notification' && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Destinataires</label>
                  <select
                    value={selectedStepData.config?.recipients || ''}
                    onChange={e => setSteps(prev => prev.map(s => s.id === selectedStepData.id ? { ...s, config: { ...s.config, recipients: e.target.value } } : s))}
                    className="input w-full text-sm"
                  >
                    <option value="">Sélectionner</option>
                    {['Demandeur', 'Approbateurs', 'Tous les admins', 'Soigneurs'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Connexions ({selectedStepData.connections.length})</label>
                {selectedStepData.connections.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Aucune connexion</p>
                ) : (
                  <div className="space-y-1">
                    {selectedStepData.connections.map(cId => {
                      const target = steps.find(s => s.id === cId);
                      return target ? (
                        <div key={cId} className="flex items-center justify-between text-xs bg-muted rounded px-2 py-1">
                          <span className="flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 text-forest-600" />
                            {target.label}
                          </span>
                          <button
                            onClick={() => setSteps(prev => prev.map(s => s.id === selectedStepData.id ? { ...s, connections: s.connections.filter(c => c !== cId) } : s))}
                            className="text-red-400 hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Position : ({Math.round(selectedStepData.x)}, {Math.round(selectedStepData.y)})
                </p>
                <p className="text-xs text-muted-foreground">Type : {selectedStepData.type}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
