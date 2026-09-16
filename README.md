# Gehmit — Plateforme web

Plateforme web de **Gehmit**, organisation camerounaise à but non lucratif qui
informe, forme et oriente les jeunes vers les métiers du numérique.

## Architecture

| Module | Description | Stack |
|---|---|---|
| `plaform-frontend/` | Site public | React 19, TypeScript, Vite, Tailwind CSS 4, shadcn (base-nova), Motion, react-router 7 |
| `plaform-frontend - admin/` | Back office d'administration | Même stack, authentification Keycloak |
| `platform-backend/` | API REST | Spring Boot (Java, Gradle), JPA/Hibernate |
| `docker-compose.yml` | Services d'infrastructure | PostgreSQL 16, MinIO, Mailhog, Keycloak 26 |
| `keycloak/` | Realm `gehmit` importé au démarrage | — |

## Démarrage rapide

```bash
# 1. Infrastructure (PostgreSQL, MinIO, Mailhog, Keycloak)
docker compose up -d

# 2. Backend (http://localhost:8080)
cd platform-backend/platform
./gradlew bootRun

# 3. Site public (http://localhost:5173)
cd plaform-frontend
pnpm install && pnpm dev

# 4. Back office (http://localhost:5174)
cd "plaform-frontend - admin"
pnpm install && pnpm dev
```

Accès de développement : admin Keycloak `admin / admin` (http://localhost:8180),
Mailhog sur http://localhost:8025, console MinIO sur http://localhost:9001
(`minioadmin / minioadmin`). Tous les identifiants sont des valeurs locales de
développement à remplacer en production (variables d'environnement).

## Fonctionnalités

- **Site public** : accueil, à propos, 5 programmes (PAEI, Mentorat, Formations,
  Stage, GLab Sisters), candidature en 3 étapes, catalogue de formations,
  Solutions (TechPath), impact, blog, contact, don, devenir partenaire,
  inscription newsletter.
- **Back office** : gestion des programmes, formations, calendrier, articles,
  FAQ, partenaires, statistiques, réalisations, réglages, médiathèque (MinIO),
  newsletter (abonnés + campagnes), boîte de réception (messages + candidatures).
- **Contenu dynamique** : le site public charge son contenu via
  `GET /api/public/content` (les données embarquées servent de repli).

---

# Audit de conformité — retours client

État du code au 16/09/2026 face aux remarques de consultation du site.

## 1. Page d'accueil

| Exigence | Statut | Détail |
|---|---|---|
| Modèle choisi par le client | ⚠️ À confirmer | Le code implémente la **Direction 2a** du dossier `UIUX/`. Si le client avait validé une autre direction, l'écart est confirmé. |
| Bannière à taille fixe | ✅ | Hauteurs fixes (`min-h-[300px] lg:min-h-[540px]`), images en `object-cover`. |
| Pas de slide/carrousel | ✅ | Aucun carrousel utilisé sur l'accueil. |

## 2. Remarques globales

| Exigence | Statut | Détail |
|---|---|---|
| Collecter les **noms** pour la newsletter | ❌ | Le formulaire ne collecte que l'e-mail ; `NewsletterSubscriber` n'a pas de champ nom. |
| Inscription auto newsletter + origine | ❌ | Les candidatures et messages de contact ne sont pas ajoutés à la newsletter ; pas de champ `source`. |
| Bannière réduite pages secondaires | ⚠️ Partiel | Compact sur Programmes/Formations/Impact/Blog ; grandes bannières restantes sur À propos, Solutions et pages détail programme. |
| Solutions = produits/outils | ⚠️ Partiel | TechPath présenté, mais le bouton renvoie vers `/contact` au lieu de l'outil. |

## 3. Back office

| Exigence | Statut | Détail |
|---|---|---|
| Trier les candidatures par programme | ❌ | Colonne Programme affichée, aucun tri ni filtre. |
| Rubrique gestion des partenaires | ✅ | Page `/partenaires` + `ContentType.PARTNER`. |
| Envoi d'e-mails newsletter via back office | ✅ | Page Newsletter + `POST /api/admin/newsletter/send`. |
| Modifier tous les contenus via back office | ⚠️ Partiel | Contenus structurés éditables (programmes, articles, FAQ, partenaires, stats…) ; les textes des pages restent codés en dur. |

## 4. Propositions d'ajout

| Fonctionnalité | Statut |
|---|---|
| Louer un développeur / mise en relation | ❌ Absent |
| Caravanes de visite d'entreprises | ❌ Absent |
| Rencontre Challenge | ❌ Absent |
| Formulaires junior builders | ⚠️ Partiel — formulaire générique fonctionnel, mais pas de formulaire dédié et le CV n'est pas réellement uploadé (nom de fichier seul). |
| Message WhatsApp direct | ❌ Absent |

## Anomalies détectées

- La page contact affiche « Un chat est disponible sur toutes les pages du
  site » alors qu'aucun chat n'est implémenté.

## Synthèse

- ✅ **4 respectés** · ⚠️ **4 partiels** · ❌ **7 non implémentés** · ⚠️ **1 à clarifier**
- Priorités backend : inscription newsletter automatique (nom + origine),
  tri/filtre des candidatures par programme.
