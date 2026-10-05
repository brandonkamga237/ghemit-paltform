import type { PhotoName } from "@/data/photos"

export type ProgramStatus = "open" | "soon" | "closed" | "archived"

export interface Program {
  slug: string
  name: string
  cardDescription: string
  cardLink: string
  status: ProgramStatus
  statusLabel: string
  description: string
  /** Photo de la fiche (embarquée dans le build). */
  photo: PhotoName
  photoAlt: string
  meta: string[]
  primaryCta: { label: string; to: string; disabled?: boolean }
  secondaryCta?: { label: string; to: string }
  detail?: {
    heroTitle: string
    heroText: string
    facts: { label: string; value: string }[]
    sections: { title: string; body?: string; list?: string[] }[]
    steps: { title: string; text: string }[]
    sideTitle: string
    sideText: string
    sidePrimary: string
    sideSecondary?: string
    related: string[]
  }
}

export const programs: Program[] = [
  {
    slug: "paei",
    name: "PAEI",
    cardDescription:
      "Appui à l'employabilité : préparation au marché du travail et mise en relation.",
    cardLink: "Découvrir",
    status: "open",
    statusLabel: "Candidatures ouvertes",
    description:
      "Programme d'appui à l'employabilité et à l'insertion : préparation au marché du travail, projet concret, mise en relation avec les entreprises partenaires.",
    photo: "paei-2024-promotion",
    photoAlt: "Promotion du programme PAEI",
    meta: ["6 mois", "Gratuit", "Douala", "Clôture le 30 sept."],
    primaryCta: { label: "Candidater", to: "/candidature/paei" },
    secondaryCta: { label: "En savoir plus", to: "/programmes/paei" },
    detail: {
      heroTitle: "PAEI",
      heroText:
        "Six mois pour préparer votre entrée sur le marché du travail numérique.",
      facts: [
        { label: "Durée", value: "6 mois" },
        { label: "Rythme", value: "Ateliers hebdomadaires" },
        { label: "Tarif", value: "Gratuit" },
        { label: "Format", value: "Douala" },
      ],
      sections: [
        {
          title: "Le principe",
          body: "Le PAEI combine préparation à l'emploi, réalisation d'un projet concret et mise en relation directe avec les entreprises partenaires de Gehmit. Chaque participant est suivi individuellement jusqu'à son insertion.",
        },
        {
          title: "Conditions",
          list: [
            "Être jeune diplômé ou en fin de formation dans un domaine du numérique.",
            "Être disponible à Douala pendant toute la durée du programme.",
            "S'engager sur la totalité du cycle de six mois.",
          ],
        },
      ],
      steps: [
        { title: "Candidature", text: "Un formulaire de dix minutes." },
        {
          title: "Sélection",
          text: "Un entretien avec l'équipe sous dix jours ouvrés.",
        },
        {
          title: "Accompagnement",
          text: "Six mois d'ateliers, de projet et de suivi individuel.",
        },
        {
          title: "Insertion",
          text: "Mise en relation avec les entreprises partenaires.",
        },
      ],
      sideTitle: "Clôture des candidatures : 30 septembre",
      sideText:
        "Réponse par e-mail sous dix jours ouvrés. Aucun compte à créer.",
      sidePrimary: "Candidater",
      related: ["mentorat", "formations", "stage"],
    },
  },
  {
    slug: "mentorat",
    name: "Mentorat",
    cardDescription:
      "Trois mois avec un professionnel du domaine visé.",
    cardLink: "Découvrir",
    status: "open",
    statusLabel: "Candidatures ouvertes",
    description:
      "Trois mois avec un professionnel de plus de dix ans d'expérience, une à deux séances par semaine, dans le domaine que vous visez.",
    photo: "seminaire-echange",
    photoAlt: "Échange entre un professionnel et un jeune lors d'une rencontre Gehmit",
    meta: ["3 mois", "Bénévole", "À distance"],
    primaryCta: { label: "Candidater", to: "/candidature/mentorat" },
    secondaryCta: { label: "Devenir mentor", to: "/contact" },
    detail: {
      heroTitle: "Mentorat",
      heroText:
        "Trois mois avec un professionnel qui exerce le métier que vous visez.",
      facts: [
        { label: "Durée", value: "3 mois" },
        { label: "Rythme", value: "1 à 2 séances / semaine" },
        { label: "Tarif", value: "Gratuit" },
        { label: "Format", value: "À distance" },
      ],
      sections: [
        {
          title: "Le principe",
          body: "Vous êtes mis en relation avec un mentor bénévole choisi selon le domaine que vous visez et vos disponibilités. Il vous accompagne pendant trois mois : orientation, méthode de travail, préparation aux entretiens, retour d'expérience du terrain.",
        },
        {
          title: "Conditions",
          list: [
            "Être étudiant, jeune diplômé ou en reconversion vers le numérique.",
            "Disposer d'au moins deux heures par semaine pendant trois mois.",
            "Avoir une idée, même imprécise, du domaine visé.",
          ],
        },
      ],
      steps: [
        { title: "Candidature", text: "Un formulaire de dix minutes." },
        {
          title: "Attribution",
          text: "Un mentor vous est proposé sous dix jours ouvrés.",
        },
        {
          title: "Accompagnement",
          text: "Trois mois de séances, à votre rythme commun.",
        },
        {
          title: "Bilan",
          text: "Un retour de chaque côté, pour améliorer le programme.",
        },
      ],
      sideTitle: "Prochaine promotion : octobre 2026",
      sideText:
        "Réponse par e-mail sous dix jours ouvrés. Aucun compte à créer.",
      sidePrimary: "Candidater",
      sideSecondary: "Devenir mentor",
      related: ["formations", "paei", "glab-sisters"],
    },
  },
  {
    slug: "formations",
    name: "Formations",
    cardDescription: "Data, développement web et IA appliquée.",
    cardLink: "Voir le catalogue",
    status: "soon",
    statusLabel: "Prochaine session 14 sept.",
    description:
      "Data, développement web et IA appliquée. Sessions courtes, en ligne ou à Douala, avec calendrier et tarifs publiés.",
    photo: "seminaire-intervenant",
    photoAlt: "Formateur présentant un outil numérique",
    meta: ["2 à 8 semaines", "Gratuit à 25 000 FCFA", "4 sessions"],
    primaryCta: { label: "Voir le catalogue", to: "/formations" },
  },
  {
    slug: "stage",
    name: "Stage",
    cardDescription:
      "Placement en entreprise partenaire à l'issue d'un programme.",
    cardLink: "Découvrir",
    status: "closed",
    statusLabel: "Candidatures closes",
    description:
      "Placement en entreprise partenaire à l'issue d'un programme de formation ou de mentorat.",
    photo: "paei-2026-salle",
    photoAlt: "Participants en salle de travail",
    meta: ["3 à 6 mois", "Réouverture en janvier 2027"],
    primaryCta: { label: "Candidater", to: "/candidature/stage", disabled: true },
    secondaryCta: { label: "M'avertir à l'ouverture", to: "/contact" },
    detail: {
      heroTitle: "Stage",
      heroText:
        "Un placement en entreprise partenaire pour conclure votre parcours.",
      facts: [
        { label: "Durée", value: "3 à 6 mois" },
        { label: "Rythme", value: "Temps plein" },
        { label: "Tarif", value: "Gratuit" },
        { label: "Format", value: "En entreprise" },
      ],
      sections: [
        {
          title: "Le principe",
          body: "À l'issue d'un programme Gehmit, les participants peuvent être placés en stage dans une entreprise partenaire. Le stage est préparé, cadré par une convention et suivi par l'équipe pendant toute sa durée.",
        },
        {
          title: "Conditions",
          list: [
            "Avoir terminé un programme de formation ou de mentorat Gehmit.",
            "Être disponible à temps plein pendant la durée du stage.",
            "Candidatures closes — réouverture en janvier 2027.",
          ],
        },
      ],
      steps: [
        { title: "Fin de programme", text: "Votre parcours Gehmit est validé." },
        {
          title: "Présentation",
          text: "Votre profil est proposé aux entreprises partenaires.",
        },
        {
          title: "Convention",
          text: "Un stage cadré, avec un interlocuteur unique chez Gehmit.",
        },
        {
          title: "Suivi",
          text: "L'équipe reste en contact pendant toute la durée du stage.",
        },
      ],
      sideTitle: "Réouverture : janvier 2027",
      sideText:
        "Les candidatures sont closes. Inscrivez-vous pour être averti à l'ouverture.",
      sidePrimary: "M'avertir à l'ouverture",
      related: ["paei", "mentorat", "formations"],
    },
  },
  {
    slug: "glab-sisters",
    name: "GLab Sisters",
    cardDescription:
      "Les femmes dans le numérique, la tech et le leadership.",
    cardLink: "Découvrir",
    status: "open",
    statusLabel: "Candidatures ouvertes",
    description:
      "Formations, mentorat, ateliers de leadership et communauté de pratique pour les jeunes filles et les femmes dans le numérique.",
    photo: "glab-table-ronde",
    photoAlt: "Table ronde GLab Sisters sur les femmes dans la tech",
    meta: ["Continu", "Gratuit", "Douala et en ligne"],
    primaryCta: { label: "Candidater", to: "/candidature/glab-sisters" },
    secondaryCta: { label: "Devenir partenaire", to: "/partenaire" },
    detail: {
      heroTitle: "GLab Sisters",
      heroText:
        "Formations, mentorat et communauté pour les femmes dans le numérique.",
      facts: [
        { label: "Durée", value: "En continu" },
        { label: "Rythme", value: "Rencontres mensuelles" },
        { label: "Tarif", value: "Gratuit" },
        { label: "Format", value: "Douala et en ligne" },
      ],
      sections: [
        {
          title: "Le principe",
          body: "GLab Sisters réunit formations courtes, mentorat dédié, ateliers de leadership et une communauté de pratique mensuelle. Le programme s'adresse aux jeunes filles et aux femmes qui veulent entrer ou progresser dans le numérique.",
        },
        {
          title: "Conditions",
          list: [
            "Le programme est ouvert aux jeunes filles et aux femmes.",
            "Aucun prérequis technique pour rejoindre la communauté.",
            "Les candidatures sont ouvertes en continu.",
          ],
        },
      ],
      steps: [
        { title: "Candidature", text: "Un formulaire court, sans compte à créer." },
        {
          title: "Accueil",
          text: "Une présentation du programme et de la communauté.",
        },
        {
          title: "Parcours",
          text: "Formations, ateliers et mentorat selon votre objectif.",
        },
        {
          title: "Communauté",
          text: "Une rencontre de pratique chaque mois.",
        },
      ],
      sideTitle: "Candidatures ouvertes en continu",
      sideText:
        "Réponse par e-mail sous dix jours ouvrés. Aucun compte à créer.",
      sidePrimary: "Candidater",
      sideSecondary: "Devenir partenaire",
      related: ["mentorat", "formations", "paei"],
    },
  },
]

