import { CrudPage, StatusBadge, type CrudConfig } from "@/components/admin/crud-page"
import type { ContentItem } from "@/lib/types"

const statusField = {
  name: "status",
  label: "Statut",
  kind: "select" as const,
  options: ["open", "soon", "closed", "archived"],
}

const programsConfig: CrudConfig = {
  type: "programs",
  title: "Programmes",
  description: "Les programmes affichés sur /programmes et la page d'accueil.",
  hasSlug: true,
  columns: [
    { key: "name", label: "Nom" },
    { key: "slug", label: "Slug", render: (i) => String(i.payload.slug ?? i.slug ?? "—") },
    { key: "status", label: "Statut", render: (i) => <StatusBadge value={i.payload.status} /> },
    { key: "statusLabel", label: "Libellé" },
  ],
  fields: [
    { name: "name", label: "Nom" },
    statusField,
    { name: "statusLabel", label: "Libellé du statut" },
    { name: "cardDescription", label: "Description (carte)", kind: "textarea" },
    { name: "cardLink", label: "Libellé du lien (carte)" },
    { name: "description", label: "Description longue", kind: "textarea" },
    { name: "meta", label: "Métadonnées", kind: "tags", hint: "Ex. 6 mois, Gratuit, Douala" },
    {
      name: "primaryCta",
      label: "Bouton principal",
      kind: "linkCta",
    },
    { name: "secondaryCta", label: "Bouton secondaire", kind: "linkCta" },
    {
      name: "detail",
      label: "Page détail",
      kind: "programDetail",
    },
  ],
}

const formationsConfig: CrudConfig = {
  type: "formations",
  title: "Formations",
  description: "Le catalogue affiché sur /formations.",
  columns: [
    { key: "name", label: "Nom" },
    { key: "category", label: "Catégorie" },
    { key: "session", label: "Session" },
    { key: "price", label: "Tarif" },
    { key: "status", label: "Statut", render: (i) => <StatusBadge value={i.payload.status} /> },
  ],
  fields: [
    { name: "name", label: "Nom" },
    {
      name: "category",
      label: "Catégorie",
      kind: "select",
      options: ["Data", "Développement", "IA", "Cybersécurité"],
    },
    { name: "session", label: "Session", placeholder: "Ex. 14 sept. 2026" },
    { name: "duration", label: "Durée", placeholder: "Ex. 4 semaines" },
    { name: "format", label: "Format", kind: "select", options: ["En ligne", "Douala"] },
    { name: "price", label: "Tarif", placeholder: "Ex. Gratuit, 25 000 FCFA" },
    statusField,
    { name: "statusLabel", label: "Libellé du statut" },
  ],
}

const calendarConfig: CrudConfig = {
  type: "calendar-rows",
  title: "Calendrier des sessions",
  description: "Le tableau des sessions affiché sur /formations (4 colonnes de mois).",
  columns: [
    { key: "name", label: "Formation" },
    {
      key: "months",
      label: "Sessions",
      render: (i) => (Array.isArray(i.payload.months) ? i.payload.months.filter(Boolean).join(" · ") : "—"),
    },
  ],
  fields: [
    { name: "name", label: "Formation" },
    {
      name: "months",
      label: "Sessions (4 colonnes)",
      kind: "tags",
      keepEmpty: true,
      hint: "4 valeurs séparées par des virgules ; laisser vide pour une case vide",
    },
    { name: "tone", label: "Ton", kind: "select", options: ["gehmit", "soon"] },
  ],
}

