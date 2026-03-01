'use client';

import { useQuery } from '@tanstack/react-query';
import { Bird, Package, Users, GitBranch, TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { animauxApi, stockApi, workflowsApi } from '@/lib/api';

function StatCard({
  title, value, subtitle, icon: Icon, color, trend,
}: {
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

export default function DashboardPage() {
  const { data: animalStats } = useQuery({ queryKey: ['animal-stats'], queryFn: animauxApi.stats });
  const { data: stockAlerts } = useQuery({ queryKey: ['stock-alerts'], queryFn: stockApi.alerts });
  const { data: workflowInstances } = useQuery({
    queryKey: ['workflow-instances'],
    queryFn: () => workflowsApi.instances(),
  });

  const pendingWorkflows = workflowInstances?.filter((i: any) => i.currentState === 'pending')?.length ?? 0;
  const lowStockCount = stockAlerts?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bienvenue sur la plateforme de gestion LFTG
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Alerts banner */}
      {(lowStockCount > 0 || pendingWorkflows > 0) && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gold-50 border border-gold-200">
          <AlertTriangle className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gold-800">Points d'attention</p>
            <ul className="mt-1 space-y-0.5">
              {lowStockCount > 0 && (
                <li className="text-xs text-gold-700">
                  {lowStockCount} article{lowStockCount > 1 ? 's' : ''} en stock faible
                </li>
              )}
              {pendingWorkflows > 0 && (
                <li className="text-xs text-gold-700">
                  {pendingWorkflows} workflow{pendingWorkflows > 1 ? 's' : ''} en attente de validation
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Animaux vivants"
          value={animalStats?.aliveAnimals ?? '—'}
          subtitle={`${animalStats?.speciesCount ?? 0} espèces`}
          icon={Bird}
          color="bg-forest-100 text-forest-700"
          trend={{ value: 12, label: 'ce mois' }}
        />
        <StatCard
          title="Couvées actives"
          value={animalStats?.activeBroods ?? '—'}
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
          value={workflowInstances?.length ?? '—'}
          subtitle={`${pendingWorkflows} en attente`}
          icon={GitBranch}
          color="bg-maroni-100 text-maroni-700"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent workflow instances */}
        <div className="lftg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">Workflows récents</h2>
            <a href="/admin/workflows" className="text-xs text-forest-600 hover:text-forest-700 font-medium">
              Voir tout →
            </a>
          </div>
          {workflowInstances?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun workflow en cours</p>
          ) : (
            <div className="space-y-3">
              {(workflowInstances || []).slice(0, 5).map((instance: any) => (
                <div key={instance.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{instance.definition?.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {instance.entityId.slice(0, 8)}...</p>
                  </div>
                  <span className={`lftg-badge ${
                    instance.currentState === 'approved' ? 'badge-approved' :
                    instance.currentState === 'pending' ? 'badge-pending' :
                    instance.currentState === 'rejected' ? 'badge-rejected' : 'badge-draft'
                  }`}>
                    {instance.currentState}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock alerts */}
        <div className="lftg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground">Alertes de stock</h2>
            <a href="/admin/stock/articles" className="text-xs text-forest-600 hover:text-forest-700 font-medium">
              Voir tout →
            </a>
          </div>
          {lowStockCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="w-8 h-8 text-forest-500 mb-2" />
              <p className="text-sm text-muted-foreground">Tous les stocks sont suffisants</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(stockAlerts || []).slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Seuil: {item.lowStockThreshold} {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">{item.quantity} {item.unit}</p>
                    <span className="badge-rejected text-[10px]">Stock faible</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
