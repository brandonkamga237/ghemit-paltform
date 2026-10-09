/**
 * Jeux de données de développement pour éprouver les pages publiques
 * (« break-ui »). Jamais chargé en production : importé dynamiquement derrière
 * `import.meta.env.DEV`. Le contenu éditorial n'a aucune limite de longueur côté
 * API (payload jsonb libre) : les valeurs « pire cas » sont longues mais
 * plausibles, pas aléatoires.
 */
import type { RemoteContent } from "@/data/remote"
import type { Article, ArticleSummary, EventItem, Formation, Partner } from "@/data/content"

export type DevDataset = "demo" | "worst" | "empty" | "one"

const img = (path: string) => `${window.location.origin}${path}`
const inDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10)

// ─── Démo : données « gentilles », celles contre lesquelles le site a été dessiné ──

const demoArticles: ArticleSummary[] = [
  { slug: "choisir-sa-formation", title: "Choisir sa première formation dans la data", excerpt: "Trois questions à se poser avant de s'inscrire.", category: "Orientation", publishedAt: "2026-09-18", readingMinutes: 5, featured: true, imageUrl: img("/og-image.jpg"), imageAlt: "Séminaire Gehmit" },
  { slug: "techsisters", title: "Retour sur la table ronde #TechSisters", excerpt: "Ce que les intervenantes ont partagé.", category: "Événement", publishedAt: "2026-08-30", readingMinutes: 4, imageUrl: img("/og-image.jpg") },
  { slug: "mentorat", title: "Ce qu'apporte un mentor", excerpt: "Trois mois pour avancer plus vite.", category: "Mentorat", publishedAt: "2026-08-02", readingMinutes: 3 },
]

const demoEvents: EventItem[] = [
  { title: "Caravane chez un partenaire", date: inDays(12), time: "14h – 17h", location: "Douala", upcoming: true },
  { title: "Atelier CV et portfolio", date: inDays(30), time: "10h – 12h", location: "En ligne", upcoming: true, registerUrl: "/contact" },
  { title: "Séminaire de rentrée", date: inDays(-40), location: "Douala", upcoming: false },
]

const demoFormations: Formation[] = [
  { name: "Initiation à la data", category: "Data", session: "14 sept. 2026", duration: "4 semaines", format: "En ligne", price: "Gratuit", status: "open", statusLabel: "Inscriptions ouvertes" },
  { name: "React pour débuter", category: "Développement", session: "5 oct. 2026", duration: "6 semaines", format: "Douala", price: "15 000 FCFA", status: "soon", statusLabel: "Bientôt" },
]

const demoPartners: Partner[] = [{ name: "Partenaire A" }, { name: "Partenaire B" }, { name: "Partenaire C" }]

// ─── Pire cas : ce que l'équipe saisira tôt ou tard ──────────────────────────────

const worstArticles: ArticleSummary[] = [
  {
    slug: "reconversion-comptabilite-data",
    title:
      "Reconversion à 34 ans : comment Marie-Thérèse Nguimfack-Essomba est passée de la comptabilité à l'analyse de données en dix-huit mois, sans quitter Douala",
    excerpt:
      "Après douze ans dans un cabinet comptable de Bonanjo, elle a suivi le PAEI, trois formations courtes et un mentorat de trois mois. Elle raconte les soirées de révision, les refus, le premier entretien technique raté, puis le stage qui a tout changé — et ce qu'elle conseillerait à celles et ceux qui hésitent encore à franchir le pas.",
    category: "Témoignages & retours d'expérience",
    publishedAt: "2026-10-02",
    readingMinutes: 47,
    featured: true,
    imageUrl: img("/apple-touch-icon.png"),
    imageAlt: "",
  },
  {
    slug: "statistiques",
    title: "https://www.data.gouv.cm/fr/datasets/statistiques-enseignement-superieur-2024-2025",
    excerpt: "",
    category: "Données",
    publishedAt: "2026-09-27",
    readingMinutes: 1,
    imageUrl: "/api/public/media/image-supprimee-de-la-mediatheque.jpg",
  },
  {
    slug: "ancien-format",
    title: "Gehmit à la Foire",
    excerpt: "Article importé de l'ancien site WordPress, sans date ISO ni image.",
    category: "",
    date: "Septembre 2025",
    photoLabel: "Photo de la foire",
    readingMinutes: 2,
  },
  ...["Orientation", "IA", "Cybersécurité", "Événement", "Mentorat", "Partenariats", "Vie de l'association"].map((category, i) => ({
    slug: `article-${i}`,
    title: `Article de la rubrique ${category} n° ${i + 1}`,
    excerpt: "Résumé ordinaire.",
    category,
    publishedAt: `2026-0${(i % 8) + 1}-1${i}`,
    readingMinutes: 6,
  })),
]

