# Plan de Maintenance Préventive – Plateforme LFTG

**Auteur:** Manus AI
**Date:** 2026-03-11
**Version:** 1.0

## 1. Introduction et Objectifs

Ce document détaille le plan de maintenance préventive pour la plateforme applicative **La Ferme Tropicale de Guyane (LFTG)**. L'audit récent a révélé des vulnérabilités critiques liées à la désynchronisation entre le schéma de la base de données et le code applicatif, ainsi qu'à l'absence de monitoring proactif. Ces problèmes ont entraîné des erreurs `502 Bad Gateway` et des défaillances fonctionnelles, nécessitant des interventions correctives en urgence.

L'objectif de ce plan est de mettre en place un ensemble de **procédures automatisées et de bonnes pratiques** pour garantir la **stabilité, la fiabilité et la sécurité** de la plateforme sur le long terme. Il vise à prévenir les incidents futurs en détectant les anomalies de manière proactive, en assurant l'intégrité des données et en structurant le processus de déploiement.

Les piliers de ce plan sont :

*   **Automatisation :** Réduire les interventions manuelles et les risques d'erreur humaine grâce à des scripts de contrôle et de maintenance.
*   **Monitoring :** Superviser en continu l'état de l'infrastructure et des services applicatifs pour anticiper les défaillances.
*   **Sécurité des données :** Garantir l'intégrité et la disponibilité des données par des sauvegardes régulières et une gestion rigoureuse des migrations de schéma.
*   **Déploiement maîtrisé :** Standardiser le processus de mise en production pour minimiser les risques de régression.

## 2. Vue d'ensemble de l'infrastructure

La plateforme LFTG est hébergée sur un serveur unique et s'appuie sur une architecture conteneurisée avec Docker. La compréhension de cette infrastructure est essentielle pour cibler les actions de maintenance.

| Composant | Technologie | Rôle | Points de vigilance |
|---|---|---|---|
| **Serveur Web** | Nginx | Reverse proxy, terminaison SSL | Configuration, disponibilité, logs d'accès |
| **Application Frontend** | Next.js (React) | Interface utilisateur | Build, erreurs client, performance |
| **Application Backend** | NestJS (Node.js) | API, logique métier | Disponibilité, erreurs serveur, performance des requêtes |
| **Base de données** | PostgreSQL | Stockage des données relationnelles | Disponibilité, intégrité, performance, backups |
| **Base de données (legacy)**| PostgreSQL | Autre instance (à clarifier) | Utilisation, nécessité de migration/consolidation |
| **Cache** | Redis | Sessions, cache applicatif | Disponibilité, utilisation mémoire |
| **ORM** | Prisma | Mapping objet-relationnel | Synchronisation du schéma, migrations |

L'analyse a montré que le principal point de défaillance historique est la **désynchronisation entre le schéma Prisma et la base de données PostgreSQL**. Ce problème survient lorsque des modifications sont apportées au code (modèles Prisma) sans être répercutées correctement dans la structure de la base de données via une migration.

## 3. Script de Maintenance Automatisé

Un script de maintenance centralisé, `lftg_maintenance.sh`, a été développé pour automatiser les vérifications préventives. Il est conçu pour être exécuté directement sur le serveur de production.

### 3.1. Fonctionnalités du script

Le script exécute les tâches suivantes et génère un rapport horodaté dans `/home/ubuntu/maintenance_logs/` :

1.  **Analyse des ressources système :**
    *   Vérifie l'utilisation de l'espace disque et alerte si elle dépasse 85%.
    *   Rapporte l'utilisation actuelle de la mémoire vive (RAM).

2.  **Contrôle des services Docker :**
    *   S'assure que tous les conteneurs essentiels (backend, frontend, nginx, redis, postgres) sont actifs (`Up`).

3.  **Validation du schéma de base de données :**
    *   Utilise la commande `npx prisma migrate status` pour vérifier que la base de données est parfaitement synchronisée avec le schéma Prisma.
    *   Alerte si des migrations sont en attente d'application.

4.  **Tests de fumée (Smoke Tests) de l'API :**
    *   Exécute le script `smoke-tests.sh` existant pour valider la disponibilité et le bon fonctionnement des endpoints critiques de l'API.

5.  **Analyse des logs applicatifs :**
    *   Recherche les erreurs (`ERROR`, `FATAL`) récentes dans les logs du container backend pour une détection précoce des problèmes.

6.  **Vérification des sauvegardes :**
    *   Contrôle le log du script de backup (`/home/ubuntu/backups/backup.log`) pour confirmer que la dernière sauvegarde s'est déroulée sans erreur.

### 3.2. Code source du script

Le code source complet est disponible sur le serveur de production à l'emplacement `/home/ubuntu/lftg_maintenance.sh`. Voici les sections clés :

**Vérification des containers :**
```bash
REQUIRED_CONTAINERS=("lftg-backend-prod" "lftg-frontend-prod" "lftg-redis-prod" "lftg-postgres-prod" "lftg-nginx" "lftg-db")
for container in "${REQUIRED_CONTAINERS[@]}"; do
    status=$(docker ps --filter "name=$container" --format "{{.Status}}")
    if [[ -z "$status" || ! "$status" =~ ^Up ]]; then
        log_msg "ERROR" "Le container '$container' n'est pas actif."
    fi
done
```

