import { programLabel } from "@/lib/inbox"

/* Familles d'espaces : chaque programme est une boîte de réception. */
export const SPACE_FAMILIES: { label: string; keys: string[] }[] = [
  { label: "Programmes", keys: ["paei", "mentorat", "glab-sisters", "stage", "formations"] },
  {
    label: "Initiatives",
    keys: ["junior-builders", "caravanes-jeune", "caravanes-entreprise", "rencontre-challenge"],
  },
  { label: "Services", keys: ["louer-developpeur"] },
]

export const ALL_KEYS = SPACE_FAMILIES.flatMap((f) => f.keys)
export const ALL_LABEL = "Toutes les candidatures"

/** Titre de l'espace courant. */
export const spaceTitle = (domain: string) => (domain === "all" ? ALL_LABEL : programLabel(domain))