const articlesConfig: CrudConfig = {
  type: "articles",
  title: "Articles",
  description: "Les articles du blog.",
  hasSlug: true,
  columns: [
    { key: "title", label: "Titre" },
    { key: "category", label: "Catégorie" },
    { key: "date", label: "Date" },
    {
      key: "featured",
      label: "À la une",
      render: (i: ContentItem) => (i.payload.featured ? <StatusBadge value="open" /> : "—"),
    },
  ],
  fields: [
    { name: "title", label: "Titre" },
    { name: "category", label: "Catégorie" },
    { name: "date", label: "Date", placeholder: "Ex. 29 juillet 2026" },
    { name: "excerpt", label: "Résumé", kind: "textarea" },
    { name: "readingTime", label: "Temps de lecture", placeholder: "Ex. 4 min de lecture" },
    { name: "featured", label: "Mettre à la une", kind: "checkbox" },
    {
      name: "imageUrl",
      label: "Image de couverture",
      kind: "image",
      hint: "Affichée en haut de l'article. Vide = visuel par défaut.",
    },
    { name: "photoLabel", label: "Libellé de la photo", hint: "Texte affiché si aucune image n'est choisie" },
    {
      name: "body",
      label: "Corps de l'article",
      kind: "blocks",
    },
    { name: "cta", label: "Encart CTA", kind: "articleCta" },
  ],
}

const faqConfig: CrudConfig = {
  type: "faq",
  title: "FAQ",
  description: "Les questions affichées sur /contact.",
  columns: [
    { key: "q", label: "Question", render: (i) => String(i.payload.q ?? "—") },
  ],
  itemLabel: (i) => String(i.payload.q ?? i.id),
  fields: [
    { name: "q", label: "Question" },
    { name: "a", label: "Réponse", kind: "textarea" },
  ],
}

const partnersConfig: CrudConfig = {
  type: "partners",
  title: "Partenaires",
  description: "Les partenaires affichés sur l'accueil et /partenaire.",
  columns: [
    { key: "name", label: "Nom" },
    {
      key: "logoUrl",
      label: "Logo",
      render: (i) =>
        i.payload.logoUrl ? <StatusBadge value="open" /> : "—",
    },
  ],
  fields: [
    { name: "name", label: "Nom du partenaire" },
    {
      name: "description",
      label: "Description",
      kind: "textarea",
      hint: "Une phrase sur le partenariat (affichée sur /partenaire).",
    },
    {
      name: "logoUrl",
      label: "Logo / image",
      kind: "image",
      hint: "Depuis la médiathèque ou votre machine. Vide = le nom seul est affiché.",
    },
  ],
}

const statsConfig: CrudConfig = {
  type: "stats",
  title: "Statistiques",
  description: "Les chiffres clés de la page d'accueil.",
  columns: [
    { key: "value", label: "Valeur" },
    { key: "label", label: "Libellé" },
  ],
  fields: [
    { name: "value", label: "Valeur", placeholder: "Ex. 200+" },
    { name: "label", label: "Libellé", placeholder: "Ex. Étudiants encadrés" },
    { name: "gold", label: "Mettre en avant (or)", kind: "checkbox" },
  ],
}

const achievementsConfig: CrudConfig = {
  type: "achievements",
  title: "Réalisations",
  description: "La chronologie de la page /notre-impact.",
  columns: [
    { key: "date", label: "Date" },
    { key: "title", label: "Titre" },
    { key: "figure", label: "Chiffre" },
  ],
  fields: [
    { name: "date", label: "Date", placeholder: "Ex. Sept. 2025" },
    { name: "title", label: "Titre" },
    { name: "text", label: "Description", kind: "textarea" },
    { name: "figure", label: "Chiffre", placeholder: "Ex. 120 participants" },
  ],
}

export function ProgramsPage() {
  return <CrudPage config={programsConfig} />
}
export function FormationsPage() {
  return <CrudPage config={formationsConfig} />
}
export function CalendarPage() {
  return <CrudPage config={calendarConfig} />
}
export function ArticlesPage() {
  return <CrudPage config={articlesConfig} />
}
export function FaqPage() {
  return <CrudPage config={faqConfig} />
}
export function PartnersPage() {
  return <CrudPage config={partnersConfig} />
}
export function StatsPage() {
  return <CrudPage config={statsConfig} />
}
export function AchievementsPage() {
  return <CrudPage config={achievementsConfig} />
}
