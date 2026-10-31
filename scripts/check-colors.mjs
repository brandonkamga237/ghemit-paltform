#!/usr/bin/env node
/**
 * Garde-fou de la charte Gehmit (vert + blanc, or rare, jamais de bleu).
 *
 * Échoue si le code des frontends contient :
 *   - une couleur bleue ou la palette brute de Tailwind (`text-blue-600`, `bg-slate-100`…) ;
 *   - une couleur écrite en dur (#hex, rgb(), hsl()) dans un composant — elle doit être un jeton ;
 *   - de l'or en dehors des usages autorisés (don, article à la une).
 *
 * Les couleurs se définissent dans packages/ui/src/theme.css, et nulle part ailleurs.
 * Usage : node scripts/check-colors.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const root = new URL("..", import.meta.url).pathname
const dirs = ["plaform-frontend/src", "plaform-frontend - admin/src", "packages/ui/src/components"]

/** Seuls fichiers où l'or est permis. */
const goldAllowed = new Set([
  "plaform-frontend/src/components/site/cta.tsx", // variante « donate »
  "plaform-frontend/src/components/site/header.tsx", // bouton « Faire un don »
  "plaform-frontend/src/pages/donate.tsx", // validation du don
  "plaform-frontend/src/pages/partner.tsx", // lien « Faire un don »
  "plaform-frontend - admin/src/pages/articles.tsx", // étoile « À la une »
])

const rules = [
  {
    name: "bleu ou palette Tailwind brute",
    re: /\bnavy\b|\b[a-z:]*-(?:blue|sky|indigo|cyan|teal|violet|purple|slate|gray|zinc|neutral|stone)-\d{2,3}\b/g,
  },
  {
    name: "couleur en dur (utiliser un jeton du thème)",
    re: /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![\w-])|(?<![a-z-])(?:rgba?|hsla?|oklch)\(/g,
    ignore: (_m, line) => /^\s*(\/\/|\*|\/\*)/.test(line),
  },
  {
    name: "or hors des usages autorisés",
    re: /\b[a-z:]*-gold\b|--color-gold/g,
    ignore: (_m, _line, file) => goldAllowed.has(file),
  },
]

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    // src/dev : outils de développement (jeux de données), absents du build de production.
    if (statSync(path).isDirectory()) { if (name !== "dev") yield* walk(path) }
    else if (/\.(tsx?|css)$/.test(name) && !name.endsWith(".d.ts")) yield path
  }
}

let errors = 0
for (const dir of dirs) {
  for (const path of walk(join(root, dir))) {
    const file = relative(root, path)
    readFileSync(path, "utf8")
      .split("\n")
      .forEach((line, i) => {
        for (const rule of rules) {
          for (const m of line.matchAll(rule.re)) {
            if (rule.ignore?.(m[0], line, file)) continue
            console.error(`${file}:${i + 1}  ${rule.name} : ${m[0]}`)
            errors++
          }
        }
      })
  }
}

if (errors) {
  console.error(`\n${errors} écart(s) à la charte. Les couleurs se définissent dans packages/ui/src/theme.css.`)
  process.exit(1)
}
console.log("Charte respectée : aucun bleu, aucune couleur en dur, or limité au don.")
