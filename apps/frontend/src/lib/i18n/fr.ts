/**
 * LFTG Platform — Traductions françaises (langue par défaut)
 * Phase 12 — Internationalisation (i18n)
 */

export const fr = {
  // Navigation
  nav: {
    dashboard: 'Tableau de bord',
    animals: 'Animaux',
    broods: 'Couvées',
    enclosures: 'Enclos',
    health: 'Santé',
    nutrition: 'Nutrition',
    gps: 'GPS',
    alerts: 'Alertes',
    sales: 'Ventes',
    stock: 'Stock',
    staff: 'Personnel',
    training: 'Formation',
    sponsorship: 'Parrainage',
    realtime: 'Temps réel',
    iot: 'Capteurs IoT',
    ml: 'IA & Prédictions',
    genealogy: 'Généalogie',
    sites: 'Multi-sites',
    apiV2: 'API v2',
    marketplace: 'Marketplace',
    reports: 'Rapports',
    settings: 'Paramètres',
  },

  // Actions communes
  actions: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    import: 'Importer',
    confirm: 'Confirmer',
    close: 'Fermer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    loading: 'Chargement...',
    submit: 'Soumettre',
    reset: 'Réinitialiser',
    view: 'Voir',
    download: 'Télécharger',
    print: 'Imprimer',
    share: 'Partager',
  },

  // Statuts
  status: {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
    draft: 'Brouillon',
    published: 'Publié',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    info: 'Information',
  },

  // Animaux
  animals: {
    title: 'Gestion des animaux',
    add: 'Ajouter un animal',
    edit: 'Modifier l\'animal',
    delete: 'Supprimer l\'animal',
    identifier: 'Identifiant',
    name: 'Nom',
    species: 'Espèce',
    sex: 'Sexe',
    birthDate: 'Date de naissance',
    status: 'Statut',
    enclosure: 'Enclos',
    weight: 'Poids (g)',
    microchip: 'Micropuce',
    ring: 'Bague',
    notes: 'Notes',
    male: 'Mâle',
    female: 'Femelle',
    unknown: 'Inconnu',
  },

  // Alertes
  alerts: {
    title: 'Centre d\'alertes',
    critical: 'Critique',
    warning: 'Avertissement',
    info: 'Information',
    acknowledge: 'Acquitter',
    resolve: 'Résoudre',
    rules: 'Règles d\'alerte',
    noAlerts: 'Aucune alerte active',
  },

  // Erreurs
  errors: {
    notFound: 'Page non trouvée',
    serverError: 'Erreur serveur',
    unauthorized: 'Non autorisé',
    forbidden: 'Accès refusé',
    networkError: 'Erreur réseau',
    required: 'Ce champ est requis',
    invalidEmail: 'Email invalide',
    invalidDate: 'Date invalide',
    minLength: 'Minimum {{min}} caractères',
    maxLength: 'Maximum {{max}} caractères',
  },

  // Accessibilité
  a11y: {
    skipToContent: 'Passer au contenu principal',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    toggleTheme: 'Basculer le thème',
    currentTheme: 'Thème actuel : {{theme}}',
    lightTheme: 'Clair',
    darkTheme: 'Sombre',
    language: 'Langue',
    loading: 'Chargement en cours',
    required: 'Requis',
    optional: 'Optionnel',
    expandRow: 'Développer la ligne',
    collapseRow: 'Réduire la ligne',
  },
};

export type Translations = typeof fr;