const worstEvents: EventItem[] = [
  {
    title:
      "Forum régional de l'orientation numérique et de l'entrepreneuriat des jeunes du Littoral — 3ᵉ édition, en partenariat avec l'Université de Douala",
    date: inDays(3),
    time: "8h30 – 17h00 (accueil dès 7h45, déjeuner offert aux inscrits)",
    location: "Institut universitaire de la Côte, campus de Ndogbong, amphithéâtre 600 (bâtiment B, 2ᵉ étage)",
    description:
      "Une journée complète : conférences sur les métiers de la data et de la cybersécurité, ateliers CV animés par des recruteurs, stands des écoles partenaires et session de mentorat express. Pensez à apporter plusieurs exemplaires imprimés de votre CV ainsi qu'une pièce d'identité pour l'accès au campus. Les places pour les ateliers sont limitées et attribuées par ordre d'inscription.",
    registerUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf8xYzZ3kq9Wm2bT4rVcN7pLh0aEoUjKdGsB5iQyR6wXtM1/viewform?usp=sf_link",
    imageUrl: img("/apple-touch-icon.png"),
    upcoming: true,
  },
  { title: "Atelier", date: inDays(9), upcoming: true },
  {
    title: "Table ronde #TechSisters — reportée",
    date: inDays(15),
    time: "15h",
    location: "En ligne",
    status: "cancelled",
    cancelled: true,
    registerUrl: "/contact",
    upcoming: true,
  },
  { title: "Caravane", date: "date-invalide", location: "Douala", upcoming: true },
  ...Array.from({ length: 14 }, (_, i) => ({
    title: `Rencontre mensuelle GLab Sisters n° ${14 - i}`,
    date: inDays(-30 * (i + 1)),
    location: i % 3 ? "Douala, siège Gehmit, salle de réunion du 1ᵉʳ étage" : undefined,
    upcoming: false,
  })),
]

const worstFormations: Formation[] = [
  { name: "Analyse de données avec Python, Pandas et Power BI pour les métiers de la santé publique", category: "Data", session: "Du 14 sept. au 23 nov. 2026 (samedis matin)", duration: "10 semaines, 3 h par séance", format: "Douala", price: "Gratuit pour les participants du PAEI, 25 000 FCFA sinon", status: "open", statusLabel: "Inscriptions ouvertes" },
  { name: "IA", category: "IA", session: "—", duration: "1 jour", format: "En ligne", price: "0", status: "closed", statusLabel: "Inscriptions closes – liste d'attente ouverte jusqu'à la prochaine session" },
  { name: "Sécurité des applications web : OWASP Top 10, authentification et gestion des secrets", category: "Cybersécurité", session: "À confirmer", duration: "8 semaines", format: "En ligne", price: "10 000 FCFA", status: "soon", statusLabel: "Prochaine session annoncée en janvier" },
]

const worstPartners: Partner[] = [
  { name: "Programme des Nations unies pour le développement (PNUD) — Cameroun", description: "Appui au programme PAEI." },
  { name: "BBit", logoUrl: "/api/public/media/logo-qui-n-existe-plus.png" },
  { name: "Orange Digital Center" , logoUrl: img("/apple-touch-icon.png") },
  ...Array.from({ length: 10 }, (_, i) => ({ name: `Entreprise partenaire ${i + 1}` })),
]

