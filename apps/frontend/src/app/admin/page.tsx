'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';
import { statsApi, exportApi, api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type WidgetId = 'kpis' | 'revenue' | 'animals' | 'stock' | 'workflows' | 'broods' | 'medical' | 'sales' | 'stockEvolution';

interface Widget {
  id: WidgetId;
  title: string;
  icon: string;
  cols: number; // 1, 2 ou 3
}

const ALL_WIDGETS: Widget[] = [
  { id: 'kpis', title: 'Indicateurs clés', icon: '📊', cols: 3 },
  { id: 'revenue', title: 'Revenus (7 jours)', icon: '💰', cols: 2 },
  { id: 'animals', title: 'Animaux par espèce', icon: '🦜', cols: 1 },
  { id: 'stockEvolution', title: 'Mouvements stock', icon: '📦', cols: 2 },
  { id: 'workflows', title: 'Workflows par état', icon: '⚙️', cols: 1 },
  { id: 'broods', title: 'Couvées actives', icon: '🥚', cols: 1 },
  { id: 'medical', title: 'Actes médicaux récents', icon: '🏥', cols: 1 },
  { id: 'sales', title: 'Dernières ventes', icon: '🛒', cols: 1 },
];

const COLORS = ['#166534', '#d97706', '#1d4ed8', '#7c3aed', '#dc2626', '#0891b2', '#059669', '#b45309'];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(0) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Widgets ──────────────────────────────────────────────────────────────────

function KpisWidget({ stats, lowStockCount, pendingWorkflows }: any) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Animaux vivants', value: stats?.animals?.alive ?? '—', sub: `${stats?.animals?.species ?? 0} espèces`, icon: '🦜', color: 'forest' },
        { label: 'Couvées actives', value: stats?.animals?.activeBroods ?? '—', sub: 'En incubation', icon: '🥚', color: 'gold' },
        { label: 'Alertes stock', value: lowStockCount, sub: 'Articles en rupture', icon: '📦', color: lowStockCount > 0 ? 'red' : 'forest', urgent: lowStockCount > 0 },
        { label: 'Workflows actifs', value: stats?.workflows?.total ?? '—', sub: `${pendingWorkflows} en attente`, icon: '⚙️', color: 'blue' },
      ].map(kpi => (
        <div key={kpi.label} className={`p-4 rounded-xl border ${kpi.urgent ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' : 'bg-forest-50 dark:bg-forest-900/20 border-forest-200 dark:border-forest-700'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xl">{kpi.icon}</span>
          </div>
          <div className={`text-2xl font-bold ${kpi.urgent ? 'text-red-700 dark:text-red-400' : 'text-forest-700 dark:text-forest-400'}`}>{kpi.value}</div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">{kpi.label}</div>
          <div className="text-xs text-gray-400">{kpi.sub}</div>
        </div>
      ))}
    </div>
  );
}

function RevenueWidget({ stats }: any) {
  const data = stats?.dailyRevenue || Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleDateString('fr-FR', { weekday: 'short' }), revenue: 0 };
  });
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#166534" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#166534" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} formatter={(v: any) => [`${Number(v).toFixed(0)} €`]} />
        <Area type="monotone" dataKey="revenue" name="Revenus (€)" stroke="#166534" fill="url(#revGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function AnimalsWidget({ animalsBySpecies }: any) {
  if (!animalsBySpecies?.length) return <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Aucune donnée</div>;
  return (
    <div className="flex items-center gap-3">
      <ResponsiveContainer width="50%" height={140}>
        <PieChart>
          <Pie data={animalsBySpecies} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
            {animalsBySpecies.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-1">
        {animalsBySpecies.slice(0, 5).map((item: any, i: number) => (
          <div key={item.speciesId || i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{item.name}</span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StockEvolutionWidget({ stockEvolution }: any) {
  if (!stockEvolution?.length) return <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Aucun mouvement</div>;
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={stockEvolution}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="entrees" name="Entrées" stroke="#166534" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="sorties" name="Sorties" stroke="#ea580c" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function WorkflowsWidget({ workflowsByState }: any) {
  if (!workflowsByState?.length) return <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Aucun workflow</div>;
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={workflowsByState} barSize={24}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" name="Instances" radius={[4, 4, 0, 0]}>
          {workflowsByState.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function BroodsWidget({ stats }: any) {
  const broods = stats?.activeBroodsList || [];
  if (!broods.length) return <div className="flex items-center justify-center h-24 text-gray-400 text-sm">Aucune couvée active</div>;
  return (
    <div className="space-y-2">
      {broods.slice(0, 4).map((brood: any) => {
        const days = Math.floor((Date.now() - new Date(brood.incubationStartDate).getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div key={brood.id} className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{brood.species?.name}</p>
              <p className="text-xs text-gray-400">{brood.eggCount} œufs — Jour {days}</p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{brood.status}</span>
          </div>
        );
      })}
    </div>
  );
}

function MedicalWidget({ stats }: any) {
  const events = stats?.recentMedicalEvents || [];
  if (!events.length) return <div className="flex items-center justify-center h-24 text-gray-400 text-sm">Aucun acte récent</div>;
  return (
    <div className="space-y-2">
      {events.slice(0, 4).map((event: any) => (
        <div key={event.id} className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="text-lg">🏥</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{event.animal?.name || event.animal?.identifier || '—'}</p>
            <p className="text-xs text-gray-400">{event.notes || event.type}</p>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {new Date(event.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      ))}
    </div>
  );
}

function SalesWidget({ stats }: any) {
  const sales = stats?.recentSales || [];
  if (!sales.length) return <div className="flex items-center justify-center h-24 text-gray-400 text-sm">Aucune vente récente</div>;
  return (
    <div className="space-y-2">
      {sales.slice(0, 4).map((sale: any) => (
        <div key={sale.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{sale.reference}</p>
            <p className="text-xs text-gray-400">{sale.buyerName}</p>
          </div>
          <span className="text-sm font-bold text-green-700 dark:text-green-400">{sale.total?.toFixed(0)} €</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [editMode, setEditMode] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetId[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lftg_dashboard_widgets');
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return ['kpis', 'revenue', 'animals', 'stockEvolution', 'workflows', 'broods', 'medical', 'sales'];
  });

  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: statsApi.dashboard, refetchInterval: 30000 });
  const { data: animalsBySpecies = [] } = useQuery({ queryKey: ['animals-by-species'], queryFn: statsApi.animalsBySpecies });
  const { data: stockEvolution = [] } = useQuery({ queryKey: ['stock-evolution'], queryFn: () => statsApi.stockEvolution(14) });
  const { data: workflowsByState = [] } = useQuery({ queryKey: ['workflows-by-state'], queryFn: statsApi.workflowsByState });

  const lowStockCount = (stats as any)?.stock?.lowStock ?? 0;
  const pendingWorkflows = (workflowsByState as any[]).find((w: any) => w.state === 'pending')?.count ?? 0;

  const toggleWidget = useCallback((id: WidgetId) => {
    setVisibleWidgets(prev => {
      const next = prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id];
      if (typeof window !== 'undefined') localStorage.setItem('lftg_dashboard_widgets', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleExport = (url: string, filename: string) => {
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  };

  const renderWidgetContent = (id: WidgetId) => {
    switch (id) {
      case 'kpis': return <KpisWidget stats={stats} lowStockCount={lowStockCount} pendingWorkflows={pendingWorkflows} />;
      case 'revenue': return <RevenueWidget stats={stats} />;
      case 'animals': return <AnimalsWidget animalsBySpecies={animalsBySpecies} />;
      case 'stockEvolution': return <StockEvolutionWidget stockEvolution={stockEvolution} />;
      case 'workflows': return <WorkflowsWidget workflowsByState={workflowsByState} />;
      case 'broods': return <BroodsWidget stats={stats} />;
      case 'medical': return <MedicalWidget stats={stats} />;
      case 'sales': return <SalesWidget stats={stats} />;
      default: return null;
    }
  };

  const activeWidgets = ALL_WIDGETS.filter(w => visibleWidgets.includes(w.id));
  const inactiveWidgets = ALL_WIDGETS.filter(w => !visibleWidgets.includes(w.id));

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🦜 Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {editMode && inactiveWidgets.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {inactiveWidgets.map(w => (
                <button
                  key={w.id}
                  onClick={() => toggleWidget(w.id)}
                  className="px-3 py-1.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-forest-400 hover:text-forest-600 transition-colors"
                >
                  + {w.icon} {w.title}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setEditMode(e => !e)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              editMode
                ? 'bg-forest-600 text-white hover:bg-forest-700'
                : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {editMode ? '✓ Terminer' : '⚙️ Personnaliser'}
          </button>
        </div>
      </div>

      {/* Alertes */}
      {(lowStockCount > 0 || pendingWorkflows > 0) && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
          <span className="text-amber-600 text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Points d'attention</p>
            <ul className="mt-1 space-y-0.5">
              {lowStockCount > 0 && <li className="text-xs text-amber-700 dark:text-amber-400">{lowStockCount} article(s) en stock faible</li>}
              {pendingWorkflows > 0 && <li className="text-xs text-amber-700 dark:text-amber-400">{pendingWorkflows} workflow(s) en attente de validation</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Grille de widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeWidgets.map(widget => (
          <div
            key={widget.id}
            className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 relative group ${
              widget.cols === 3 ? 'lg:col-span-3 md:col-span-2' :
              widget.cols === 2 ? 'md:col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <span>{widget.icon}</span>
                {widget.title}
              </h3>
              {editMode && (
                <button
                  onClick={() => toggleWidget(widget.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all text-xl leading-none"
                  title="Masquer ce widget"
                >
                  ×
                </button>
              )}
            </div>
            {renderWidgetContent(widget.id)}
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">⚡ Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Export stock CSV', onClick: () => handleExport(exportApi.stockCsv(), 'stock.csv') },
            { label: 'Export animaux CSV', onClick: () => handleExport(exportApi.animauxCsv(), 'animaux.csv') },
            { label: 'Export audit CSV', onClick: () => handleExport(exportApi.auditCsv(), 'audit.csv') },
            { label: 'Export formations CSV', onClick: () => handleExport(exportApi.formationCsv(), 'formations.csv') },
          ].map(action => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
            >
              <span>📥</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
