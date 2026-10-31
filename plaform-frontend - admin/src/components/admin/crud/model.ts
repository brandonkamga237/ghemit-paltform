/**
 * Modèle des écrans de contenu génériques : description des champs et des
 * colonnes (`CrudConfig`), et conversion entre les données de l'API
 * (`payload`) et l'état éditable du formulaire (`Draft`).
 */
import type { ReactNode } from "react"
import type { ContentItem } from "@/lib/types"

/** Libellés français des codes stockés (statuts, états). */
const VALUE_LABELS: Record<string, string> = {
  open: "Ouvert",
  soon: "Bientôt",
  closed: "Fermé",
  archived: "Archivé",
  scheduled: "Prévu",
  cancelled: "Annulé",
  published: "Publié",
  draft: "Brouillon",
}
export const valueLabel = (v: string) => VALUE_LABELS[v] ?? v

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "select"
  | "tags"
  | "image"

export interface FieldDef {
  name: string
  label: string
  kind?: FieldKind
  options?: string[]
  placeholder?: string
  hint?: string
  required?: boolean
  /** Longueur maximale (texte) : au-delà, la mise en page du site se dégrade. */
  maxLength?: number
  /** Contrôle avant enregistrement ; renvoie le message d'erreur, ou null. */
  validate?: (value: string) => string | null
}

/** Aide du champ, complétée par le compteur quand une longueur maximale existe. */
export const hintOf = (field: FieldDef, value: unknown) =>
  field.maxLength
    ? [field.hint, `${String(value ?? "").length} / ${field.maxLength} caractères`].filter(Boolean).join(" · ")
    : field.hint

export interface ColumnDef {
  key: string
  label: string
  render?: (item: ContentItem) => ReactNode
}

export interface CrudConfig {
  /** segment d'URL de l'API : programs, articles, settings… */
  type: string
  title: string
  description?: string
  hasSlug?: boolean
  columns: ColumnDef[]
  fields: FieldDef[]
  itemLabel?: (item: ContentItem) => string
  /** Liste fixe définie par le site : ni création, ni suppression, ni ordre. */
  fixedItems?: boolean
}

export type Draft = Record<string, unknown>

export function toDraft(fields: FieldDef[], payload: Record<string, unknown>): Draft {
  const draft: Draft = {}
  for (const f of fields) {
    const v = payload[f.name]
    switch (f.kind ?? "text") {
      case "checkbox":
        draft[f.name] = Boolean(v)
        break
      case "number":
        draft[f.name] = typeof v === "number" ? v : 0
        break
      case "tags":
        draft[f.name] = Array.isArray(v) ? v.join(", ") : ""
        break
      case "image":
        draft[f.name] = v === undefined || v === null ? "" : String(v)
        break
      default:
        draft[f.name] = v === undefined || v === null ? "" : String(v)
    }
  }
  return draft
}

export function toPayload(fields: FieldDef[], draft: Draft): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  for (const f of fields) {
    const raw = draft[f.name]
    switch (f.kind ?? "text") {
      case "checkbox":
        payload[f.name] = Boolean(raw)
        break
      case "number":
        payload[f.name] = Number(raw ?? 0)
        break
      case "tags": {
        const parts = String(raw ?? "")
          .split(",")
          .map((s) => s.trim())
        payload[f.name] = parts.filter(Boolean)
        break
      }
      case "image": {
        const s = String(raw ?? "").trim()
        payload[f.name] = s === "" ? undefined : s
        break
      }
      default:
        payload[f.name] = String(raw ?? "")
    }
  }
  return payload
}

/** Libellé d'un élément dans les titres et confirmations. */
export const itemLabel = (config: CrudConfig, item: ContentItem) =>
  config.itemLabel?.(item) ??
  (item.payload.name as string | undefined) ??
  (item.payload.title as string | undefined) ??
  item.slug ??
  item.id
