# Notes de travail — plateforme Gehmit

## Structure du dépôt

| Dossier | Rôle |
|---|---|
| `plaform-frontend/` | Site public (React 19, Vite, pnpm) |
| `plaform-frontend - admin/` | Back office (même stack, Keycloak) |
| `packages/ui/` | `@gehmit/ui` : jetons, primitives et `cn` partagés par les deux frontends |
| `platform-backend/platform/` | API Spring Boot, architecture hexagonale multi-module |

## Backend

Architecture hexagonale / DDD : voir `platform-backend/platform/README.md` pour
les conventions (modules, contextes délimités, packages, câblage).

Règles à respecter lors des modifications :

- le module `domain` ne doit avoir **aucune** dépendance de production ;
- les cas d'usage (`application`) n'utilisent de Spring que `@Transactional` et
  sont instanciés explicitement dans `com.ghemit.platform.bootstrap` ;
- toute traduction erreur métier → code HTTP se fait dans `RestExceptionHandler` ;
- l'URL publique d'un média se construit dans la couche web, pas dans le domaine.

### Commandes de vérification

```bash
cd platform-backend/platform
./gradlew build            # compile + tests (aucune infrastructure requise)
./gradlew integrationTest  # câblage complet du contexte Spring (PostgreSQL requis)
```

`-parameters` est activé pour tous les modules dans le `build.gradle` racine :
sans lui, les `@PathVariable` / `@RequestParam` sans nom explicite échouent à
l'exécution (le plugin Spring Boot ne l'ajoute qu'au module `bootstrap`).

### Base de données

`spring.jpa.hibernate.ddl-auto=update` : le schéma suit les entités JPA de
`infrastructure/.../out/persistence`. Ne pas renommer leurs tables ni leurs
colonnes sans migration.

## Frontends

Workspace pnpm à la racine (un seul `pnpm-lock.yaml`) : les deux applications
dépendent de `@gehmit/ui` (`packages/ui`).

```bash
pnpm install                   # à la racine, une fois pour tout le workspace
pnpm dev:public                # ou : pnpm dev:admin
pnpm build                     # vérification des deux apps (tsc + vite build)
pnpm lint                      # ESLint + règles du React Compiler (aussi en CI)
pnpm check:colors              # charte graphique (aussi exécutée en CI)
```

### Charte graphique

Gehmit = **vert et blanc**. L'or est un accent rare (don, article à la une),
**jamais de bleu**.

- Toutes les couleurs, ombres, tailles et espacements sont définis dans
  `packages/ui/src/theme.css`. Aucune couleur en dur (#hex, rgb()) dans un
  composant : utiliser les rôles (`text-ink`, `text-ink-muted`, `bg-surface`,
  `bg-surface-alt`, `bg-inverse`, `border-line`, `text-gehmit-light` sur fond
  sombre…).
- `scripts/check-colors.mjs` bloque la CI en cas de bleu, de palette Tailwind
  brute, de couleur en dur ou d'or hors des fichiers autorisés.
- Primitives (bouton, champ, dialogue…) : `@gehmit/ui/components/<nom>`.
  Ne pas recréer de dossier `components/ui` dans une application.

### Site public : composants de mise en page

- Une bande de page = `<Section bg="surface|alt|tint|inverse" [compact]>` ;
  un titre = `<Heading>` ; titre + phrase ou lien = `<SectionHeader>`.
- Le **ton** (clair / sombre) se propage : sur `bg="inverse"` (ou dans un
  `<ToneProvider tone="inverse">`), `Heading`, `ArrowLink`, `CtaLink`
  (`outline`), `Ledger`, `Testimonial` et les légendes passent en clair
  d'eux-mêmes. Ne pas écrire `text-surface` à la main sur ces composants.
- Un seul style de bouton : `CtaLink` (lien), `CtaButton` (formulaire) ou
  `ctaVariants(...)` ; la variante `donate` (or) est réservée au don.
- Dates de l'API : `dateParts` / `shortDate` de `lib/date.ts`.
- Une page longue se découpe en dossier (`pages/home/index.tsx` + sections).

### Back office : conventions

- Un écran = un dossier (`pages/candidatures/`…) : un hook `use-…` porte
  l'état et les appels API, `index.tsx` assemble des composants d'affichage.
- Chargement de données : `useResource(load, deps)` (`lib/use-resource.ts`),
  jamais `useEffect` + `setState` à la main ; mise à jour locale après une
  mutation avec `setData`, rechargement avec `reload`.
- Pas de `useCallback` / `useMemo` de confort : le React Compiler mémoïse.
- Carte de tableau de bord : `Panel` ; choix exclusif en ligne :
  `SegmentedControl` (`@gehmit/ui`).

## Infrastructure locale

`docker compose up -d` à la racine : PostgreSQL 16, MinIO, Mailhog, Keycloak 26.

## Déploiement

Push sur `master` → `.github/workflows/deploy.yml` : tests backend, images
Docker Hub (`brandoniscoding/gehmit-{backend,frontend,admin}`, construites
seulement si leur dossier ou `packages/` a changé ; les images frontend se
construisent depuis la racine du dépôt, `docker build -f plaform-frontend/Dockerfile .`), puis déploiement SSH sur le VPS dans
`/root/gehmit-platform` (même serveur que LesCracks, derrière Traefik).

- Secrets GitHub : `DOCKER_USERNAME`, `DOCKER_TOKEN`, `VPS_HOST`, `VPS_USER`,
  `VPS_SSH_KEY` (clé de déploiement dédiée, commentaire `github-actions-gehmit-deploy`
  dans `~/.ssh/authorized_keys` du serveur).
- Secrets d'exécution : `/root/gehmit-platform/.env` sur le serveur uniquement.
- Redéploiement manuel : onglet Actions → « Run workflow » (choix du service).
