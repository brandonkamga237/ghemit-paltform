# API Gehmit — architecture hexagonale & DDD

Backend Spring Boot découpé en **quatre modules Gradle**, un par couche de
l'hexagone. La direction des dépendances est garantie par le compilateur : un
module ne peut pas importer ce qu'il ne déclare pas.

```
domain  ←  application  ←  infrastructure  ←  bootstrap
```

| Module | Rôle | Dépendances |
|---|---|---|
| `domain` | Agrégats, objets valeur, règles métier, ports de persistance | **aucune** (Java pur) |
| `application` | Cas d'usage, ports entrants/sortants, orchestration | `domain` + annotations `@Transactional` |
| `infrastructure` | Adaptateurs : REST, JPA, MinIO, SMTP, sécurité | `application` + Spring Boot |
| `bootstrap` | Application Spring Boot, câblage explicite, configuration | `infrastructure` |

Le domaine ne contient **aucune** annotation Jakarta, Hibernate, Jackson ou
Spring : les entités JPA vivent dans l'infrastructure et des mappers font la
traduction dans les deux sens.

## Contextes délimités

| Contexte | Agrégats | Tables |
|---|---|---|
| `content` | `ContentItem` (programmes, formations, articles, FAQ, réglages…) | `content_items` |
| `inbox` | `Candidature`, `ContactMessage` | `candidatures`, `contact_messages` |
| `media` | `MediaFile` | `media_files` |
| `newsletter` | `Subscriber`, `Campaign` | `newsletter_subscribers`, `newsletter_campaigns` |

Les contextes ne se connaissent pas. Deux liaisons existent, toutes deux via un
port + un adaptateur de traduction dans l'infrastructure :

- `inbox` → `newsletter` : l'inscription automatique des personnes qui écrivent
  ou candidatent passe par le port `NewsletterEnrollment`
  (adaptateur `NewsletterEnrollmentAdapter`).
- `media` → `content` : les dossiers de la médiathèque sont stockés dans le
  réglage `media-folders`, derrière le port `MediaFolderCatalog`
  (adaptateur `ContentSettingMediaFolderCatalog`).

## Convention de packages

```
com.ghemit.platform.<contexte>.domain                       agrégats, objets valeur, ports de persistance
com.ghemit.platform.<contexte>.application                  implémentations des cas d'usage
com.ghemit.platform.<contexte>.application.port.in          cas d'usage exposés + commandes
com.ghemit.platform.<contexte>.application.port.out         ports vers les systèmes externes
com.ghemit.platform.<contexte>.infrastructure.in.web        contrôleurs REST + DTO
com.ghemit.platform.<contexte>.infrastructure.out.<techno>  adaptateurs sortants
com.ghemit.platform.shared.*                                noyau transverse (EmailAddress, Page, erreurs)
com.ghemit.platform.bootstrap                               câblage Spring des cas d'usage
```

Les ports de **persistance** sont dans le domaine (ils parlent le langage
métier) ; les ports vers les **systèmes techniques** (SMTP, stockage d'objets)
sont dans `application.port.out`.

## Câblage

Les cas d'usage sont de simples classes Java sans annotation de stéréotype :
ils sont instanciés explicitement dans `com.ghemit.platform.bootstrap`
(`ContentConfiguration`, `InboxConfiguration`…). Seuls les adaptateurs sont
découverts par le scan de composants. On lit donc l'assemblage de l'hexagone
dans un seul endroit.

## Erreurs

Le domaine lève `EntityNotFoundException`, `BusinessRuleViolationException`,
etc. `RestExceptionHandler` est le **seul** point qui traduit ces erreurs en
codes HTTP (404, 400, 415, 413, 502).

## Commandes

```bash
./gradlew build              # compile + tests rapides (domaine, cas d'usage, contrat REST)
./gradlew :domain:test       # règles métier, sans Spring ni base
./gradlew :bootstrap:bootRun # démarre l'API sur http://localhost:8080
./gradlew integrationTest    # câblage complet du contexte Spring (PostgreSQL requis)
```

`./gradlew build` ne nécessite aucune infrastructure. Le test de câblage complet
est marqué `@Tag("integration")` et exclu par défaut : il demande PostgreSQL
(`docker compose up -d` à la racine du dépôt).

## Contrat d'API

Les URLs et la forme JSON sont inchangées par rapport à la version précédente ;
les deux frontends fonctionnent sans modification. Les réponses paginées
reproduisent les champs de `Page<T>` de Spring Data utilisés par le back office
(`content`, `totalElements`, `totalPages`, `number`, `size`).

Une seule différence de comportement : un `status` inconnu envoyé à
`PATCH /api/admin/candidatures/{id}` renvoie désormais `400` au lieu d'être
silencieusement ignoré.