export interface Formation {
  name: string
  category: "Data" | "Développement" | "IA" | "Cybersécurité"
  session: string
  duration: string
  format: "En ligne" | "Douala"
  price: string
  status: "open" | "soon" | "closed"
  statusLabel: string
}

export const formations: Formation[] = [
  {
    name: "Fondamentaux de la data",
    category: "Data",
    session: "14 sept. 2026",
    duration: "4 semaines",
    format: "En ligne",
    price: "Gratuit",
    status: "open",
    statusLabel: "Ouvert",
  },
  {
    name: "Développement web",
    category: "Développement",
    session: "6 oct. 2026",
    duration: "8 semaines",
    format: "Douala",
    price: "25 000 FCFA",
    status: "open",
    statusLabel: "Ouvert",
  },
  {
    name: "IA appliquée aux métiers",
    category: "IA",
    session: "3 nov. 2026",
    duration: "6 semaines",
    format: "En ligne",
    price: "Gratuit",
    status: "soon",
    statusLabel: "Bientôt",
  },
  {
    name: "Cybersécurité, niveau 1",
    category: "Cybersécurité",
    session: "Juin 2026",
    duration: "3 semaines",
    format: "Douala",
    price: "Gratuit",
    status: "closed",
    statusLabel: "Terminée",
  },
]

