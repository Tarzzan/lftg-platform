"use client";
import { useState, useEffect } from "react";

const DEMO_BANNER_HIDDEN_KEY = "lftg_demo_banner_hidden";

/**
 * Hook pour détecter si l'application est en mode démonstration.
 * Le mode démo est actif tant que le bandeau n'a pas été masqué
 * (via le bouton "Passer en production" ou le bouton de fermeture).
 */
export function useDemoMode(): boolean {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem(DEMO_BANNER_HIDDEN_KEY);
    setIsDemoMode(!hidden);

    // Écouter les changements de localStorage (ex: après passage en production)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === DEMO_BANNER_HIDDEN_KEY) {
        setIsDemoMode(!e.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return isDemoMode;
}
