# Notes de travail — plateforme Gehmit

## Structure du dépôt

| Dossier | Rôle |
|---|---|
| `plaform-frontend/` | Site public (React 19, Vite, pnpm) |
| `plaform-frontend - admin/` | Back office (même stack, Keycloak) |
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

```bash
cd plaform-frontend            # ou "plaform-frontend - admin"
pnpm install && pnpm dev
pnpm build                     # vérification (tsc + vite build)
```

## Infrastructure locale

`docker compose up -d` à la racine : PostgreSQL 16, MinIO, Mailhog, Keycloak 26.

## Déploiement

Push sur `master` → `.github/workflows/deploy.yml` : tests backend, images
Docker Hub (`brandoniscoding/gehmit-{backend,frontend,admin}`, construites
seulement si leur dossier a changé), puis déploiement SSH sur le VPS dans
`/root/gehmit-platform` (même serveur que LesCracks, derrière Traefik).

- Secrets GitHub : `DOCKER_USERNAME`, `DOCKER_TOKEN`, `VPS_HOST`, `VPS_USER`,
  `VPS_SSH_KEY` (clé de déploiement dédiée, commentaire `github-actions-gehmit-deploy`
  dans `~/.ssh/authorized_keys` du serveur).
- Secrets d'exécution : `/root/gehmit-platform/.env` sur le serveur uniquement.
- Redéploiement manuel : onglet Actions → « Run workflow » (choix du service).
