# Gehmit — Frontend

Frontend React de la plateforme Gehmit, implémenté d'après le dossier `UIUX/` (Direction 2a).

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 4** + **shadcn** (style `base-nova`, primitives `@base-ui/react`)
- **Motion** (`motion/react`, successeur de Framer Motion) : transitions de page, révélations au scroll, méga-menu, menu mobile
- **react-router 7**
- Fontes : Lora (titres), Source Sans 3 (texte), JetBrains Mono (métadonnées) — via Fontsource

## Design tokens

Toute la palette Gehmit est déclarée dans `src/index.css` (`@theme`) :
`gehmit` (#15803D), `navy` (#1E2D4A), `cream` (#F7F3EE), `surface` (#FDFAF7),
`sand` / `sand-dark`, `gold` (#C9952A, réservé au don), `focus` (#2B4C7E) et les
couleurs de statut (`open`, `soon`, `closed`, `archived`).

## Pages

| Route | Écran |
|---|---|
| `/` | Accueil |
| `/a-propos` | À propos |
| `/programmes` | Liste des 5 programmes |
| `/programmes/:slug` | Détail programme (paei, mentorat, stage, glab-sisters) |
| `/candidature/:slug` | Formulaire de candidature en 3 étapes |
| `/formations` | Catalogue + calendrier des sessions |
| `/solutions` | TechPath |
| `/notre-impact` | Chiffres, réalisations, témoignage |
| `/blog` | Liste des articles (recherche + filtres) |
| `/blog/:slug` | Article |
| `/contact` | Formulaire + FAQ |
| `/don` | Don (montants, fréquence, Mobile Money) |
| `/partenaire` | Devenir partenaire |

## Contenu

Les données (programmes, formations, articles, FAQ, partenaires) sont centralisées
dans `src/data/content.ts`. Les visuels utilisent le composant `Photo`
(`src/components/site/photo.tsx`) : passer `src`/`alt` pour remplacer les
emplacements réservés par de vraies images.

## Commandes

```bash
pnpm dev      # serveur de développement
pnpm build    # build de production (tsc + vite)
pnpm lint     # eslint
```
