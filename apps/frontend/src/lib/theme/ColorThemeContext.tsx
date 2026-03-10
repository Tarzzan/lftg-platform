'use client';

/**
 * LFTG Platform — Système de personnalisation des couleurs
 * Permet de modifier les variables CSS en temps réel depuis admin/settings
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColorPalette {
  id: string;
  name: string;
  emoji: string;
  description: string;
  // Variables CSS (format RGB "R G B" pour compatibilité Tailwind)
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  ring: string;
  // Sidebar
  sidebarBg: string;         // couleur hex pour le fond de la sidebar (overlay)
  sidebarAccent: string;     // couleur hex pour les accents de la sidebar
  sidebarText: string;       // couleur hex pour le texte de la sidebar
}

// ─── Thèmes prédéfinis ────────────────────────────────────────────────────────

export const PRESET_THEMES: ColorPalette[] = [
  {
    id: 'tropical',
    name: 'Forêt Tropicale',
    emoji: '🌿',
    description: 'Thème par défaut — Verts profonds et or tropical',
    primary: '22 163 74',
    primaryForeground: '255 255 255',
    secondary: '193 127 58',
    secondaryForeground: '255 247 237',
    accent: '245 158 11',
    accentForeground: '28 25 23',
    background: '250 250 249',
    foreground: '28 25 23',
    card: '255 255 255',
    cardForeground: '28 25 23',
    muted: '245 245 244',
    mutedForeground: '120 113 108',
    border: '231 229 228',
    ring: '22 163 74',
    sidebarBg: '#041209',
    sidebarAccent: '#c17f3a',
    sidebarText: '#ffffff',
  },
  {
    id: 'ocean',
    name: 'Océan Atlantique',
    emoji: '🌊',
    description: 'Bleus profonds et turquoise des Caraïbes',
    primary: '14 165 233',
    primaryForeground: '255 255 255',
    secondary: '6 182 212',
    secondaryForeground: '255 255 255',
    accent: '99 102 241',
    accentForeground: '255 255 255',
    background: '248 250 252',
    foreground: '15 23 42',
    card: '255 255 255',
    cardForeground: '15 23 42',
    muted: '241 245 249',
    mutedForeground: '100 116 139',
    border: '226 232 240',
    ring: '14 165 233',
    sidebarBg: '#0c1a2e',
    sidebarAccent: '#0ea5e9',
    sidebarText: '#e0f2fe',
  },
  {
    id: 'savane',
    name: 'Savane Dorée',
    emoji: '🌾',
    description: 'Ocres chauds et terres de Guyane',
    primary: '217 119 6',
    primaryForeground: '255 255 255',
    secondary: '180 83 9',
    secondaryForeground: '255 255 255',
    accent: '234 179 8',
    accentForeground: '28 25 23',
    background: '255 251 235',
    foreground: '28 20 10',
    card: '255 255 255',
    cardForeground: '28 20 10',
    muted: '254 243 199',
    mutedForeground: '120 90 40',
    border: '253 230 138',
    ring: '217 119 6',
    sidebarBg: '#1c1005',
    sidebarAccent: '#d97706',
    sidebarText: '#fef3c7',
  },
  {
    id: 'nuit',
    name: 'Nuit Amazonienne',
    emoji: '🌙',
    description: 'Violets nocturnes et étoiles de la canopée',
    primary: '139 92 246',
    primaryForeground: '255 255 255',
    secondary: '236 72 153',
    secondaryForeground: '255 255 255',
    accent: '34 211 238',
    accentForeground: '15 23 42',
    background: '248 250 252',
    foreground: '15 23 42',
    card: '255 255 255',
    cardForeground: '15 23 42',
    muted: '241 245 249',
    mutedForeground: '100 116 139',
    border: '226 232 240',
    ring: '139 92 246',
    sidebarBg: '#0f0a1e',
    sidebarAccent: '#8b5cf6',
    sidebarText: '#f5f3ff',
  },
  {
    id: 'mangrove',
    name: 'Mangrove Émeraude',
    emoji: '🦀',
    description: 'Verts intenses et reflets cuivrés des mangroves',
    primary: '5 150 105',
    primaryForeground: '255 255 255',
    secondary: '20 184 166',
    secondaryForeground: '255 255 255',
    accent: '245 158 11',
    accentForeground: '28 25 23',
    background: '240 253 244',
    foreground: '6 30 20',
    card: '255 255 255',
    cardForeground: '6 30 20',
    muted: '209 250 229',
    mutedForeground: '52 120 80',
    border: '167 243 208',
    ring: '5 150 105',
    sidebarBg: '#021a0e',
    sidebarAccent: '#059669',
    sidebarText: '#d1fae5',
  },
  {
    id: 'laterite',
    name: 'Latérite Rouge',
    emoji: '🏺',
    description: 'Terres rouges et argiles de la forêt guyanaise',
    primary: '220 38 38',
    primaryForeground: '255 255 255',
    secondary: '234 88 12',
    secondaryForeground: '255 255 255',
    accent: '202 138 4',
    accentForeground: '255 255 255',
    background: '255 247 237',
    foreground: '28 10 5',
    card: '255 255 255',
    cardForeground: '28 10 5',
    muted: '255 237 213',
    mutedForeground: '120 50 20',
    border: '254 215 170',
    ring: '220 38 38',
    sidebarBg: '#1a0505',
    sidebarAccent: '#dc2626',
    sidebarText: '#fee2e2',
  },
];

// ─── Contexte ─────────────────────────────────────────────────────────────────

interface ColorThemeContextType {
  currentPalette: ColorPalette;
  customPalette: ColorPalette;
  isCustom: boolean;
  applyPreset: (preset: ColorPalette) => void;
  updateColor: (key: keyof ColorPalette, value: string) => void;
  resetToDefault: () => void;
  saveCustom: () => void;
}

const ColorThemeContext = createContext<ColorThemeContextType>({
  currentPalette: PRESET_THEMES[0],
  customPalette: PRESET_THEMES[0],
  isCustom: false,
  applyPreset: () => {},
  updateColor: () => {},
  resetToDefault: () => {},
  saveCustom: () => {},
});

// ─── Utilitaires ──────────────────────────────────────────────────────────────

/** Convertit un hex (#rrggbb) en "R G B" pour Tailwind */
function hexToRgbString(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Convertit "R G B" en hex #rrggbb */
export function rgbStringToHex(rgb: string): string {
  const parts = rgb.trim().split(/\s+/);
  if (parts.length !== 3) return '#000000';
  const r = parseInt(parts[0]).toString(16).padStart(2, '0');
  const g = parseInt(parts[1]).toString(16).padStart(2, '0');
  const b = parseInt(parts[2]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/** Applique une palette aux variables CSS du document */
function applyPaletteToDOM(palette: ColorPalette) {
  const root = document.documentElement;
  root.style.setProperty('--primary', palette.primary);
  root.style.setProperty('--primary-foreground', palette.primaryForeground);
  root.style.setProperty('--secondary', palette.secondary);
  root.style.setProperty('--secondary-foreground', palette.secondaryForeground);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-foreground', palette.accentForeground);
  root.style.setProperty('--background', palette.background);
  root.style.setProperty('--foreground', palette.foreground);
  root.style.setProperty('--card', palette.card);
  root.style.setProperty('--card-foreground', palette.cardForeground);
  root.style.setProperty('--muted', palette.muted);
  root.style.setProperty('--muted-foreground', palette.mutedForeground);
  root.style.setProperty('--border', palette.border);
  root.style.setProperty('--ring', palette.ring);
  // Variables sidebar
  root.style.setProperty('--sidebar-bg', palette.sidebarBg);
  root.style.setProperty('--sidebar-accent', palette.sidebarAccent);
  root.style.setProperty('--sidebar-text', palette.sidebarText);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(PRESET_THEMES[0]);
  const [customPalette, setCustomPalette] = useState<ColorPalette>(PRESET_THEMES[0]);
  const [isCustom, setIsCustom] = useState(false);

  // Charger la palette sauvegardée au démarrage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lftg-color-palette');
      if (saved) {
        const parsed: ColorPalette = JSON.parse(saved);
        setCurrentPalette(parsed);
        setCustomPalette(parsed);
        const isPreset = PRESET_THEMES.some(p => p.id === parsed.id);
        setIsCustom(!isPreset || parsed.id === 'custom');
        applyPaletteToDOM(parsed);
      }
    } catch {
      // Ignorer les erreurs de parsing
    }
  }, []);

  const applyPreset = (preset: ColorPalette) => {
    setCurrentPalette(preset);
    setCustomPalette({ ...preset });
    setIsCustom(false);
    applyPaletteToDOM(preset);
    localStorage.setItem('lftg-color-palette', JSON.stringify(preset));
  };

  const updateColor = (key: keyof ColorPalette, value: string) => {
    // Si c'est une couleur hex (sidebar), la stocker directement
    // Si c'est une variable CSS RGB, convertir
    const isHexKey = key === 'sidebarBg' || key === 'sidebarAccent' || key === 'sidebarText';
    const storedValue = isHexKey ? value : (value.startsWith('#') ? hexToRgbString(value) : value);

    const updated: ColorPalette = {
      ...customPalette,
      id: 'custom',
      name: 'Personnalisé',
      emoji: '🎨',
      description: 'Thème personnalisé',
      [key]: storedValue,
    };
    setCustomPalette(updated);
    setCurrentPalette(updated);
    setIsCustom(true);
    applyPaletteToDOM(updated);
  };

  const resetToDefault = () => {
    applyPreset(PRESET_THEMES[0]);
  };

  const saveCustom = () => {
    localStorage.setItem('lftg-color-palette', JSON.stringify(customPalette));
  };

  return (
    <ColorThemeContext.Provider value={{
      currentPalette,
      customPalette,
      isCustom,
      applyPreset,
      updateColor,
      resetToDefault,
      saveCustom,
    }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export const useColorTheme = () => useContext(ColorThemeContext);
