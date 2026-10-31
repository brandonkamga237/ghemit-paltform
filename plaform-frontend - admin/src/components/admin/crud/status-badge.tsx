import { Badge } from "@gehmit/ui/components/badge"
import { valueLabel } from "./model"

/** Pastille d'un statut de contenu (ouvert, publié, brouillon…). */
export function StatusBadge({ value }: { value: unknown }) {
  const v = String(value ?? "")
  const variant =
    v === "open" || v === "scheduled" || v === "published" ? "default" : v === "soon" ? "secondary" : "outline"
  return <Badge variant={variant}>{valueLabel(v) || "—"}</Badge>
}
