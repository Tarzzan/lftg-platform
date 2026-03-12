'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Activity, AlertTriangle, CheckCircle, Clock, TrendingUp,
  RefreshCw, Wifi, WifiOff, BarChart2, List, Download,
  Shield, Zap, Database, Server
} from 'lucide-react';
import { api } from '@/lib/api';

interface MonitoringStats {
  period: string;
  total: number;
  errors: number;
  successRate: number;
  avgDuration: number;
  bySection: { section: string; errors: number }[];
  byMethod: { method: string; count: number; avgDuration: number }[];
  recentErrors: LogEntry[];
}

interface LogEntry {
  id: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  success: boolean;
  section: string;
  errorMessage?: string;
  user?: { name: string; email: string } | null;
  timestamp: string;
}

interface DailyHistory {
  date: string;
  total: number;
  errors: number;
  successRate: number;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  successRate: number;
  errorsLastHour: number;
  totalLastHour: number;
  timestamp: string;
}

const SECTION_COLORS: Record<string, string> = {
  animaux: 'bg-emerald-500',
  especes: 'bg-teal-500',
  personnel: 'bg-blue-500',
  stock: 'bg-orange-500',
  formation: 'bg-purple-500',
  medical: 'bg-red-500',
  auth: 'bg-gray-500',
  monitoring: 'bg-indigo-500',
};

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-blue-400 bg-blue-400/10',
  POST: 'text-green-400 bg-green-400/10',
  PUT: 'text-yellow-400 bg-yellow-400/10',
  PATCH: 'text-orange-400 bg-orange-400/10',
  DELETE: 'text-red-400 bg-red-400/10',
};