export interface Article {
  slug: string
  date: string
  category: string
  title: string
  excerpt: string
  readingTime: string
  featured?: boolean
  photoLabel: string
  /** URL de l'image de couverture (médiathèque). Vide = visuel par défaut. */
  imageUrl?: string
  body: (
    | { type: "p"; text: string }
    | { type: "h2"; text: string }
    | { type: "h3"; text: string }
    | { type: "quote"; text: string }
    | { type: "ul"; text: string }
    | { type: "ol"; text: string }
    | { type: "code"; text: string }
    | { type: "image"; url: string; text?: string }
    | { type: "hr" }
  )[]
  cta?: { title: string; text: string; label: string; to: string }
}

export const articles: Article[] = [
  {
    slug: "table-ronde-femmes-tech",
    date: "29 juillet 2026",
    category: "GLab Sisters",
    title: "Table ronde : comprendre les défis des femmes dans la tech",
    excerpt:
      "Une rencontre entre femmes leaders, étudiantes et professionnelles pour construire des solutions ensemble.",
    readingTime: "4 min de lecture",
    featured: true,
    photoLabel: "Photo d'ouverture — table ronde",
    body: [
      {
        type: "p",
        text: "La rencontre est partie d'un constat simple : les difficultés rencontrées par les femmes dans le numérique se ressemblent d'un parcours à l'autre, mais restent rarement formulées à voix haute. Une matinée d'échanges a suffi pour faire apparaître trois obstacles récurrents.",
      },
      { type: "h2", text: "L'accès à l'information" },
      {
        type: "p",
        text: "Les participantes ont décrit un même moment de blocage : celui où l'on sait que le secteur recrute, sans savoir par où entrer. Les filières existent, les formations aussi, mais l'information circule surtout dans des réseaux auxquels elles n'ont pas accès.",
      },
      {
        type: "quote",
        text: "« On ne manque pas de motivation. On manque de gens qui nous disent que c'est possible. »",
      },
      { type: "h2", text: "La suite" },
      {
        type: "p",
        text: "GLab Sisters ouvre une communauté de pratique mensuelle et un cycle de mentorat dédié. Les candidatures sont ouvertes en continu.",
      },
    ],
    cta: {
      title: "Rejoindre GLab Sisters",
      text: "Candidatures ouvertes en continu.",
      label: "Candidater",
      to: "/candidature/glab-sisters",
    },
  },
  {
    slug: "discussion-techsisters",
    date: "10 août 2026",
    category: "GLab Sisters",
    title: "Discussion entre #TechSisters",
    excerpt:
      "GLab Sisters : de la discussion à l'action collective pour renforcer la place des femmes dans la tech.",
    readingTime: "3 min de lecture",
    photoLabel: "Photo — discussion TechSisters",
    body: [
      {
        type: "p",
        text: "Dans le cadre du programme GLab Sisters, Gehmit organise une table ronde réunissant des femmes leaders de communautés tech, des étudiantes, des professionnelles et des partenaires.",
      },
      {
        type: "p",
        text: "L'objectif : passer de la discussion à l'action collective, avec des pistes concrètes pour renforcer la place des femmes dans la tech au Cameroun.",
      },
    ],
    cta: {
      title: "Rejoindre GLab Sisters",
      text: "Candidatures ouvertes en continu.",
      label: "Candidater",
      to: "/candidature/glab-sisters",
    },
  },
  {
    slug: "partage-ton-histoire",
    date: "22 mai 2026",
    category: "Témoignages",
    title: "Partage ton histoire dans la tech",
    excerpt:
      "Un appel à témoignages pour documenter les parcours réels d'entrée dans le numérique.",
    readingTime: "2 min de lecture",
    photoLabel: "Photo — témoignage",
    body: [
      {
        type: "p",
        text: "Chaque parcours dans le numérique est différent, et c'est précisément ce qui les rend utiles. Gehmit collecte les histoires de celles et ceux qui sont entrés dans le secteur, par tous les chemins.",
      },
      {
        type: "p",
        text: "Les témoignages recueillis alimentent le blog et les séances d'orientation du programme.",
      },
    ],
  },
  {
    slug: "seminaire-orientation",
    date: "16 avril 2026",
    category: "Événements",
    title: "Retour sur le séminaire d'orientation",
    excerpt:
      "« De la recherche à l'innovation » : l'IA comme levier de développement, cinq intervenants.",
    readingTime: "5 min de lecture",
    photoLabel: "Photo — séminaire",
    body: [
      {
        type: "p",
        text: "Le séminaire « De la recherche à l'innovation » a réuni cent vingt participants autour de cinq intervenants, pour discuter du rôle de l'intelligence artificielle comme levier de développement.",
      },
      {
        type: "p",
        text: "Les échanges ont porté sur les compétences concrètes à acquérir et sur les passerelles entre recherche, formation et emploi.",
      },
    ],
  },
]

