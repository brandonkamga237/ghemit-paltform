# @gehmit/ui

Système visuel partagé par le site public et le back office.

| Export | Contenu |
|---|---|
| `@gehmit/ui/theme.css` | Jetons (couleurs, typographie, espacements, ombres), base, polices |
| `@gehmit/ui/cn` | Fusion de classes configurée pour les jetons du thème |
| `@gehmit/ui/components/<nom>` | Primitives (button, input, select, dialog, toast…) |

## Charte

Vert et blanc. Or : accent rare (don, article à la une). Jamais de bleu.

| Rôle | Classe | Usage |
|---|---|---|
| Texte | `text-ink`, `text-ink-muted`, `text-ink-faint` | vert presque noir, pas de gris froid |
| Surfaces claires | `bg-surface`, `bg-surface-alt`, `bg-surface-tint` | blanc, blanc vert, teinte verte |
| Surfaces sombres | `bg-inverse`, `bg-inverse-deep`, `bg-inverse-soft` | héros, bandeaux, barre latérale |
| Marque | `bg-gehmit` (+ `-hover`, `-active`, `-deep`) | actions principales |
| Accent sur fond sombre | `text-gehmit-light` | chiffres, numéros, mot-clé |
| Filets | `border-line`, `border-line-strong` | séparateurs |
| Ombres | `shadow-hairline` → `shadow-panel` | 5 niveaux |

Une couleur se change dans `src/theme.css`, jamais dans un composant.
`node scripts/check-colors.mjs` (racine) vérifie la charte.
