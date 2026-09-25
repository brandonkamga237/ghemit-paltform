import { useEffect, useState } from "react"
import type { Candidature, CandidatureStatus } from "@/lib/types"

// ─── Référentiels d'affichage partagés (candidatures & messages) ─────────────

export const PROGRAM_LABELS: Record<string, string> = {
  paei: "PAEI",
  mentorat: "Mentorat",
  "glab-sisters": "GLab Sisters",
  stage: "Stage",
  formations: "Formations",
  "junior-builders": "Junior Builders",
  "louer-developpeur": "Louer un développeur",
  "caravanes-jeune": "Caravanes — jeune",
  "caravanes-entreprise": "Caravanes — entreprise",
  "rencontre-challenge": "Rencontre Challenge",
}

export interface OriginGroup {
  value: string
  label: string
  programs: string[]
}

export const ORIGIN_GROUPS: OriginGroup[] = [
  {
    value: "programmes",
    label: "Programmes",
    programs: ["paei", "mentorat", "glab-sisters", "stage", "formations"],
  },
  { value: "junior-builders", label: "Junior Builders", programs: ["junior-builders"] },
  { value: "louer-developpeur", label: "Louer un développeur", programs: ["louer-developpeur"] },
  {
    value: "caravanes",
    label: "Caravanes",
    programs: ["caravanes-jeune", "caravanes-entreprise"],
  },
  { value: "rencontre-challenge", label: "Rencontre Challenge", programs: ["rencontre-challenge"] },
]

export const STATUS_META: Record<CandidatureStatus, { label: string; cls: string }> = {
  new: { label: "Nouvelle", cls: "bg-blue-100 text-blue-800" },
  in_progress: { label: "En cours", cls: "bg-amber-100 text-amber-800" },
  accepted: { label: "Retenue", cls: "bg-green-100 text-green-800" },
  rejected: { label: "Non retenue", cls: "bg-red-100 text-red-700" },
  archived: { label: "Archivée", cls: "bg-gray-100 text-gray-600" },
}

export const STATUS_ORDER: CandidatureStatus[] = [
  "new",
  "in_progress",
  "accepted",
  "rejected",
  "archived",
]

export const FIELD_LABELS: Record<string, string> = {
  prenom: "Prénom",
  nom: "Nom",
  email: "E-mail",
  telephone: "Téléphone",
  phone: "Téléphone",
  organisation: "Organisation",
  entreprise: "Entreprise",
  interlocuteur: "Interlocuteur",
  message: "Message",
  motivation: "Motivation",
  domaine: "Domaine",
  disponibilite: "Disponibilité",
  cv: "CV (fichier)",
  cvUrl: "CV",
  ville: "Ville",
  niveau: "Niveau",
  profil: "Profil",
  besoin: "Besoin",
  role: "Rôle",
  mission: "Mission",
  budget: "Budget",
  equipe: "Équipe",
  poste: "Poste",
  experience: "Expérience",
  competences: "Compétences",
  secteur: "Secteur",
  participants: "Participants",
  projet: "Projet",
  lien: "Lien",
  portfolio: "Portfolio",
  urgence: "Urgence",
  duree: "Durée",
  autre: "Autre",
}

export const programLabel = (p: string) => PROGRAM_LABELS[p] ?? p

export const fieldLabel = (k: string) =>
  FIELD_LABELS[k] ?? k.replace(/[_-]/g, " ").replace(/^./, (c) => c.toUpperCase())

export const candidateName = (c: Candidature) =>
  [c.form.prenom, c.form.nom].filter(Boolean).join(" ").trim() ||
  String(c.form.interlocuteur ?? c.form.organisation ?? "—")

export const candidateEmail = (c: Candidature) => String(c.form.email ?? "")

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

/** Recherche avec délai (évite un appel API par frappe). */
export function useDebounced<T>(value: T, delay = 350): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}
