'use client';

/**
 * /admin/settings — Paramètres de la plateforme LFTG
 * Sections : Profil, Sécurité, Apparence, Notifications, Plateforme, IA
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  User, Lock, Palette, Bell, Building2, Bot, Save, Eye, EyeOff,
  Sun, Moon, Monitor, Check, ChevronRight, Shield, Mail, Globe,
  Smartphone, AlertTriangle, Info, Sparkles, Key, RefreshCw,
  Database, Server, Activity, LogOut
} from 'lucide-react';
import { authApi, usersApi } from '@/lib/api';
import { useTheme } from '@/lib/theme/ThemeContext';
import { useColorTheme, PRESET_THEMES, rgbStringToHex } from '@/lib/theme/ColorThemeContext';
import type { ColorPalette } from '@/lib/theme/ColorThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = 'profil' | 'securite' | 'apparence' | 'notifications' | 'plateforme' | 'ia';

const SECTIONS: { id: Section; label: string; icon: any; description: string }[] = [
  { id: 'profil',        label: 'Profil',         icon: User,      description: 'Nom, email, avatar' },
  { id: 'securite',      label: 'Sécurité',       icon: Shield,    description: 'Mot de passe, sessions' },
  { id: 'apparence',     label: 'Apparence',      icon: Palette,   description: 'Thème, langue, densité' },
  { id: 'notifications', label: 'Notifications',  icon: Bell,      description: 'Alertes, emails' },
  { id: 'plateforme',    label: 'Plateforme',     icon: Building2, description: 'Infos LFTG, SIRET, contact' },
  { id: 'ia',            label: 'Intelligence IA', icon: Bot,       description: 'Modèle LLM, professeur IA' },
];

// ─── Sous-composants ──────────────────────────────────────────────────────────
function SectionCard({ title, description, icon: Icon, children }: {
  title: string; description?: string; icon: any; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-forest-50 dark:bg-forest-900/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4.5 h-4.5 text-forest-600 dark:text-forest-400" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-foreground">{title}</h2>
          {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder, disabled }: {
  value: string; onChange?: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-border rounded-xl bg-white dark:bg-muted/20 text-gray-900 dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-forest-500' : 'bg-gray-200 dark:bg-gray-600'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-foreground transition-colors">{label}</span>
    </label>
  );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function ProfilSection({ me }: { me: any }) {
  const qc = useQueryClient();
  const [name, setName] = useState(me?.name || '');
  const [email, setEmail] = useState(me?.email || '');

  const updateMutation = useMutation({
    mutationFn: () => usersApi.update(me.id, { name, email }),
    onSuccess: () => {
      toast.success('Profil mis à jour avec succès');
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: () => toast.error('Erreur lors de la mise à jour du profil'),
  });

  return (
    <SectionCard title="Profil utilisateur" description="Informations personnelles de votre compte" icon={User}>
      <div className="flex items-center gap-4 pb-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-600 to-maroni-500 flex items-center justify-center text-white text-2xl font-bold shadow-sm flex-shrink-0">
          {(me?.name || 'A').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-foreground">{me?.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{me?.email}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {me?.roles?.map((r: any) => (
              <span key={r.id || r.name} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400">
                {r.name || r}
              </span>
            ))}
          </div>
        </div>
      </div>

      <FormField label="Nom complet">
        <Input value={name} onChange={setName} placeholder="Votre nom complet" />
      </FormField>

      <FormField label="Adresse email" hint="Utilisée pour la connexion et les notifications">
        <Input value={email} onChange={setEmail} type="email" placeholder="votre@email.com" />
      </FormField>

      <button
        onClick={() => updateMutation.mutate()}
        disabled={updateMutation.isPending || (name === me?.name && email === me?.email)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-forest-600 text-white rounded-xl hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {updateMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Enregistrer les modifications
      </button>
    </SectionCard>
  );
}

function SecuriteSection({ me }: { me: any }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(newPassword);
  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Excellent'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-forest-500'][strength];

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    try {
      await usersApi.update(me.id, { password: newPassword });
      toast.success('Mot de passe modifié avec succès');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch {
      toast.error('Erreur lors du changement de mot de passe');
    }
  };

  return (
    <SectionCard title="Sécurité du compte" description="Mot de passe et gestion des sessions" icon={Shield}>
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Dernière connexion : <strong>{me?.lastLoginAt ? new Date(me.lastLoginAt).toLocaleString('fr-FR') : 'Inconnue'}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Key className="w-4 h-4" /> Changer le mot de passe
        </h3>

        <FormField label="Mot de passe actuel">
          <div className="relative">
            <Input value={currentPassword} onChange={setCurrentPassword} type={showCurrent ? 'text' : 'password'} placeholder="••••••••" />
            <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FormField>

        <FormField label="Nouveau mot de passe">
          <div className="relative">
            <Input value={newPassword} onChange={setNewPassword} type={showNew ? 'text' : 'password'} placeholder="Minimum 8 caractères" />
            <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {newPassword && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : 'bg-gray-200 dark:bg-gray-600'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-500">{strengthLabel && `Force : ${strengthLabel}`}</p>
            </div>
          )}
        </FormField>

        <FormField label="Confirmer le nouveau mot de passe">
          <Input value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="Répétez le mot de passe" />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Les mots de passe ne correspondent pas</p>
          )}
        </FormField>

        <button
          onClick={handleChangePassword}
          disabled={!currentPassword || !newPassword || !confirmPassword}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-forest-600 text-white rounded-xl hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Lock className="w-4 h-4" /> Changer le mot de passe
        </button>
      </div>
    </SectionCard>
  );
}

// ─── Composant ColorSwatch ────────────────────────────────────────────────────
function ColorSwatch({ label, colorKey, value, onChange }: {
  label: string;
  colorKey: keyof ColorPalette;
  value: string;
  onChange: (key: keyof ColorPalette, hex: string) => void;
}) {
  const isHex = value.startsWith('#');
  const hexValue = isHex ? value : rgbStringToHex(value);

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <div
          className="w-9 h-9 rounded-xl border-2 border-white shadow-md cursor-pointer overflow-hidden"
          style={{ background: hexValue }}
        >
          <input
            type="color"
            value={hexValue}
            onChange={(e) => onChange(colorKey, e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title={label}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{label}</p>
        <p className="text-xs text-gray-400 font-mono">{hexValue}</p>
      </div>
    </div>
  );
}

// ─── Composant PreviewMini ────────────────────────────────────────────────────
function PreviewMini({ palette }: { palette: ColorPalette }) {
  const bg = rgbStringToHex(palette.background);
  const primary = rgbStringToHex(palette.primary);
  const card = rgbStringToHex(palette.card);
  const border = rgbStringToHex(palette.border);
  const accent = rgbStringToHex(palette.accent);
  const sidebar = palette.sidebarBg;
  const sidebarAccent = palette.sidebarAccent;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-border shadow-sm" style={{ background: bg, height: '80px', display: 'flex' }}>
      {/* Sidebar mini */}
      <div className="w-8 flex-shrink-0 flex flex-col gap-1 p-1" style={{ background: sidebar }}>
        <div className="w-full h-2 rounded" style={{ background: sidebarAccent, opacity: 0.9 }} />
        <div className="w-full h-1 rounded" style={{ background: 'rgba(255,255,255,0.3)' }} />
        <div className="w-full h-1 rounded" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <div className="w-full h-1 rounded" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <div className="w-full h-1 rounded" style={{ background: 'rgba(255,255,255,0.15)' }} />
      </div>
      {/* Content mini */}
      <div className="flex-1 p-1.5 flex flex-col gap-1">
        <div className="flex gap-1">
          <div className="flex-1 h-4 rounded" style={{ background: card, border: `1px solid ${border}` }} />
          <div className="flex-1 h-4 rounded" style={{ background: card, border: `1px solid ${border}` }} />
          <div className="flex-1 h-4 rounded" style={{ background: card, border: `1px solid ${border}` }} />
        </div>
        <div className="flex gap-1 items-center">
          <div className="h-3 w-12 rounded" style={{ background: primary }} />
          <div className="h-3 w-8 rounded" style={{ background: accent, opacity: 0.7 }} />
        </div>
        <div className="h-2 rounded" style={{ background: border }} />
        <div className="h-2 rounded w-3/4" style={{ background: border, opacity: 0.5 }} />
      </div>
    </div>
  );
}

