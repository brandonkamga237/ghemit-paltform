import { createCn } from "cn/config"

/**
 * `cn` (fusion de classes) configuré pour les jetons du thème. Sans cela, les
 * tailles `text-h2`, `text-lead`… sont prises pour des couleurs et supprimées
 * dès qu'une couleur `text-navy` suit, et le rythme `py-section` n'est pas
 * reconnu comme un espacement.
 */
export const cn = createCn({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "lead", "body", "small", "caption"],
      spacing: ["section", "block", "group", "item"],
      container: ["page", "text"],
    },
    classGroups: {
      "font-size": [{ text: ["display", "h1", "h2", "h3", "lead", "body", "small", "caption"] }],
    },
  },
})
