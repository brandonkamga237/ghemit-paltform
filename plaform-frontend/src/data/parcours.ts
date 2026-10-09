import type { Program } from "@/data/content"

/**
 * Le parcours Gehmit : les neuf offres du site rangées sur quatre étapes,
 * de l'orientation à l'emploi. Sert de fil narratif à l'accueil, au menu et
 * aux fiches programme (« où ce programme se situe »).
 */
export interface Offer {
  name: string
  to: string
  /** Ce que l'offre apporte, en une ligne. */
  line: string
  /** Programme administré correspondant : son statut est affiché. */
  programSlug?: string
}

export interface Stage {
  id: string
  verb: string
  text: string
  offers: Offer[]
}

export const parcours: Stage[] = [
  {
    id: "orienter",
    verb: "S'orienter",
    text: "Comprendre les métiers du numérique et choisir une voie.",
    offers: [
      { name: "TechPath", to: "/solutions", line: "Un coach d'orientation en ligne, à toute heure." },
      { name: "Caravanes", to: "/caravanes", line: "Un après-midi dans une entreprise tech." },
    ],
  },
  {
    id: "former",
    verb: "Se former",
    text: "Acquérir les compétences, en sessions courtes et pratiques.",
    offers: [
      { name: "Formations", to: "/formations", line: "Data, développement web et IA appliquée.", programSlug: "formations" },
      { name: "GLab Sisters", to: "/programmes/glab-sisters", line: "Les femmes dans le numérique et le leadership.", programSlug: "glab-sisters" },
    ],
  },
  {
    id: "accompagner",
    verb: "Être accompagné",
    text: "Un professionnel à vos côtés, le temps qu'il faut.",
    offers: [
      { name: "Mentorat", to: "/programmes/mentorat", line: "Trois mois avec un professionnel du métier visé.", programSlug: "mentorat" },
      { name: "PAEI", to: "/programmes/paei", line: "Six mois de préparation à l'emploi.", programSlug: "paei" },
    ],
  },
  {
    id: "inserer",
    verb: "S'insérer",
    text: "Du premier projet au premier emploi.",
    offers: [
      { name: "Stage", to: "/programmes/stage", line: "Un placement en entreprise partenaire.", programSlug: "stage" },
      { name: "Junior Builders", to: "/junior-builders", line: "Le vivier présenté aux entreprises." },
      { name: "Rencontre Challenge", to: "/rencontre-challenge", line: "Un défi réel, un jury de recruteurs." },
    ],
  },
]

/** Ce que Gehmit propose aux entreprises et institutions. */
export const forCompanies: Offer[] = [
  { name: "Recruter un développeur", to: "/louer-developpeur", line: "Des profils vérifiés, sans commission." },
  { name: "Accueillir un stagiaire", to: "/partenaire", line: "Un profil préparé et suivi par l'équipe." },
  { name: "Recevoir une caravane", to: "/caravanes", line: "Faites découvrir vos métiers à quinze jeunes." },
  { name: "Devenir partenaire", to: "/partenaire", line: "Mécénat de compétences, matériel, salle." },
]

/** Étape du parcours à laquelle appartient un programme. */
export function stageOf(slug: string): Stage | undefined {
  return parcours.find((s) => s.offers.some((o) => o.programSlug === slug))
}

export function programStatus(programs: Program[], slug?: string) {
  if (!slug) return undefined
  const p = programs.find((x) => x.slug === slug)
  return p ? { status: p.status, label: p.statusLabel } : undefined
}