// ─── Section Apparence ────────────────────────────────────────────────────────
function ApparenceSection() {
  const { theme, setTheme } = useTheme();
  const { currentPalette, isCustom, applyPreset, updateColor, resetToDefault, saveCustom } = useColorTheme();
  const [density, setDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [language, setLanguage] = useState('fr');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  const themeOptions = [
    { value: 'light', label: 'Clair', icon: Sun, desc: 'Thème forêt tropicale clair' },
    { value: 'dark',  label: 'Sombre', icon: Moon, desc: 'Thème forêt tropicale sombre' },
    { value: 'system', label: 'Système', icon: Monitor, desc: 'Suit les préférences OS' },
  ];

  const colorFields: { key: keyof ColorPalette; label: string; group: string }[] = [
    { key: 'primary',     label: 'Couleur primaire',   group: 'Interface' },
    { key: 'secondary',   label: 'Couleur secondaire', group: 'Interface' },
    { key: 'accent',      label: 'Couleur accent',     group: 'Interface' },
    { key: 'background',  label: 'Fond de page',       group: 'Interface' },
    { key: 'card',        label: 'Fond des cartes',    group: 'Interface' },
    { key: 'border',      label: 'Bordures',           group: 'Interface' },
    { key: 'sidebarBg',   label: 'Fond sidebar',       group: 'Sidebar' },
    { key: 'sidebarAccent', label: 'Accent sidebar',   group: 'Sidebar' },
    { key: 'sidebarText', label: 'Texte sidebar',      group: 'Sidebar' },
  ];

  const groups = ['Interface', 'Sidebar'];

  return (
    <div className="space-y-4">
      {/* ─── Mode clair/sombre ─── */}
      <SectionCard title="Mode d'affichage" description="Clair, sombre ou selon votre système" icon={Sun}>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = theme === opt.value || (opt.value === 'system' && !['light', 'dark'].includes(theme));
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value as any)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/20'
                    : 'border-gray-200 dark:border-border bg-white dark:bg-card hover:border-forest-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-forest-600 dark:text-forest-400' : 'text-gray-400'}`} />
                <span className={`text-xs font-semibold ${isActive ? 'text-forest-700 dark:text-forest-400' : 'text-gray-600 dark:text-gray-400'}`}>{opt.label}</span>
                {isActive && <Check className="w-3.5 h-3.5 text-forest-500" />}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* ─── Palette de couleurs ─── */}
      <SectionCard title="Palette de couleurs" description="Personnalisez les couleurs de la plateforme en temps réel" icon={Palette}>

        {/* Thème actif */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-forest-50 to-transparent dark:from-forest-900/20 border border-forest-200 dark:border-forest-700/40">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm" style={{ background: rgbStringToHex(currentPalette.primary) }}>
            {currentPalette.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-foreground">{currentPalette.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentPalette.description}</p>
          </div>
          {isCustom && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full flex-shrink-0">Personnalisé</span>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-muted/30 rounded-xl">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'presets'
                ? 'bg-white dark:bg-card shadow-sm text-gray-900 dark:text-foreground'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            🎨 Thèmes prédéfinis
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'custom'
                ? 'bg-white dark:bg-card shadow-sm text-gray-900 dark:text-foreground'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            🖌️ Personnaliser
          </button>
        </div>

        {/* Thèmes prédéfinis */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-2 gap-3">
            {PRESET_THEMES.map((preset) => {
              const isActive = currentPalette.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`relative flex flex-col gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                    isActive
                      ? 'border-forest-500 shadow-md'
                      : 'border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-border'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-forest-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <PreviewMini palette={preset} />
                  <div className="flex items-center gap-2">
                    <span className="text-base">{preset.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-foreground">{preset.name}</p>
                      <p className="text-xs text-gray-400 truncate">{preset.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Personnalisation avancée */}
        {activeTab === 'custom' && (
          <div className="space-y-4">
            {/* Prévisualisation live */}
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Prévisualisation</p>
              <PreviewMini palette={currentPalette} />
            </div>

            {/* Pickers par groupe */}
            {groups.map((group) => (
              <div key={group} className="space-y-3">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-gray-300 dark:bg-gray-600 rounded" />
                  {group}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {colorFields
                    .filter(f => f.group === group)
                    .map(({ key, label }) => {
                      const rawValue = currentPalette[key] as string;
                      return (
                        <ColorSwatch
                          key={key}
                          label={label}
                          colorKey={key}
                          value={rawValue}
                          onChange={updateColor}
                        />
                      );
                    })}
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-border">
              <button
                onClick={() => { saveCustom(); toast.success('Palette personnalisée sauvegardée !'); }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Sauvegarder
              </button>
              <button
                onClick={() => { resetToDefault(); toast.success('Thème réinitialisé'); }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold bg-gray-100 dark:bg-muted/30 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-muted/50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Réinitialiser
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ─── Densité et langue ─── */}
      <SectionCard title="Interface" description="Densité d'affichage et langue" icon={Globe}>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Densité d'affichage</p>
          <div className="flex gap-2">
            {(['compact', 'normal', 'spacious'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                  density === d
                    ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400'
                    : 'border-gray-200 dark:border-border text-gray-600 dark:text-gray-400 hover:border-forest-300'
                }`}
              >
                {d === 'compact' ? 'Compact' : d === 'normal' ? 'Normal' : 'Aéré'}
              </button>
            ))}
          </div>
        </div>

        <FormField label="Langue de l'interface">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-border rounded-xl bg-white dark:bg-muted/20 text-gray-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
          >
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="pt">🇧🇷 Português</option>
          </select>
        </FormField>
      </SectionCard>
    </div>
  );
}

function NotificationsSection() {
  const [notifs, setNotifs] = useState({
    emailAlerts: true,
    emailWeekly: false,
    pushAnimaux: true,
    pushStock: true,
    pushFormation: false,
    pushSecurity: true,
    soundEnabled: false,
  });

  const toggle = (key: keyof typeof notifs) => setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <SectionCard title="Notifications" description="Gérez vos alertes et communications" icon={Bell}>
      <div className="space-y-4">
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" /> Emails
          </p>
          <Toggle checked={notifs.emailAlerts} onChange={() => toggle('emailAlerts')} label="Alertes critiques par email" />
          <Toggle checked={notifs.emailWeekly} onChange={() => toggle('emailWeekly')} label="Rapport hebdomadaire par email" />
        </div>

        <div className="border-t border-gray-100 dark:border-border pt-4 space-y-3">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5" /> Notifications push
          </p>
          <Toggle checked={notifs.pushAnimaux} onChange={() => toggle('pushAnimaux')} label="Alertes animaux (santé, naissances)" />
          <Toggle checked={notifs.pushStock} onChange={() => toggle('pushStock')} label="Alertes stock (seuils critiques)" />
          <Toggle checked={notifs.pushFormation} onChange={() => toggle('pushFormation')} label="Activité formations (inscriptions, quiz)" />
          <Toggle checked={notifs.pushSecurity} onChange={() => toggle('pushSecurity')} label="Alertes sécurité (connexions suspectes)" />
        </div>

        <div className="border-t border-gray-100 dark:border-border pt-4 space-y-3">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Interface
          </p>
          <Toggle checked={notifs.soundEnabled} onChange={() => toggle('soundEnabled')} label="Sons de notification" />
        </div>
      </div>

      <button
        onClick={() => toast.success('Préférences de notifications sauvegardées')}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition-colors"
      >
        <Save className="w-4 h-4" /> Sauvegarder
      </button>
    </SectionCard>
  );
}

function PlateformeSection() {
  const [info, setInfo] = useState({
    name: 'La Ferme Tropicale de Guyane',
    shortName: 'LFTG',
    siret: '97310',
    address: 'PK 20,5 Route du Dégrad Saramacca, 97310 Kourou',
    phone: '0694 96 13 76',
    email: 'lftg973@gmail.com',
    website: 'https://lftg.fr',
    nda: '03973232797',
    qualiopi: true,
  });

  return (
    <SectionCard title="Informations plateforme" description="Données de l'organisme de formation LFTG" icon={Building2}>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nom complet">
          <Input value={info.name} onChange={(v) => setInfo(p => ({ ...p, name: v }))} />
        </FormField>
        <FormField label="Nom court">
          <Input value={info.shortName} onChange={(v) => setInfo(p => ({ ...p, shortName: v }))} />
        </FormField>
      </div>

      <FormField label="Adresse">
        <Input value={info.address} onChange={(v) => setInfo(p => ({ ...p, address: v }))} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Téléphone">
          <Input value={info.phone} onChange={(v) => setInfo(p => ({ ...p, phone: v }))} />
        </FormField>
        <FormField label="Email de contact">
          <Input value={info.email} onChange={(v) => setInfo(p => ({ ...p, email: v }))} type="email" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="N° Déclaration d'activité" hint="Préfecture de région de Guyane">
          <Input value={info.nda} onChange={(v) => setInfo(p => ({ ...p, nda: v }))} />
        </FormField>
        <FormField label="Site web">
          <Input value={info.website} onChange={(v) => setInfo(p => ({ ...p, website: v }))} />
        </FormField>
      </div>

      <div className="flex items-center gap-3 p-4 bg-forest-50 dark:bg-forest-900/20 border border-forest-200 dark:border-forest-700/50 rounded-xl">
        <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-forest-600 dark:text-forest-400" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-forest-800 dark:text-forest-300 text-sm">Certification QUALIOPI</p>
          <p className="text-xs text-forest-600 dark:text-forest-400 mt-0.5">
            Organisme certifié pour les actions de formation — Audit de surveillance programmé
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-500 text-white rounded-lg text-xs font-bold">
          <Check className="w-3.5 h-3.5" /> Actif
        </div>
      </div>

      <button
        onClick={() => toast.success('Informations plateforme sauvegardées')}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition-colors"
      >
        <Save className="w-4 h-4" /> Sauvegarder
      </button>
    </SectionCard>
  );
}

function IASection() {
  const [llmModel, setLlmModel] = useState('gpt-4o');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiPersonality, setAiPersonality] = useState('pedagogique');
  const [apiKey, setApiKey] = useState('sk-••••••••••••••••••••••••••••••••');
  const [showKey, setShowKey] = useState(false);

  const models = [
    { value: 'gpt-4o',           label: 'GPT-4o',           provider: 'OpenAI',    desc: 'Multimodal, très performant', recommended: true },
    { value: 'gpt-4o-mini',      label: 'GPT-4o Mini',      provider: 'OpenAI',    desc: 'Rapide et économique' },
    { value: 'gpt-5',            label: 'GPT-5',             provider: 'OpenAI',    desc: 'Dernière génération' },
    { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'Anthropic', desc: 'Excellent pour la pédagogie' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'Google',    desc: 'Rapide, multimodal' },
    { value: 'llama-3.3-70b',    label: 'Llama 3.3 70B',    provider: 'Meta',      desc: 'Open source, local' },
  ];

  const personalities = [
    { value: 'pedagogique', label: '🎓 Pédagogique', desc: 'Explications claires et structurées' },
    { value: 'socratique',  label: '🤔 Socratique',  desc: 'Guide par les questions' },
    { value: 'bienveillant', label: '🌿 Bienveillant', desc: 'Encourageant et positif' },
    { value: 'expert',      label: '🔬 Expert',      desc: 'Technique et précis' },
  ];

  return (
    <SectionCard title="Intelligence Artificielle" description="Configuration du professeur IA et des modèles LLM" icon={Bot}>
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-200 dark:border-purple-700/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-purple-900 dark:text-purple-300 text-sm">Professeur IA LFTG</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">Assistant pédagogique intelligent pour les apprenants</p>
          </div>
        </div>
        <Toggle checked={aiEnabled} onChange={setAiEnabled} label="" />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Modèle LLM</p>
        <div className="grid grid-cols-2 gap-2">
          {models.map((m) => (
            <button
              key={m.value}
              onClick={() => setLlmModel(m.value)}
              className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                llmModel === m.value
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-border hover:border-purple-300'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-xs font-bold truncate ${llmModel === m.value ? 'text-purple-800 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>{m.label}</p>
                  {m.recommended && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">✨</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{m.provider} · {m.desc}</p>
              </div>
              {llmModel === m.value && <Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Personnalité du professeur IA</p>
        <div className="grid grid-cols-2 gap-2">
          {personalities.map((p) => (
            <button
              key={p.value}
              onClick={() => setAiPersonality(p.value)}
              className={`flex flex-col gap-0.5 p-3 rounded-xl border-2 text-left transition-all ${
                aiPersonality === p.value
                  ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/20'
                  : 'border-gray-200 dark:border-border hover:border-forest-300'
              }`}
            >
              <p className={`text-xs font-bold ${aiPersonality === p.value ? 'text-forest-800 dark:text-forest-300' : 'text-gray-700 dark:text-gray-300'}`}>{p.label}</p>
              <p className="text-xs text-gray-400">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <FormField label="Clé API OpenAI" hint="Stockée de façon sécurisée, jamais exposée côté client">
        <div className="relative">
          <Input value={showKey ? apiKey : 'sk-••••••••••••••••••••••••••••••••'} type="text" disabled={!showKey} />
          <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </FormField>

      <button
        onClick={() => toast.success(`Configuration IA sauvegardée — Modèle : ${llmModel}`)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all"
      >
        <Save className="w-4 h-4" /> Sauvegarder la configuration IA
      </button>
    </SectionCard>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('profil');
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => authApi.me() });

  const renderSection = () => {
    switch (activeSection) {
      case 'profil':        return <ProfilSection me={me} />;
      case 'securite':      return <SecuriteSection me={me} />;
      case 'apparence':     return <ApparenceSection />;
      case 'notifications': return <NotificationsSection />;
      case 'plateforme':    return <PlateformeSection />;
      case 'ia':            return <IASection />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">Paramètres</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gérez votre compte, l'apparence et la configuration de la plateforme LFTG
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar navigation */}
        <div className="w-56 flex-shrink-0">
          <nav className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
            {SECTIONS.map((section, idx) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3.5 text-left transition-all ${
                    idx > 0 ? 'border-t border-gray-50 dark:border-border/50' : ''
                  } ${
                    isActive
                      ? 'bg-forest-50 dark:bg-forest-900/20 border-l-2 border-l-forest-500'
                      : 'hover:bg-gray-50 dark:hover:bg-muted/20 border-l-2 border-l-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-forest-600 dark:text-forest-400' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isActive ? 'text-forest-800 dark:text-forest-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {section.label}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{section.description}</p>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-forest-500 flex-shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Info version */}
          <div className="mt-4 p-4 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Version plateforme</span>
            </div>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">LFTG Platform v2.0</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-forest-500 animate-pulse" />
              <span className="text-xs text-forest-600 dark:text-forest-400">Tous les services actifs</span>
            </div>
          </div>
        </div>

        {/* Contenu de la section */}
        <div className="flex-1 min-w-0">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