/** Filtres du blog : dérivés des catégories réellement utilisées par les articles. */
export function blogCategories(): string[] {
  return ["Tous", ...new Set(articles.map((a) => a.category).filter(Boolean))]
}

export interface FaqItem {
  q: string
  a: string
}

export const faq: FaqItem[] = [
  {
    q: "Les programmes sont-ils payants ?",
    a: "La plupart des programmes sont gratuits. Certaines formations ont un tarif affiché dans le catalogue, jamais plus de 25 000 FCFA.",
  },
  {
    q: "Faut-il un diplôme pour candidater ?",
    a: "Non. Chaque programme a ses propres conditions, indiquées sur sa page. Aucun n'exige un diplôme spécifique.",
  },
  {
    q: "Puis-je devenir mentor ?",
    a: "Oui, si vous avez plus de dix ans d'expérience dans un métier du numérique. Écrivez-nous via le formulaire de contact.",
  },
]

export interface Partner {
  name: string
  description?: string
  /** URL du logo (médiathèque). Vide = le nom seul est affiché. */
  logoUrl?: string
}

/** Partenaires réels, fournis par l'API (aucun repli fictif). */
export const partners: Partner[] = []

export const stats = [
  { value: "200+", label: "Étudiants encadrés" },
  { value: "20+", label: "Reconversions" },
  { value: "100+", label: "Stages et emplois" },
  { value: "50+", label: "Formations", gold: true },
]