const worstPrograms = [
  { slug: "paei", status: "open" as const, statusLabel: "Candidatures ouvertes jusqu'au 30 septembre 2026 à minuit (heure de Douala)" },
  { slug: "mentorat", status: "archived" as const, statusLabel: "Programme archivé" },
  { slug: "stage", status: "soon" as const, statusLabel: "Réouverture en janvier 2027" },
]

// ─── Un seul : chaque compteur à 1 ───────────────────────────────────────────────

export function devContent(set: DevDataset): RemoteContent {
  switch (set) {
    case "worst":
      return { articles: worstArticles, events: worstEvents, formations: worstFormations, partners: worstPartners, programs: worstPrograms }
    case "empty":
      return { articles: [], events: [], formations: [], partners: [], programs: [] }
    case "one":
      return { articles: demoArticles.slice(0, 1), events: demoEvents.slice(0, 1), formations: demoFormations.slice(0, 1), partners: demoPartners.slice(0, 1) }
    default:
      return { articles: demoArticles, events: demoEvents, formations: demoFormations, partners: demoPartners }
  }
}

/** Corps complet d'un article, pour la page /blog/:slug. */
export function devArticle(set: DevDataset, slug: string): Article | null {
  const summaries = devContent(set).articles ?? []
  const summary = summaries.find((a) => a.slug === slug)
  if (!summary) return null
  if (set !== "worst") {
    return { ...summary, body: [{ type: "p", text: "Paragraphe de démonstration, d'une longueur ordinaire." }] }
  }
  return {
    ...summary,
    body: [
      { type: "p", text: "Les chiffres viennent de https://www.data.gouv.cm/fr/datasets/statistiques-de-l-enseignement-superieur-2024-2025-par-region-et-par-filiere-detaillee/ et ont été recoupés avec l'équipe." },
      { type: "h2", text: "Ce que disent les données sur l'insertion des diplômés des filières informatiques au Cameroun entre 2019 et 2025" },
      { type: "table", text: "Filière | 2019 | 2020 | 2021 | 2022 | 2023 | 2024\nInformatique de gestion | 1 204 | 1 311 | 1 405 | 1 562 | 1 698 | 1 840\nRéseaux et télécommunications | 812 | 845 | 903 | 961 | 1 020 | 1 112", caption: "Effectifs diplômés par année (source : ministère de l'Enseignement supérieur)" },
      { type: "code", text: "SELECT region, filiere, COUNT(*) AS diplomes, AVG(delai_insertion_mois) AS delai_moyen FROM insertion WHERE annee BETWEEN 2019 AND 2025 GROUP BY region, filiere ORDER BY delai_moyen DESC;" },
      { type: "quote", text: "Je n'avais jamais écrit une ligne de code. Aujourd'hui, c'est moi qui forme les nouveaux arrivants de l'équipe, et je me demande encore comment c'est arrivé.", cite: "Marie-Thérèse Nguimfack-Essomba, analyste de données, promotion PAEI 2024" },
      { type: "ul", text: "Un ordinateur portable, même ancien\nUne connexion stable au moins deux soirs par semaine — idéalement davantage pendant les semaines de projet\nDe la patience" },
      { type: "image", url: "/api/public/media/capture-supprimee.png", text: "Capture d'écran du tableau de bord réalisé pendant le stage (image retirée de la médiathèque)" },
      { type: "callout", text: "Les candidatures au PAEI 2027 ouvrent en janvier : inscrivez-vous à la lettre mensuelle pour être prévenu·e.", tone: "warning" },
      { type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", text: "Entretien filmé (12 min)" },
    ],
    cta: { title: "Vous voulez suivre le même chemin ?", text: "Le PAEI accompagne pendant six mois les jeunes diplômés et les personnes en reconversion vers les métiers du numérique.", label: "Découvrir le programme d'appui à l'employabilité et à l'insertion", to: "/programmes/paei" },
  }
}
