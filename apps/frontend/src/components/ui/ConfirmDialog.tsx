'use client';
import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  /** Titre du modal */
  title?: string;
  /** Description de l'action */
  description?: string;
  /** Nom de l'élément à supprimer (affiché en gras) */
  itemName?: string;
  /** Type d'élément (animal, article, utilisateur...) */
  itemType?: string;
  /** Icône emoji de l'élément */
  itemIcon?: string;
  /** Si true, demande de saisir "SUPPRIMER" pour confirmer */
  requireTyping?: boolean;
  /** Libellé du bouton de confirmation */
  confirmLabel?: string;
  /** Variante visuelle */
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer la suppression',
  description,
  itemName,
  itemType = 'élément',
  itemIcon = '🗑️',
  requireTyping = false,
  confirmLabel = 'Supprimer',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState('');
  const [confirming, setConfirming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setTypedValue('');
      setConfirming(false);
      // Focus sur l'input si requireTyping, sinon sur le bouton
      setTimeout(() => {
        if (requireTyping && inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [isOpen, requireTyping]);

  // Fermeture avec Échap
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !confirming) onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, confirming]);

  // Bloquer le scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const canConfirm = requireTyping ? typedValue === 'SUPPRIMER' : true;

  const handleConfirm = async () => {
    if (!canConfirm || confirming) return;
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  const isDanger = variant === 'danger';
  const colorClasses = isDanger
    ? { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-100 text-red-600', btn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500', text: 'text-red-700' }
    : { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500', text: 'text-amber-700' };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current && !confirming) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

        {/* Bandeau coloré en haut */}
        <div className={`h-1 ${isDanger ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`} />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses.icon}`}>
              {isDanger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <h2 className="text-base font-display font-semibold text-foreground">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={confirming}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps */}
        <div className="px-6 py-5 space-y-4">

          {/* Aperçu de l'élément */}
          {itemName && (
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${colorClasses.bg} ${colorClasses.border}`}>
              <span className="text-2xl flex-shrink-0">{itemIcon}</span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{itemType} à supprimer</p>
                <p className={`font-semibold text-sm truncate ${colorClasses.text}`}>{itemName}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description ?? `Vous êtes sur le point de supprimer définitivement cet élément. Cette action est irréversible et ne peut pas être annulée.`}
          </p>

          {/* Champ de confirmation par saisie */}
          {requireTyping && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Pour confirmer, tapez <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">SUPPRIMER</span> ci-dessous :
              </p>
              <input
                ref={inputRef}
                type="text"
                value={typedValue}
                onChange={(e) => setTypedValue(e.target.value)}
                placeholder="SUPPRIMER"
                className={`w-full px-3 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 transition-all bg-background
                  ${typedValue === 'SUPPRIMER'
                    ? 'border-green-400 focus:ring-green-400/30 text-green-700'
                    : 'border-border focus:ring-red-400/30'
                  }`}
                onKeyDown={(e) => { if (e.key === 'Enter' && canConfirm) handleConfirm(); }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-5 pt-0">
          <button
            onClick={onClose}
            disabled={confirming}
            className="px-4 py-2 text-sm font-medium bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || confirming || loading}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-xl transition-all
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center gap-2
              ${colorClasses.btn}
            `}
          >
            {(confirming || loading) ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Suppression…
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hook utilitaire pour gérer l'état du dialog ───────────────────────────────
import { useState as useStateHook } from 'react';

interface UseConfirmDialogReturn {
  isOpen: boolean;
  itemName: string;
  itemIcon: string;
  itemType: string;
  open: (name: string, icon?: string, type?: string) => void;
  close: () => void;
}

export function useConfirmDialog(): UseConfirmDialogReturn {
  const [isOpen, setIsOpen] = useStateHook(false);
  const [itemName, setItemName] = useStateHook('');
  const [itemIcon, setItemIcon] = useStateHook('🗑️');
  const [itemType, setItemType] = useStateHook('élément');

  return {
    isOpen,
    itemName,
    itemIcon,
    itemType,
    open: (name: string, icon = '🗑️', type = 'élément') => {
      setItemName(name);
      setItemIcon(icon);
      setItemType(type);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
  };
}
