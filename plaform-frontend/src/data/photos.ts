import dimensions from "@/assets/photos/photos.json"

/**
 * Photos institutionnelles embarquées dans le build (générées par
 * scripts/optimize-photos.sh). Vite les sert avec un nom haché : cache
 * navigateur illimité, aucune requête vers l'API.
 */
export type PhotoName = keyof typeof dimensions

const files = import.meta.glob<string>("@/assets/photos/*.{avif,webp}", {
  eager: true,
  import: "default",
  query: "?url",
})

export interface StaticPhoto {
  avif: string
  webp: string
  fallback: string
  width: number
  height: number
}

function srcSet(name: string, ext: "avif" | "webp") {
  return Object.entries(files)
    .map(([path, url]) => {
      const m = path.match(new RegExp(`/${name}-(\\d+)\\.${ext}$`))
      return m ? { w: Number(m[1]), url } : null
    })
    .filter((v): v is { w: number; url: string } => v !== null)
    .sort((a, b) => a.w - b.w)
}

export function staticPhoto(name: PhotoName): StaticPhoto {
  const webp = srcSet(name, "webp")
  const toAttr = (list: { w: number; url: string }[]) =>
    list.map((v) => `${v.url} ${v.w}w`).join(", ")
  return {
    avif: toAttr(srcSet(name, "avif")),
    webp: toAttr(webp),
    fallback: webp[Math.min(1, webp.length - 1)]?.url ?? "",
    ...dimensions[name],
  }
}

/**
 * Légende documentaire de chaque photo : l'événement et le lieu. Une photo
 * sans contexte n'apporte pas de preuve ; affichée sous l'image (Figure).
 */
export const photoCaptions: Record<PhotoName, string> = {
  "seminaire-public": "Séminaire « De la recherche à l'innovation », Douala, septembre 2025",
  "seminaire-salle": "Séminaire « De la recherche à l'innovation », Douala, septembre 2025",
  "seminaire-presentation": "Présentation au séminaire de septembre 2025, Douala",
  "seminaire-intervenant": "Intervention au séminaire de septembre 2025, Douala",
  "seminaire-micro": "Prise de parole au séminaire de septembre 2025, Douala",
  "seminaire-remise": "Remise de distinction, séminaire de septembre 2025",
  "seminaire-laureats": "Lauréats du séminaire de septembre 2025",
  "seminaire-echange": "Échange avec un intervenant, séminaire de septembre 2025",
  "paei-2026-atelier": "Atelier du PAEI 2026, Douala",
  "paei-2026-entretien": "Entretien individuel, PAEI 2026",
  "paei-2026-salle": "Salle de travail du PAEI 2026",
  "paei-2024-groupe": "Promotion PAEI 2024, Douala",
  "paei-2024-promotion": "Promotion PAEI 2024, Douala",
  "glab-table-ronde": "Table ronde #TechSisters, GLab Sisters, août 2026",
  "glab-echanges": "Échanges GLab Sisters, Douala",
}