export default function MonitoringPage() {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [history, setHistory] = useState<DailyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(24);
  const [liveErrors, setLiveErrors] = useState<LogEntry[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'logs' | 'live'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const sseRef = useRef<EventSource | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, healthRes, logsRes, historyRes] = await Promise.all([
        api.get(`/monitoring/stats?hours=${period}`),
        api.get('/monitoring/health'),
        api.get(`/monitoring/logs?hours=${period}&limit=100${errorsOnly ? '&errorsOnly=true' : ''}`),
        api.get('/monitoring/history'),
      ]);
      setStats(statsRes.data);
      setHealth(healthRes.data);
      setLogs(logsRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Erreur monitoring:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectSSE = () => {
    if (sseRef.current) sseRef.current.close();
    const lftgAuth = localStorage.getItem('lftg-auth');
    const token = lftgAuth ? JSON.parse(lftgAuth)?.state?.token || '' : '';
    const es = new EventSource(`/api/v1/monitoring/stream?token=${token}`);
    es.onopen = () => setSseConnected(true);
    es.onerror = () => setSseConnected(false);
    const handleError = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setLiveErrors(prev => [data, ...prev].slice(0, 100));
      } catch {}
    };
    es.addEventListener('crud.error.warning', handleError);
    es.addEventListener('crud.error.critical', handleError);
    sseRef.current = es;
  };

  useEffect(() => {
    fetchData();
    connectSSE();
    return () => {
      sseRef.current?.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [period, errorsOnly]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 30000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, period, errorsOnly]);

  const downloadReport = async () => {
    try {
      const res = await api.get('/monitoring/report');
      const content = res.data.report || JSON.stringify(res.data, null, 2);
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lftg-monitoring-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur rapport:', err);
    }
  };

  const getHealthColor = (status?: string) => {
    if (status === 'healthy') return 'text-green-400';
    if (status === 'degraded') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHealthBg = (status?: string) => {
    if (status === 'healthy') return 'bg-green-400/10 border-green-400/30';
    if (status === 'degraded') return 'bg-yellow-400/10 border-yellow-400/30';
    return 'bg-red-400/10 border-red-400/30';
  };

  const formatDuration = (ms: number) => ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  const formatDate = (d: string) => new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Chargement du monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tete */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary" />
            Surveillance CRUD
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Detection en temps reel des erreurs sur toutes les operations de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Indicateur SSE */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${sseConnected ? 'bg-green-400/10 border-green-400/30 text-green-400' : 'bg-red-400/10 border-red-400/30 text-red-400'}`}>
            {sseConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {sseConnected ? 'Flux en direct' : 'Deconnecte'}
          </div>

          {/* Periode */}
          <select
            value={period}
            onChange={e => setPeriod(Number(e.target.value))}
            className="text-sm bg-card border border-border rounded-lg px-3 py-1.5 text-foreground"
          >
            <option value={1}>Derniere heure</option>
            <option value={6}>6 dernieres heures</option>
            <option value={24}>24 dernieres heures</option>
            <option value={72}>3 derniers jours</option>
            <option value={168}>7 derniers jours</option>
          </select>

          {/* Auto-refresh */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${autoRefresh ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border text-muted-foreground'}`}
          >
            <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            Auto
          </button>

          {/* Rafraichir */}
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Actualiser
          </button>

          {/* Telecharger */}
          <button
            onClick={downloadReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="w-3 h-3" />
            Rapport
          </button>
        </div>
      </div>

      {/* Statut de sante */}
      {health && (
        <div className={`flex items-center gap-4 p-4 rounded-xl border ${getHealthBg(health.status)}`}>
          <div className={`p-2 rounded-full ${health.status === 'healthy' ? 'bg-green-400/20' : health.status === 'degraded' ? 'bg-yellow-400/20' : 'bg-red-400/20'}`}>
            {health.status === 'healthy' ? (
              <CheckCircle className={`w-6 h-6 ${getHealthColor(health.status)}`} />
            ) : (
              <AlertTriangle className={`w-6 h-6 ${getHealthColor(health.status)}`} />
            )}
          </div>
          <div>
            <p className={`font-semibold ${getHealthColor(health.status)}`}>
              {health.status === 'healthy' ? 'Systeme operationnel' : health.status === 'degraded' ? 'Degradation detectee' : 'Incidents critiques'}
            </p>
            <p className="text-sm text-muted-foreground">
              {health.errorsLastHour} erreur{health.errorsLastHour !== 1 ? 's' : ''} sur {health.totalLastHour} requete{health.totalLastHour !== 1 ? 's' : ''} dans la derniere heure
              &nbsp;&middot;&nbsp;Taux de succes : <span className={`font-medium ${getHealthColor(health.status)}`}>{health.successRate.toFixed(1)}%</span>
              &nbsp;&middot;&nbsp;Mis a jour : {formatDate(health.timestamp)}
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total requetes</span>
              <Database className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{stats.total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Sur {stats.period}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Erreurs</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <p className={`text-3xl font-bold ${stats.errors > 0 ? 'text-red-400' : 'text-green-400'}`}>{stats.errors}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.total > 0 ? ((stats.errors / stats.total) * 100).toFixed(1) : 0}% du total</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Taux de succes</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className={`text-3xl font-bold ${stats.successRate >= 95 ? 'text-green-400' : stats.successRate >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
              {stats.successRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Objectif : &ge; 95%</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Duree moyenne</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <p className={`text-3xl font-bold ${stats.avgDuration < 200 ? 'text-green-400' : stats.avgDuration < 500 ? 'text-yellow-400' : 'text-red-400'}`}>
              {formatDuration(Math.round(stats.avgDuration || 0))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Objectif : &lt; 200ms</p>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart2 },
            { id: 'history', label: 'Historique 7j', icon: TrendingUp },
            { id: 'logs', label: `Logs (${logs.length})`, icon: List },
            { id: 'live', label: `Flux direct (${liveErrors.length})`, icon: Zap },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Onglet Vue d'ensemble */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Par section */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Erreurs par section
            </h3>
            {stats.bySection.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-sm">Aucune erreur detectee</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.bySection.map(s => (
                  <div key={s.section} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SECTION_COLORS[s.section] || 'bg-gray-400'}`} />
                    <span className="text-sm flex-1 capitalize">{s.section}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${SECTION_COLORS[s.section] || 'bg-gray-400'}`}
                          style={{ width: `${Math.min((s.errors / Math.max(...stats.bySection.map(x => x.errors))) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-red-400 w-6 text-right">{s.errors}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Par methode HTTP */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              Requetes par methode HTTP
            </h3>
            {stats.byMethod.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">Aucune donnee disponible</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.byMethod.map(m => (
                  <div key={m.method} className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${METHOD_COLORS[m.method] || 'text-gray-400 bg-gray-400/10'}`}>
                      {m.method}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>{m.count} requete{m.count !== 1 ? 's' : ''}</span>
                        <span>moy. {formatDuration(Math.round(m.avgDuration || 0))}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${Math.min((m.count / Math.max(...stats.byMethod.map(x => x.count))) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Erreurs recentes */}
          {stats.recentErrors.length > 0 && (
            <div className="md:col-span-2 bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Dernieres erreurs detectees
              </h3>
              <div className="space-y-2">
                {stats.recentErrors.slice(0, 10).map(err => (
                  <div key={err.id} className="flex items-center gap-3 p-3 bg-red-400/5 border border-red-400/20 rounded-lg">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${METHOD_COLORS[err.method] || 'text-gray-400 bg-gray-400/10'}`}>
                      {err.method}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground flex-1 truncate">{err.url}</span>
                    <span className="text-xs font-bold text-red-400 flex-shrink-0">{err.statusCode}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{formatDuration(err.duration)}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">{formatDate(err.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pas d'erreurs */}
          {stats.recentErrors.length === 0 && (
            <div className="md:col-span-2 bg-card border border-green-400/20 rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
              <p className="font-semibold text-green-400">Aucune erreur sur la periode</p>
              <p className="text-sm text-muted-foreground mt-1">Toutes les operations CRUD se sont deroulees sans incident</p>
            </div>
          )}
        </div>
      )}

      {/* Onglet Historique 7 jours */}
      {activeTab === 'history' && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Historique sur 7 jours
          </h3>
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Aucune donnee disponible</p>
          ) : (
            <div className="space-y-3">
              {history.map((day, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-20 flex-shrink-0">{day.date}</span>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden relative">
                      {day.total > 0 && (
                        <>
                          <div
                            className="absolute inset-y-0 left-0 bg-green-400/30 rounded-lg"
                            style={{ width: `${(day.total / Math.max(...history.map(d => d.total), 1)) * 100}%` }}
                          />
                          {day.errors > 0 && (
                            <div
                              className="absolute inset-y-0 left-0 bg-red-400/60 rounded-lg"
                              style={{ width: `${(day.errors / Math.max(...history.map(d => d.total), 1)) * 100}%` }}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground w-20 text-right flex-shrink-0">
                      {day.total} ops
                    </span>
                    <span className={`text-xs font-medium w-12 text-right flex-shrink-0 ${day.errors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {day.errors > 0 ? `${day.errors} err.` : 'OK'}
                    </span>
                    <span className={`text-xs font-bold w-14 text-right flex-shrink-0 ${day.successRate >= 95 ? 'text-green-400' : day.successRate >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {day.successRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-400/30" /> Requetes reussies</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-400/60" /> Erreurs</div>
          </div>
        </div>
      )}

      {/* Onglet Logs detailles */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{logs.length} entree{logs.length !== 1 ? 's' : ''} sur les {period} dernieres heures</p>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={errorsOnly}
                onChange={e => setErrorsOnly(e.target.checked)}
                className="rounded"
              />
              Erreurs uniquement
            </label>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
                <p className="font-medium">Aucune entree dans les logs</p>
                <p className="text-sm">Toutes les operations CRUD se sont deroulees sans erreur</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Methode</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">URL</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Section</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Code</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Duree</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Utilisateur</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {logs.map(entry => (
                      <tr key={entry.id} className={`hover:bg-muted/30 transition-colors ${!entry.success ? 'bg-red-400/5' : ''}`}>
                        <td className="px-4 py-3">
                          {entry.success ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${METHOD_COLORS[entry.method] || 'text-gray-400 bg-gray-400/10'}`}>
                            {entry.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-48 truncate" title={entry.url}>{entry.url}</td>
                        <td className="px-4 py-3">
                          <span className="capitalize text-xs">{entry.section}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-mono text-xs font-bold ${entry.success ? 'text-green-400' : 'text-red-400'}`}>{entry.statusCode}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{formatDuration(entry.duration)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-32">{entry.user?.email || '—'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(entry.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onglet Flux en direct */}
      {activeTab === 'live' && (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${sseConnected ? 'bg-green-400/10 border-green-400/30 text-green-400' : 'bg-red-400/10 border-red-400/30 text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sseConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {sseConnected ? 'Connecte au flux SSE — les erreurs apparaissent ici en temps reel' : 'Deconnecte — tentative de reconnexion...'}
            {!sseConnected && (
              <button onClick={connectSSE} className="ml-auto text-xs underline">Reconnecter</button>
            )}
            {liveErrors.length > 0 && (
              <button onClick={() => setLiveErrors([])} className="ml-auto text-xs underline text-muted-foreground">Effacer</button>
            )}
          </div>

          {liveErrors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
              <Zap className="w-12 h-12 text-primary/30 mb-3" />
              <p className="font-medium">En attente d'erreurs...</p>
              <p className="text-sm">Les erreurs CRUD apparaitront ici en temps reel</p>
            </div>
          ) : (
            <div className="space-y-2">
              {liveErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-card border border-red-400/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${METHOD_COLORS[err.method] || 'text-gray-400 bg-gray-400/10'}`}>
                    {err.method}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground flex-1 truncate">{err.url}</span>
                  <span className="text-xs font-bold text-red-400 flex-shrink-0">{err.statusCode}</span>
                  {err.errorMessage && <span className="text-xs text-muted-foreground truncate max-w-48">{err.errorMessage}</span>}
                  <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">{formatDate(err.timestamp || new Date().toISOString())}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