export interface Achievement {
  date: string
  title: string
  text: string
  figure: string
}

export const achievements: Achievement[] = [
  {
    date: "Sept. 2025",
    title: "Séminaire « De la recherche à l'innovation »",
    text: "IA comme levier de développement, cinq intervenants.",
    figure: "120 participants",
  },
  {
    date: "Juillet 2026",
    title: "Lancement de GLab Sisters",
    text: "Programme dédié aux femmes dans le numérique.",
    figure: "40 participantes",
  },
  {
    date: "Août 2026",
    title: "Table ronde #TechSisters",
    text: "Défis des femmes dans la tech et solutions collectives.",
    figure: "18 intervenantes",
  },
]

export interface ContactInfo {
  email: string
  phone: string
  city: string
}

export const contact: ContactInfo = {
  email: "info.gehmit@gmail.com",
  phone: "+237 671 13 02 66",
  city: "Douala, Cameroun",
}

/** URL de l'outil TechPath (application externe existante). */
export const techpathUrl = "https://techpath.gehmit.org"

/** Lien WhatsApp direct (wa.me). */
export const whatsappUrl = "https://wa.me/237671130266"

/** Statut d'un programme, seule partie de sa fiche administrable. */
export interface ProgramStatusUpdate {
  slug: string
  status?: ProgramStatus
  statusLabel?: string
}

/**
 * Applique le contenu dynamique renvoyé par GET /api/public/content. Le reste du
 * site (textes, programmes, FAQ, chiffres…) est statique et vit dans ce fichier.
 * Les entrées absentes ou vides sont ignorées : le contenu embarqué sert de repli.
 */
export function applyRemoteContent(c: {
  programs?: ProgramStatusUpdate[]
  formations?: Formation[]
  articles?: Article[]
  partners?: Partner[]
}) {
  const replace = <T,>(arr: T[], next: T[] | undefined) => {
    if (Array.isArray(next) && next.length > 0) arr.splice(0, arr.length, ...next)
  }
  for (const update of c.programs ?? []) {
    const program = programs.find((p) => p.slug === update.slug)
    if (program && update.status) {
      program.status = update.status
      if (update.statusLabel) program.statusLabel = update.statusLabel
      program.primaryCta.disabled = update.status === "closed" || update.status === "archived"
    }
  }
  replace(formations, c.formations)
  replace(articles, c.articles)
  replace(partners, c.partners)
}
