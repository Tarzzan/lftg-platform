/**
 * LFTG Platform — Utilitaires d'accessibilité WCAG 2.1 AA
 * Phase 12
 *
 * Référence : https://www.w3.org/WAI/WCAG21/quickref/
 */

// ─── Focus management ──────────────────────────────────────────────────────

/**
 * Piège le focus dans un conteneur (pour les modales, drawers, etc.)
 * Critère WCAG 2.1 — 2.1.2 No Keyboard Trap (Level A)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors)
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();

  return () => container.removeEventListener('keydown', handleKeyDown);
}

// ─── ARIA helpers ──────────────────────────────────────────────────────────

/**
 * Génère un ID unique pour les associations aria-labelledby / aria-describedby
 */
let idCounter = 0;
export function generateA11yId(prefix = 'lftg'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Annonce un message aux lecteurs d'écran via une région live ARIA
 * Critère WCAG 2.1 — 4.1.3 Status Messages (Level AA)
 */
export function announceToScreenReader(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void {
  const liveRegion = document.getElementById('lftg-live-region');
  if (!liveRegion) {
    const region = document.createElement('div');
    region.id = 'lftg-live-region';
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;';
    document.body.appendChild(region);
  }

  const region = document.getElementById('lftg-live-region')!;
  region.setAttribute('aria-live', politeness);
  region.textContent = '';
  // Timeout pour forcer la re-annonce du même message
  setTimeout(() => { region.textContent = message; }, 50);
}

// ─── Colour contrast ───────────────────────────────────────────────────────

/**
 * Calcule le ratio de contraste entre deux couleurs hexadécimales
 * Critère WCAG 2.1 — 1.4.3 Contrast (Minimum) (Level AA) — ratio ≥ 4.5:1
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Vérifie si un ratio de contraste respecte WCAG AA (4.5:1 pour texte normal, 3:1 pour grand texte)
 */
export function meetsWCAGAA(ratio: number, isLargeText = false): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// ─── Keyboard navigation ───────────────────────────────────────────────────

/**
 * Gestion des touches flèches pour les listes/grilles
 * Critère WCAG 2.1 — 2.1.1 Keyboard (Level A)
 */
export function handleArrowKeyNavigation(
  e: React.KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  orientation: 'horizontal' | 'vertical' | 'both' = 'vertical'
): number {
  const isVertical = orientation === 'vertical' || orientation === 'both';
  const isHorizontal = orientation === 'horizontal' || orientation === 'both';

  let newIndex = currentIndex;

  if (isVertical && e.key === 'ArrowDown') {
    e.preventDefault();
    newIndex = Math.min(currentIndex + 1, items.length - 1);
  } else if (isVertical && e.key === 'ArrowUp') {
    e.preventDefault();
    newIndex = Math.max(currentIndex - 1, 0);
  } else if (isHorizontal && e.key === 'ArrowRight') {
    e.preventDefault();
    newIndex = Math.min(currentIndex + 1, items.length - 1);
  } else if (isHorizontal && e.key === 'ArrowLeft') {
    e.preventDefault();
    newIndex = Math.max(currentIndex - 1, 0);
  } else if (e.key === 'Home') {
    e.preventDefault();
    newIndex = 0;
  } else if (e.key === 'End') {
    e.preventDefault();
    newIndex = items.length - 1;
  }

  items[newIndex]?.focus();
  return newIndex;
}