**Vérification du schéma Prisma :**
```bash
status_output=$(DATABASE_URL="$DATABASE_URL" npx prisma migrate status 2>&1)
if echo "$status_output" | grep -q "Your database is up to date"; then
    log_msg "INFO" "La base de données est synchronisée avec le schéma Prisma."
elif echo "$status_output" | grep -q "Following migration have not been applied"; then
    log_msg "WARN" "Des migrations Prisma sont en attente d'application."
fi
```

## 4. Procédures de Déploiement et de Sauvegarde

Pour éviter les régressions et les problèmes de synchronisation, un processus de déploiement structuré et des sauvegardes fiables sont impératifs.

### 4.1. Workflow de Déploiement Sécurisé (GitFlow Recommandé)

L'absence d'un processus de déploiement clair est un facteur de risque majeur. Nous recommandons l'adoption d'un workflow basé sur Git, comme le **GitFlow**, pour structurer les développements.

1.  **Branches de fonctionnalités (`feature/`)** : Tout nouveau développement commence sur une branche dédiée à partir de la branche `develop`.
2.  **Pull Request (PR)** : Une fois la fonctionnalité terminée, une Pull Request est ouverte vers la branche `develop`. Cette étape est cruciale pour la **revue de code** par un autre membre de l'équipe.
3.  **Environnement de Staging/Pré-production** : La branche `develop` est déployée automatiquement sur un environnement de staging qui réplique l'environnement de production. Cela permet de réaliser des tests complets sans impacter les utilisateurs.
4.  **Migrations Prisma** : Si la PR inclut des changements de schéma, la migration Prisma (`npx prisma migrate dev`) est générée lors du développement. La migration de production (`npx prisma migrate deploy`) est appliquée lors du déploiement sur staging, puis sur production.
5.  **Branche de `release`** : Lorsque la branche `develop` est stable, une branche de `release` est créée. Elle sert à préparer la mise en production (mise à jour des versions, etc.).
6.  **Mise en production (`main`)** : La branche de `release` est mergée dans la branche `main`. Ce merge déclenche le déploiement automatique en production.
7.  **Tags Git** : Chaque mise en production est marquée par un tag Git (ex: `v1.2.0`) pour faciliter les retours en arrière si nécessaire.

### 4.2. Stratégie de Sauvegarde

Le script de sauvegarde existant (`/home/ubuntu/lftg_backup.sh`) est une bonne base. Il effectue une sauvegarde quotidienne de la base de données PostgreSQL et du répertoire `uploads`. Nous recommandons les améliorations suivantes :

*   **Externalisation des sauvegardes** : Les sauvegardes doivent être copiées sur un stockage externe (ex: un bucket S3, un autre serveur) pour se prémunir contre une défaillance totale du serveur principal.
*   **Tests de restauration** : Des tests de restauration trimestriels doivent être planifiés pour garantir que les sauvegardes sont valides et que la procédure de restauration est maîtrisée.
*   **Monitoring du script de backup** : Le script de maintenance vérifie déjà le statut de la dernière sauvegarde. Toute erreur doit déclencher une alerte immédiate.

## 5. Monitoring et Alerting

Un monitoring proactif est essentiel pour détecter les problèmes avant qu'ils n'impactent les utilisateurs.

### 5.1. Tâches Cron

L'automatisation du monitoring reposera sur des tâches `cron`.

1.  **Maintenance Quotidienne (recommandé à 3h00)** : Le script `lftg_maintenance.sh` sera exécuté tous les jours.

    ```cron
    0 3 * * * /home/ubuntu/lftg_maintenance.sh
    ```

2.  **Sauvegarde Quotidienne (existante)** : Le script de sauvegarde est déjà configuré pour s'exécuter tous les jours à 2h00.

    ```cron
    0 2 * * * /home/ubuntu/lftg_backup.sh >> /home/ubuntu/backups/backup.log 2>&1
    ```

### 5.2. Système d'alerting

Les rapports générés par les scripts sont utiles, mais un système d'alerting actif est nécessaire. Les scripts doivent être modifiés pour envoyer des notifications par email ou via un service comme Slack/Discord en cas d'erreur (`ERROR`) ou d'avertissement (`WARN`).

**Exemple d'amélioration du script :**

```bash
# ... dans la fonction log_msg ...
if [[ "$type" == "ERROR" || "$type" == "WARN" ]]; then
    # Commande pour envoyer une alerte par email
    echo "$message" | mail -s "[LFTG Alerte Maintenance] - $type" admin@example.com
fi
```

## 6. Recommandations et Prochaines Étapes

1.  **Mettre en place le workflow GitFlow** : C'est la priorité la plus élevée pour sécuriser le processus de développement et de déploiement.
2.  **Créer un environnement de Staging** : Isoler un environnement de test est crucial pour valider les changements avant la mise en production.
3.  **Externaliser les sauvegardes** : Configurer la copie des archives de backup vers un stockage distant et sécurisé.
4.  **Implémenter l'alerting** : Modifier les scripts de maintenance et de sauvegarde pour envoyer des notifications en cas de problème.
5.  **Planifier des tests de restauration** : Organiser et documenter une procédure de restauration de sauvegarde, et la tester trimestriellement.
6.  **Consolider les bases de données** : Clarifier le rôle de l'instance `lftg-postgres-prod` et envisager de la fusionner avec `lftg-db` si elle n'est pas nécessaire.

Ce plan de maintenance fournit une base solide pour améliorer la robustesse de la plateforme LFTG. Son succès dépendra de l'application rigoureuse de ces procédures par l'équipe de développement.
