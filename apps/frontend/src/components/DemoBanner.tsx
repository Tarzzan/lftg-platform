"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, Rocket, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";

const DEMO_BANNER_HIDDEN_KEY = "lftg_demo_banner_hidden";

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clearResult, setClearResult] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    // Afficher le bandeau seulement si l'utilisateur est connecté
    // et que le bandeau n'a pas été masqué manuellement
    if (user) {
      const hidden = localStorage.getItem(DEMO_BANNER_HIDDEN_KEY);
      if (!hidden) {
        setIsVisible(true);
      }
    }
  }, [user]);

  const handleHide = () => {
    localStorage.setItem(DEMO_BANNER_HIDDEN_KEY, "true");
    setIsVisible(false);
  };

  const handleClearDemo = async () => {
    setIsClearing(true);
    setShowConfirm(false);
    try {
      const response = await api.post("/demo/clear");
      const data = response.data;
      const totalDeleted = Object.values(data.deleted as Record<string, number>).reduce(
        (sum, count) => sum + count,
        0
      );
      setClearResult(
        `✅ Passage en production effectué ! ${totalDeleted} enregistrement(s) de démonstration supprimé(s). Les données réelles (espèces, enclos, utilisateurs) ont été préservées.`
      );
      // Masquer définitivement le bandeau après nettoyage
      localStorage.setItem(DEMO_BANNER_HIDDEN_KEY, "true");
      setTimeout(() => {
        setIsVisible(false);
        setClearResult(null);
      }, 5000);
    } catch (error) {
      setClearResult("❌ Erreur lors du nettoyage. Veuillez réessayer.");
      setIsClearing(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Bandeau principal */}
      <div className="relative z-50 w-full bg-amber-500 text-white">
        <div className="flex items-center justify-between px-4 py-2 max-w-full">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              <strong>Mode Démonstration</strong> — Cette application affiche des données fictives à titre d&apos;exemple.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isClearing}
              className="flex items-center gap-1.5 bg-white text-amber-700 hover:bg-amber-50 
                         text-xs font-semibold px-3 py-1.5 rounded-full transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClearing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Rocket className="h-3 w-3" />
              )}
              {isClearing ? "Nettoyage..." : "Passer en production"}
            </button>
            <button
              onClick={handleHide}
              className="p-1 hover:bg-amber-600 rounded transition-colors"
              title="Masquer ce bandeau"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message de résultat */}
        {clearResult && (
          <div className="px-4 py-2 bg-amber-600 text-sm border-t border-amber-400">
            {clearResult}
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <Rocket className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Passer en production
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Cette action va supprimer les données de démonstration de la base de données.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">
                ✅ Données préservées (données réelles) :
              </p>
              <ul className="text-xs text-green-700 dark:text-green-400 space-y-0.5">
                <li>• 8 espèces de référence</li>
                <li>• 6 enclos configurés</li>
                <li>• Tous les utilisateurs et rôles</li>
                <li>• Toutes les données que vous avez créées</li>
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
              <p className="text-xs font-semibold text-red-800 dark:text-red-300 mb-1">
                🗑️ Données supprimées (démonstration uniquement) :
              </p>
              <ul className="text-xs text-red-700 dark:text-red-400 space-y-0.5">
                <li>• Événements agenda de démo</li>
                <li>• Logs d&apos;historique fictifs</li>
                <li>• Prédictions ML de démo</li>
                <li>• Données IoT et GPS de démo</li>
                <li>• Alertes et règles de démo</li>
              </ul>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">
              ⚠️ Cette action est irréversible. Le bandeau de démonstration sera définitivement masqué.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                           text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium
                           hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleClearDemo}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 
                           text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Confirmer le passage en production
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
