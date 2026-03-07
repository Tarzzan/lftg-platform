'use client';

// ── Brique de base ────────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      aria-hidden="true"
    />
  );
}

// ── Ligne de tableau ──────────────────────────────────────────────────────────
export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton
            className={`h-4 ${i === 0 ? 'w-8' : i === 1 ? 'w-32' : i === cols - 1 ? 'w-16' : 'w-24'}`}
          />
        </td>
      ))}
    </tr>
  );
}

// ── Tableau complet ───────────────────────────────────────────────────────────
export function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className={`h-3 ${i === 0 ? 'w-6' : i === 1 ? 'w-28' : 'w-20'}`} />
        ))}
      </div>
      {/* Rows */}
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Carte KPI ─────────────────────────────────────────────────────────────────
export function SkeletonKpiCard() {
  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-12 h-3" />
      </div>
      <Skeleton className="w-16 h-7 mt-1" />
      <Skeleton className="w-24 h-3" />
      <Skeleton className="w-20 h-3 opacity-60" />
    </div>
  );
}

// ── Grille de KPIs ────────────────────────────────────────────────────────────
export function SkeletonKpiGrid({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-${count} gap-3`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonKpiCard key={i} />
      ))}
    </div>
  );
}

// ── Carte animal ──────────────────────────────────────────────────────────────
export function SkeletonAnimalCard() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="w-full h-32" />
      <div className="p-3 space-y-2">
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-1/2 h-3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="w-12 h-5 rounded-full" />
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Header de page avec titre ─────────────────────────────────────────────────
export function SkeletonPageHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-700/20 to-forest-600/10 p-6 border border-forest-200/30">
      <div className="space-y-2">
        <Skeleton className="w-48 h-7" />
        <Skeleton className="w-72 h-4 opacity-70" />
      </div>
      <div className="flex gap-3 mt-4">
        <Skeleton className="w-20 h-8 rounded-lg" />
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>
    </div>
  );
}

// ── Barre de filtres ──────────────────────────────────────────────────────────
export function SkeletonFilterBar({ filters = 3 }: { filters?: number }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Skeleton className="w-64 h-9 rounded-lg" />
      {Array.from({ length: filters }).map((_, i) => (
        <Skeleton key={i} className="w-28 h-9 rounded-lg" />
      ))}
      <Skeleton className="w-32 h-9 rounded-lg ml-auto" />
    </div>
  );
}

// ── Skeleton page animaux complet ─────────────────────────────────────────────
export function SkeletonAnimauxPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SkeletonPageHeader />
      <SkeletonKpiGrid count={4} />
      <SkeletonFilterBar filters={2} />
      <SkeletonTable rows={8} cols={6} />
    </div>
  );
}

// ── Skeleton page dashboard ───────────────────────────────────────────────────
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SkeletonKpiGrid count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-full h-40 rounded-lg" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Skeleton className="w-28 h-5" />
          <Skeleton className="w-full h-40 rounded-lg" />
        </div>
      </div>
      <SkeletonTable rows={5} cols={4} />
    </div>
  );
}

// ── Skeleton liste générique ──────────────────────────────────────────────────
export function SkeletonListPage({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <SkeletonPageHeader />
      <SkeletonFilterBar />
      <SkeletonTable rows={rows} cols={cols} />
    </div>
  );
}
