import { CrudPage, StatusBadge, type CrudConfig } from "@/components/admin/crud-page"
import { Badge } from "@/components/ui/badge"
import type { ContentItem } from "@/lib/types"

const statusField = {
  name: "status",
  label: "Statut",
  kind: "select" as const,
  options: ["open", "soon", "closed", "archived"],
}

/** Noms des programmes : la fiche complète est statique dans le site public. */
const PROGRAM_NAMES: Record<string, string> = {
  paei: "PAEI",
  mentorat: "Mentorat",
  formations: "Formations",
  stage: "Stage",
  "glab-sisters": "GLab Sisters",
}

const programsConfig: CrudConfig = {
  type: "programs",
  title: "Programmes",
  description:
    "Ouverture des candidatures. Les textes des fiches programmes sont gérés dans le code du site.",
  fixedItems: true,
  columns: [
    { key: "name", label: "Programme", render: (i) => PROGRAM_NAMES[i.slug ?? ""] ?? i.slug ?? "—" },
    { key: "status", label: "Statut", render: (i) => <StatusBadge value={i.payload.status} /> },
    { key: "statusLabel", label: "Libellé affiché" },
  ],
  itemLabel: (i) => PROGRAM_NAMES[i.slug ?? ""] ?? i.slug ?? i.id,
  fields: [
    statusField,
    {
      name: "statusLabel",
      label: "Libellé affiché",
      placeholder: "Ex. Candidatures ouvertes, Clôture le 30 sept.",
      hint: "« closed » ou « archived » désactive le bouton Candidater.",
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

const articlesConfig: CrudConfig = {
  type: "articles",
  title: "Articles",
  description: "Les articles du blog. Un brouillon n'est jamais visible sur le site.",
  hasSlug: true,
  columns: [
    { key: "title", label: "Titre" },
    { key: "category", label: "Catégorie" },
    { key: "publishedAt", label: "Publication" },
    {
      key: "status",
      label: "Statut",
      render: (i: ContentItem) =>
        i.payload.status === "draft" ? (
          <Badge variant="outline">Brouillon</Badge>
        ) : (
          <Badge>Publié</Badge>
        ),
    },
    {
      key: "featured",
      label: "À la une",
      render: (i: ContentItem) => (i.payload.featured ? <Badge variant="secondary">Une</Badge> : "—"),
    },
  ],
  fields: [
    { name: "title", label: "Titre" },
    { name: "category", label: "Catégorie" },
    {
      name: "status",
      label: "Statut",
      kind: "select",
      options: ["published", "draft"],
      hint: "« draft » = brouillon, invisible sur le site.",
    },
    {
      name: "publishedAt",
      label: "Date de publication",
      placeholder: "AAAA-MM-JJ",
      hint: "Format ISO, ex. 2026-08-10. Détermine l'ordre d'affichage.",
    },
    { name: "excerpt", label: "Résumé", kind: "textarea" },
    { name: "featured", label: "Mettre à la une", kind: "checkbox" },
    {
      name: "imageUrl",
      label: "Image de couverture",
      kind: "image",
      hint: "Affichée en haut de l'article et sur les cartes.",
    },
    { name: "imageAlt", label: "Texte alternatif de la couverture", placeholder: "Description courte pour l'accessibilité" },
    {
      name: "body",
      label: "Corps de l'article",
      kind: "blocks",
    },
    { name: "cta", label: "Encart CTA", kind: "articleCta" },
  ],
}

const eventsConfig: CrudConfig = {
  type: "events",
  title: "Événements",
  description:
    "Agenda affiché sur /evenements. Passée, la date bascule l'événement dans « Passés » automatiquement.",
  hasSlug: true,
  columns: [
    { key: "title", label: "Événement" },
    { key: "date", label: "Date" },
    { key: "location", label: "Lieu" },
    {
      key: "status",
      label: "Statut",
      render: (i: ContentItem) =>
        i.payload.status === "cancelled" ? (
          <Badge variant="outline">Annulé</Badge>
        ) : (
          <Badge>Prévu</Badge>
        ),
    },
  ],
  fields: [
    { name: "title", label: "Titre" },
    {
      name: "date",
      label: "Date",
      placeholder: "AAAA-MM-JJ",
      hint: "Format ISO, ex. 2026-11-14.",
    },
    { name: "time", label: "Horaire", placeholder: "Ex. 9h – 16h" },
    { name: "location", label: "Lieu", placeholder: "Ex. Douala, siège Gehmit" },
    { name: "description", label: "Description", kind: "textarea" },
    {
      name: "status",
      label: "Statut",
      kind: "select",
      options: ["scheduled", "cancelled"],
      hint: "« cancelled » = annulé, affiché avec un badge.",
    },
    {
      name: "registerUrl",
      label: "Lien d'inscription",
      placeholder: "/contact ou https://…",
      hint: "Bouton « S'inscrire » sur la carte. Vide = pas de bouton.",
    },
    {
      name: "imageUrl",
      label: "Visuel",
      kind: "image",
      hint: "Affiché sur la carte de l'événement. Vide = pas d'image.",
    },
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

export function ProgramsPage() {
  return <CrudPage config={programsConfig} />
}
export function FormationsPage() {
  return <CrudPage config={formationsConfig} />
}
export function ArticlesPage() {
  return <CrudPage config={articlesConfig} />
}
export function EventsPage() {
  return <CrudPage config={eventsConfig} />
}
export function PartnersPage() {
  return <CrudPage config={partnersConfig} />
}
