'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bird, Package, Users, GitBranch, TrendingUp, AlertTriangle, Clock, CheckCircle,
  Download, BookOpen
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { statsApi, exportApi } from '@/lib/api';

// ─── Palette ─────────────────────────────────────────────────────────────────
const COLORS = ['#16a34a', '#ea580c', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, subtitle, icon: Icon, color, trend }: {
  title: string; value: string | number; subtitle?: string;
  icon: any; color: string; trend?: { value: number; label: string };
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp className="w-3 h-3 text-forest-600" />
          <span className="text-xs text-forest-600 font-medium">+{trend.value}%</span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ['dashboard-stats'], queryFn: statsApi.dashboard });
  const { data: animalsBySpecies = [] } = useQuery({ queryKey: ['animals-by-species'], queryFn: statsApi.animalsBySpecies });
  const { data: stockEvolution = [] } = useQuery({ queryKey: ['stock-evolution'], queryFn: () => statsApi.stockEvolution(14) });
  const { data: workflowsByState = [] } = useQuery({ queryKey: ['workflows-by-state'], queryFn: statsApi.workflowsByState });

  const lowStockCount = stats?.stock?.lowStock ?? 0;
  const pendingWorkflows = (workflowsByState as any[]).find((w: any) => w.state === 'pending')?.count ?? 0;

  const handleExport = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de La Ferme Tropicale de Guyane</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(lowStockCount > 0 || pendingWorkflows > 0) && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gold-50 border border-gold-200">
          <AlertTriangle className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gold-800">Points d'attention</p>
            <ul className="mt-1 space-y-0.5">
              {lowStockCount > 0 && (
                <li className="text-xs text-gold-700">{lowStockCount} article{lowStockCount > 1 ? 's' : ''} en stock faible</li>
              )}
              {pendingWorkflows > 0 && (
                <li className="text-xs text-gold-700">{pendingWorkflows} workflow{pendingWorkflows > 1 ? 's' : ''} en attente de validation</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Animaux vivants"
          value={stats?.animals?.alive ?? '—'}
          subtitle={`${stats?.animals?.species ?? 0} espèces`}
          icon={Bird}
          color="bg-forest-100 text-forest-700"
          trend={{ value: 12, label: 'ce mois' }}
        />
        <StatCard
          title="Couvées actives"
          value={stats?.animals?.activeBroods ?? '—'}
          subtitle="En incubation"
          icon={Bird}
          color="bg-gold-100 text-gold-700"
        />
        <StatCard
          title="Alertes stock"
          value={lowStockCount}
          subtitle="Articles en rupture"
          icon={Package}
          color={lowStockCount > 0 ? 'bg-red-100 text-red-700' : 'bg-forest-100 text-forest-700'}
        />
        <StatCard
          title="Workflows actifs"
          value={stats?.workflows?.total ?? '—'}
          subtitle={`${pendingWorkflows} en attente`}
          icon={GitBranch}
          color="bg-maroni-100 text-maroni-700"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Animals by species — Pie */}
        <div className="lftg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">Animaux par espèce</h2>
            <a href="/admin/animaux/liste" className="text-xs text-forest-600 hover:text-forest-700 font-medium">Voir tout →</a>
          </div>
          {(animalsBySpecies as any[]).length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Aucune donnée</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie
                    data={animalsBySpecies as any[]}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {(animalsBySpecies as any[]).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {(animalsBySpecies as any[]).slice(0, 6).map((item: any, i: number) => (
                  <div key={item.speciesId} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-foreground flex-1 truncate">{item.name}</span>
                    <span className="text-xs font-bold text-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Workflows by state — Bar */}
        <div className="lftg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">Workflows par état</h2>
            <a href="/admin/workflows" className="text-xs text-forest-600 hover:text-forest-700 font-medium">Voir tout →</a>
          </div>
          {(workflowsByState as any[]).length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={workflowsByState as any[]} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Instances" radius={[6, 6, 0, 0]}>
                  {(workflowsByState as any[]).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="lftg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-foreground">Mouvements de stock (14 derniers jours)</h2>
          <button
            onClick={() => handleExport(exportApi.stockCsv(), 'stock.csv')}
            className="flex items-center gap-1.5 text-xs text-forest-600 hover:text-forest-700 font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            Exporter CSV
          </button>
        </div>
        {(stockEvolution as any[]).length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Aucun mouvement enregistré</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stockEvolution as any[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="entrees" name="Entrées" stroke="#16a34a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sorties" name="Sorties" stroke="#ea580c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Export stock CSV', icon: Package, onClick: () => handleExport(exportApi.stockCsv(), 'stock.csv') },
          { label: 'Export animaux CSV', icon: Bird, onClick: () => handleExport(exportApi.animauxCsv(), 'animaux.csv') },
          { label: 'Export audit CSV', icon: GitBranch, onClick: () => handleExport(exportApi.auditCsv(), 'audit.csv') },
          { label: 'Export formations CSV', icon: BookOpen, onClick: () => handleExport(exportApi.formationCsv(), 'formations.csv') },
        ].map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium text-foreground transition-colors"
          >
            <Download className="w-4 h-4 text-forest-600" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
