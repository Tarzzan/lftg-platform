import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gray';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
};

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}>
      {children}
    </span>
  );
}

// ─── StatusBadge spécialisé ───────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
  labels?: Record<string, string>;
  variants?: Record<string, BadgeVariant>;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, labels, variants, size = 'md' }: StatusBadgeProps) {
  const label = labels?.[status] || status;
  const variant = variants?.[status] || 'default';
  return <Badge variant={variant} size={size}>{label}</Badge>;
}

// ─── Exports prédéfinis ───────────────────────────────────────────────────────

export const ANIMAL_STATUS_LABELS: Record<string, string> = {
  ALIVE: 'Vivant',
  DEAD: 'Décédé',
  SOLD: 'Vendu',
  TRANSFERRED: 'Transféré',
  MISSING: 'Disparu',
};

export const ANIMAL_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  ALIVE: 'success',
  DEAD: 'danger',
  SOLD: 'info',
  TRANSFERRED: 'purple',
  MISSING: 'warning',
};

export const BROOD_STATUS_LABELS: Record<string, string> = {
  INCUBATING: 'En incubation',
  HATCHING: 'Éclosion',
  COMPLETED: 'Terminée',
  FAILED: 'Échec',
  CANCELLED: 'Annulée',
};

export const BROOD_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  INCUBATING: 'warning',
  HATCHING: 'info',
  COMPLETED: 'success',
  FAILED: 'danger',
  CANCELLED: 'gray',
};

export const SALE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  COMPLETED: 'Complétée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
};

export const SALE_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'gray',
  REFUNDED: 'danger',
};
