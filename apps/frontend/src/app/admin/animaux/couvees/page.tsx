'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, Egg } from 'lucide-react';
import { animauxApi } from '@/lib/api';
import { differenceInDays } from 'date-fns';

export default function CouveesPage() {
  const { data: broods, isLoading } = useQuery({ queryKey: ['broods'], queryFn: animauxApi.broods });

  const statusLabel: Record<string, string> = {
    incubating: 'En incubation',
    hatched: 'Éclos',
    failed: 'Échoué',
    cancelled: 'Annulé',
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Couvées & Incubation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {(broods || []).filter((b: any) => b.status === 'incubating').length} couvées actives
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Nouvelle couvée
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(broods || []).map((brood: any) => {
            const daysInIncubation = differenceInDays(new Date(), new Date(brood.incubationStartDate));
            const daysUntilHatch = brood.expectedHatchDate
              ? differenceInDays(new Date(brood.expectedHatchDate), new Date())
              : null;

            return (
              <div key={brood.id} className="lftg-card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                      <Egg className="w-5 h-5 text-gold-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{brood.species?.name}</p>
                      <p className="text-xs text-muted-foreground">{brood.eggCount} œufs</p>
                    </div>
                  </div>
                  <span className={`lftg-badge ${
                    brood.status === 'incubating' ? 'badge-pending' :
                    brood.status === 'hatched' ? 'badge-approved' : 'badge-rejected'
                  }`}>
                    {statusLabel[brood.status] || brood.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Début: {new Date(brood.incubationStartDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {brood.expectedHatchDate && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Éclosion prévue: {new Date(brood.expectedHatchDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                {brood.status === 'incubating' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Jour {daysInIncubation}</span>
                      {daysUntilHatch !== null && (
                        <span>{daysUntilHatch > 0 ? `J-${daysUntilHatch}` : 'Éclosion imminente'}</span>
                      )}
                    </div>
                    {daysUntilHatch !== null && daysInIncubation + daysUntilHatch > 0 && (
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gold-500 transition-all"
                          style={{
                            width: `${Math.min(100, (daysInIncubation / (daysInIncubation + Math.max(0, daysUntilHatch))) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {brood.status === 'hatched' && brood.hatchedCount !== null && (
                  <div className="mt-3 p-2 rounded-lg bg-forest-50 text-xs text-forest-700 font-medium">
                    {brood.hatchedCount} / {brood.eggCount} œufs éclos
                  </div>
                )}

                {brood.notes && (
                  <p className="mt-3 text-xs text-muted-foreground italic">{brood.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && broods?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Egg className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune couvée enregistrée</p>
        </div>
      )}
    </div>
  );
}
