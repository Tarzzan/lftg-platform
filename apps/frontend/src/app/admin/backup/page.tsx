'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  HardDrive, Cloud, CloudOff, Play, RefreshCw, Settings,
  CheckCircle, XCircle, Clock, AlertTriangle, Database,
  Upload, Link, Unlink, Save, Info, ChevronDown, ChevronUp,
  Calendar, Folder
} from 'lucide-react';
import { api } from '@/lib/api';

interface BackupConfig {
  id: string;
  gdriveEnabled: boolean;
  gdriveRemoteName: string;
  gdrivePath: string;
  gdriveConnected: boolean;
  localRetentionDays: number;
  scheduleEnabled: boolean;
  scheduleHour: number;
}

interface GdriveStatus {
  rcloneInstalled: boolean;
  connected: boolean;
  remoteName: string;
  path: string;
}

interface BackupEntry {
  id: string;
  createdAt: string;
  type: 'manual' | 'scheduled';
  status: 'success' | 'error' | 'running';
  dbFile?: string;
  uploadsFile?: string;
  dbSize?: string;
  uploadsSize?: string;
  gdriveSync: boolean;
  errorMsg?: string;
  duration?: number;
}

export default function BackupPage() {
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [gdriveStatus, setGdriveStatus] = useState<GdriveStatus | null>(null);
  const [history, setHistory] = useState<BackupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [oauthStep, setOauthStep] = useState<'idle' | 'waiting' | 'code'>('idle');
  const [authUrl, setAuthUrl] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Formulaire local
  const [form, setForm] = useState({
    gdrivePath: 'Backups/LFTG',
    gdriveEnabled: false,
    localRetentionDays: 7,
    scheduleEnabled: true,
    scheduleHour: 3,
  });

  const showMsg = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadData = useCallback(async () => {
    try {
      const [cfgRes, gdriveRes, histRes] = await Promise.all([
        api.get('/backup/config'),
        api.get('/backup/gdrive/status'),
        api.get('/backup/history?limit=15'),
      ]);
      const cfgData: BackupConfig = cfgRes.data;
      const gdriveData: GdriveStatus = gdriveRes.data;
      const histData: BackupEntry[] = histRes.data;
      setConfig(cfgData);
      setGdriveStatus(gdriveData);
      setHistory(Array.isArray(histData) ? histData : []);
      setForm({
        gdrivePath: cfgData.gdrivePath,
        gdriveEnabled: cfgData.gdriveEnabled,
        localRetentionDays: cfgData.localRetentionDays,
        scheduleEnabled: cfgData.scheduleEnabled,
        scheduleHour: cfgData.scheduleHour,
      });
    } catch (e) {
      showMsg('error', 'Impossible de charger la configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling pour le backup en cours
  useEffect(() => {
    if (!runningId) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/backup/status/${runningId}`);
        const status = res.data;
        if (status.status !== 'running') {
          setRunningId(null);
          setTriggering(false);
          loadData();
          if (status.status === 'success') {
            showMsg('success', `Sauvegarde terminée en ${status.duration}s — DB: ${status.dbSize}, Uploads: ${status.uploadsSize}`);
          } else {
            showMsg('error', `Erreur lors de la sauvegarde: ${status.errorMsg}`);
          }
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [runningId, loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/backup/config', form);
      showMsg('success', 'Configuration sauvegardée');
      loadData();
    } catch {
      showMsg('error', 'Erreur lors de la sauvegarde de la configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const res = await api.post('/backup/trigger', {});
      setRunningId(res.data.id);
      showMsg('info', 'Sauvegarde lancée en arrière-plan...');
    } catch {
      setTriggering(false);
      showMsg('error', 'Impossible de lancer la sauvegarde');
    }
  };

  const handleGdriveConnect = async () => {
    setOauthStep('waiting');
    try {
      const res = await api.post('/backup/gdrive/connect', {});
      setAuthUrl(res.data.authUrl);
      setOauthStep('code');
    } catch {
      setOauthStep('idle');
      showMsg('error', 'Impossible d\'initier la connexion Google Drive');
    }
  };

  const handleGdriveFinalize = async () => {
    if (!authCode.trim()) return;
    try {
      const res = await api.post('/backup/gdrive/finalize', { authCode });
      if (res.data.success) {
        setOauthStep('idle');
        setAuthCode('');
        showMsg('success', 'Google Drive connecté avec succès !');
        loadData();
      } else {
        showMsg('error', res.data.message);
      }
    } catch {
      showMsg('error', 'Erreur lors de la finalisation de la connexion');
    }
  };

  const handleGdriveDisconnect = async () => {
    if (!confirm('Déconnecter Google Drive ? Les sauvegardes locales ne seront pas affectées.')) return;
    try {
      await api.delete('/backup/gdrive/disconnect');
      showMsg('success', 'Google Drive déconnecté');
      loadData();
    } catch {
      showMsg('error', 'Erreur lors de la déconnexion');
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const statusBadge = (status: string) => {
    if (status === 'success') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" />Succès</span>;
    if (status === 'error') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3 h-3" />Erreur</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 animate-pulse"><RefreshCw className="w-3 h-3 animate-spin" />En cours</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const isConnected = gdriveStatus?.connected ?? false;
  const isRcloneInstalled = gdriveStatus?.rcloneInstalled ?? false;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HardDrive className="w-7 h-7 text-emerald-600" />
            Sauvegardes automatiques
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configurez et gérez les sauvegardes de la base de données et des fichiers
          </p>
        </div>
        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition"
        >
          {triggering ? (
            <><RefreshCw className="w-4 h-4 animate-spin" />Sauvegarde en cours...</>
          ) : (
            <><Play className="w-4 h-4" />Lancer une sauvegarde</>
          )}
        </button>
      </div>

      {/* Message flash */}
      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> :
           message.type === 'error' ? <XCircle className="w-4 h-4 flex-shrink-0" /> :
           <Info className="w-4 h-4 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Statut rapide */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg"><Database className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Rétention locale</p>
            <p className="font-semibold text-gray-900">{form.localRetentionDays} jours</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${form.scheduleEnabled ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <Calendar className={`w-5 h-5 ${form.scheduleEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Planification</p>
            <p className="font-semibold text-gray-900">
              {form.scheduleEnabled ? `Chaque nuit à ${form.scheduleHour}h` : 'Désactivée'}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-50' : 'bg-gray-50'}`}>
            {isConnected ? <Cloud className="w-5 h-5 text-green-600" /> : <CloudOff className="w-5 h-5 text-gray-400" />}
          </div>
          <div>
            <p className="text-xs text-gray-500">Google Drive</p>
            <p className={`font-semibold ${isConnected ? 'text-green-700' : 'text-gray-500'}`}>
              {isConnected ? 'Connecté' : 'Non connecté'}
            </p>
          </div>
        </div>
      </div>

      {/* Section Google Drive */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900">Google Drive</h2>
          </div>
          {isConnected && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />Connecté
            </span>
          )}
        </div>
        <div className="p-5 space-y-4">
          {/* Statut connexion */}
          {!isRcloneInstalled && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>rclone n'est pas installé sur le serveur. Il sera installé automatiquement lors de la première connexion.</span>
            </div>
          )}

          {!isConnected ? (
            <div className="space-y-4">
              {oauthStep === 'idle' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Connectez votre compte Google Drive pour activer la synchronisation automatique des sauvegardes.
                  </p>
                  <button
                    onClick={handleGdriveConnect}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                  >
                    <Link className="w-4 h-4" />
                    Connecter Google Drive
                  </button>
                </div>
              )}

              {oauthStep === 'waiting' && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Génération du lien d'autorisation...
                </div>
              )}

              {oauthStep === 'code' && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                    <p className="font-medium text-blue-800 mb-2">Étape 1 — Autoriser l'accès</p>
                    <p className="text-blue-700 mb-2">Cliquez sur le lien ci-dessous pour autoriser l'accès à votre Google Drive :</p>
                    <a
                      href={authUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 underline font-medium break-all"
                    >
                      <Link className="w-3.5 h-3.5 flex-shrink-0" />
                      Ouvrir la page d'autorisation Google
                    </a>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Étape 2 — Coller le code d'autorisation</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value)}
                        placeholder="Coller le code ici..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleGdriveFinalize}
                        disabled={!authCode.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition"
                      >
                        Valider
                      </button>
                    </div>
                    <button
                      onClick={() => { setOauthStep('idle'); setAuthCode(''); }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Chemin de destination */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-gray-400" />
                  Dossier de destination dans Google Drive
                </label>
                <input
                  type="text"
                  value={form.gdrivePath}
                  onChange={(e) => setForm(f => ({ ...f, gdrivePath: e.target.value }))}
                  placeholder="ex: Sauvegardes/LFTG/Production"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-400">
                  Le dossier sera créé automatiquement s'il n'existe pas. Exemple : <code className="bg-gray-100 px-1 rounded">Sauvegardes/LFTG/Production</code>
                </p>
              </div>

              {/* Activer la sync */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">Synchronisation automatique</p>
                  <p className="text-xs text-gray-500">Envoyer chaque sauvegarde vers Google Drive</p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, gdriveEnabled: !f.gdriveEnabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.gdriveEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.gdriveEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Déconnecter */}
              <button
                onClick={handleGdriveDisconnect}
                className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
              >
                <Unlink className="w-4 h-4" />
                Déconnecter Google Drive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Paramètres de planification */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Paramètres de planification</h2>
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showAdvanced && (
          <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
            {/* Planification automatique */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Sauvegarde automatique nocturne</p>
                <p className="text-xs text-gray-500">Exécuter automatiquement chaque nuit</p>
              </div>
              <button
                onClick={() => setForm(f => ({ ...f, scheduleEnabled: !f.scheduleEnabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.scheduleEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.scheduleEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Heure */}
            {form.scheduleEnabled && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Heure d'exécution
                </label>
                <select
                  value={form.scheduleHour}
                  onChange={(e) => setForm(f => ({ ...f, scheduleHour: parseInt(e.target.value) }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}h00</option>
                  ))}
                </select>
              </div>
            )}

            {/* Rétention */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-gray-400" />
                Rétention locale (jours)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={form.localRetentionDays}
                onChange={(e) => setForm(f => ({ ...f, localRetentionDays: parseInt(e.target.value) || 7 }))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-400">Les sauvegardes locales plus anciennes sont supprimées automatiquement</p>
            </div>
          </div>
        )}
      </div>

      {/* Bouton sauvegarder la config */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-sm transition"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Sauvegarde...' : 'Enregistrer la configuration'}
        </button>
      </div>

      {/* Historique */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Historique des sauvegardes</h2>
          </div>
          <button onClick={loadData} className="text-gray-400 hover:text-gray-600 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Upload className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune sauvegarde effectuée</p>
            <p className="text-xs mt-1">Lancez votre première sauvegarde avec le bouton ci-dessus</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((entry) => (
              <div key={entry.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition">
                <div className="mt-0.5">{statusBadge(entry.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">
                      {entry.type === 'manual' ? 'Sauvegarde manuelle' : 'Sauvegarde planifiée'}
                    </span>
                    {entry.gdriveSync && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                        <Cloud className="w-3 h-3" />Drive
                      </span>
                    )}
                    {entry.duration && (
                      <span className="text-xs text-gray-400">{entry.duration}s</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {entry.dbSize && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Database className="w-3 h-3" />DB: {entry.dbSize}
                      </span>
                    )}
                    {entry.uploadsSize && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Upload className="w-3 h-3" />Uploads: {entry.uploadsSize}
                      </span>
                    )}
                    {entry.errorMsg && (
                      <span className="text-xs text-red-500 truncate max-w-xs">{entry.errorMsg}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(entry.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
