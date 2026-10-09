import { useCallback, useEffect, useState, type ReactNode } from "react"
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { api } from "@/lib/api"
import type { ContentItem } from "@/lib/types"
import { toast } from "@/components/ui/toast"
import { ImageField } from "@/components/admin/media-picker"
import {
  BlocksField,
  ArticleCtaField,
  type ArticleCta,
  type Block,
} from "@/components/admin/structured-editors"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
const valueLabel = (v: string) => VALUE_LABELS[v] ?? v

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "select"
  | "tags"
  | "image"
  | "blocks"
  | "articleCta"

export interface FieldDef {
  name: string
  label: string
  kind?: FieldKind
  options?: string[]
  placeholder?: string
  hint?: string
  required?: boolean
}

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

type Draft = Record<string, unknown>

function toDraft(fields: FieldDef[], payload: Record<string, unknown>): Draft {
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
      case "articleCta":
        draft[f.name] =
          v && typeof v === "object" && !Array.isArray(v)
            ? structuredClone(v)
            : null
        break
      case "blocks":
        draft[f.name] = Array.isArray(v) ? structuredClone(v) : []
        break
      default:
        draft[f.name] = v === undefined || v === null ? "" : String(v)
    }
  }
  return draft
}

function toPayload(fields: FieldDef[], draft: Draft): Record<string, unknown> {
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
      case "articleCta": {
        if (!raw) {
          payload[f.name] = undefined
          break
        }
        const obj = raw as Record<string, unknown>
        // Nettoie les champs vides ; supprime la clé si tout est vide
        const cleaned = Object.fromEntries(
          Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined)
        )
        payload[f.name] = Object.keys(cleaned).length > 0 ? cleaned : undefined
        break
      }
      case "blocks": {
        const arr = (Array.isArray(raw) ? raw : []) as Block[]
        payload[f.name] = arr
          .filter((b) => {
            if (b.type === "image" || b.type === "video") return Boolean(b.url)
            if (b.type === "hr") return true
            return b.text.trim() !== ""
          })
          .map((b) => {
            const text = b.text.trim()
            if (b.type === "image" || b.type === "video") {
              return text
                ? { type: b.type, url: b.url, text }
                : { type: b.type, url: b.url }
            }
            if (b.type === "hr") {
              return { type: "hr" }
            }
            if (b.type === "table") {
              return b.caption?.trim()
                ? { type: "table", text: b.text, caption: b.caption.trim() }
                : { type: "table", text: b.text }
            }
            if (b.type === "callout") {
              return { type: "callout", text, tone: b.tone ?? "info" }
            }
            if (b.type === "quote" && b.cite?.trim()) {
              return { type: "quote", text, cite: b.cite.trim() }
            }
            return { type: b.type, text }
          })
        break
      }
      default:
        payload[f.name] = String(raw ?? "")
    }
  }
  return payload
}

export function CrudPage({ config }: { config: CrudConfig }) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [deleting, setDeleting] = useState<ContentItem | null>(null)
  const [draft, setDraft] = useState<Draft>({})
  const [slug, setSlug] = useState("")
  const [position, setPosition] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      setItems(await api.get<ContentItem[]>(`/api/admin/content/${config.type}`))
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [config.type])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const openCreate = () => {
    setEditing(null)
    setDraft(toDraft(config.fields, {}))
    setSlug("")
    setPosition(items.length)
    setFormError(null)
    setDialogOpen(true)
  }

  const openEdit = (item: ContentItem) => {
    setEditing(item)
    setDraft(toDraft(config.fields, item.payload))
    setSlug(String(item.payload.slug ?? item.slug ?? ""))
    setPosition(item.position)
    setFormError(null)
    setDialogOpen(true)
  }

  const save = async () => {
    const payload = toPayload(config.fields, draft)
    if (config.hasSlug) payload.slug = slug
    setSaving(true)
    setFormError(null)
    try {
      const body = { slug: slug || null, position, payload }
      if (editing) {
        await api.put(`/api/admin/content/${editing.id}`, body)
      } else {
        await api.post(`/api/admin/content/${config.type}`, body)
      }
      setDialogOpen(false)
      toast.add({ title: editing ? "Élément mis à jour" : "Élément créé" })
      await refresh()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Erreur d'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleting) return
    try {
      await api.del(`/api/admin/content/${deleting.id}`)
      toast.add({ title: "Élément supprimé" })
      setDeleting(null)
      await refresh()
    } catch (e) {
      toast.add({
        title: "Suppression impossible",
        description: e instanceof Error ? e.message : undefined,
      })
    }
  }

  const set = (name: string, value: unknown) =>
    setDraft((d) => ({ ...d, [name]: value }))

  const label = (item: ContentItem) =>
    config.itemLabel?.(item) ??
    (item.payload.name as string | undefined) ??
    (item.payload.title as string | undefined) ??
    item.slug ??
    item.id

  const query = q.trim().toLowerCase()
  const visible = query
    ? items.filter((i) =>
        `${JSON.stringify(i.payload)} ${i.slug ?? ""}`.toLowerCase().includes(query)
      )
    : items

  return (
    <div className="flex flex-col gap-group">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          !config.fixedItems && (
            <Button onClick={openCreate} className="gap-2">
              <PlusIcon className="size-4" />
              Nouveau
            </Button>
          )
        }
      />

      {!loadError && items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-[300px]">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Rechercher parmi ${items.length} élément${items.length > 1 ? "s" : ""}…`}
              className="pl-9"
            />
          </div>
          <span className="ml-auto text-caption text-muted-foreground">
            {visible.length} affiché{visible.length > 1 ? "s" : ""} / {items.length}
          </span>
        </div>
      )}

      {loadError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-small">
          Impossible de charger les données : {loadError}
        </div>
      ) : loading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed px-5 py-section text-center text-ink-muted">
          Aucun élément. Cliquez sur « Nouveau » pour commencer.
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-lg border border-dashed px-5 py-block text-center text-ink-muted">
          Aucun élément ne correspond à « {q} ».
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {config.columns.map((c) => (
                  <TableHead key={c.key}>{c.label}</TableHead>
                ))}
                <TableHead className="w-[110px] whitespace-nowrap">Modifié</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => openEdit(item)}
                >
                  {config.columns.map((c) => (
                    <TableCell key={c.key}>
                      {c.render
                        ? c.render(item)
                        : String(item.payload[c.key] ?? item.slug ?? "—")}
                    </TableCell>
                  ))}
                  <TableCell className="text-caption whitespace-nowrap text-ink-faint">
                    {new Date(item.updatedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item)}
                        aria-label="Modifier"
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      {!config.fixedItems && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleting(item)}
                          aria-label="Supprimer"
                        >
                          <Trash2Icon className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog création / édition */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Modifier — ${label(editing)}` : `Nouveau — ${config.title}`}
            </DialogTitle>
            <DialogDescription>
              Renseignez les champs puis enregistrez.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {!config.fixedItems && (
            <div className="grid gap-4 sm:grid-cols-2">
              {config.hasSlug && (
                <FieldWrap label="Slug" hint="Identifiant unique (URL)">
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="mon-slug"
                  />
                </FieldWrap>
              )}
              <FieldWrap label="Ordre d'affichage">
                <Input
                  type="number"
                  value={position}
                  onChange={(e) => setPosition(Number(e.target.value))}
                />
              </FieldWrap>
            </div>
            )}
            {config.fields.map((f) => (
              <FieldInput key={f.name} field={f} draft={draft} set={set} />
            ))}
            {formError && (
              <p className="text-small text-destructive">{formError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet élément ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting ? `« ${label(deleting)} » sera définitivement supprimé.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function FieldWrap({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-small font-semibold">{label}</Label>
      {children}
      {hint && <span className="text-caption text-ink-faint">{hint}</span>}
    </div>
  )
}

function FieldInput({
  field,
  draft,
  set,
}: {
  field: FieldDef
  draft: Draft
  set: (name: string, value: unknown) => void
}) {
  const kind = field.kind ?? "text"
  const value = draft[field.name]

  switch (kind) {
    case "textarea":
      return (
        <FieldWrap label={field.label} hint={field.hint}>
          <Textarea
            value={String(value ?? "")}
            onChange={(e) => set(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="min-h-[90px]"
          />
        </FieldWrap>
      )
    case "checkbox":
      return (
        <div className="flex items-center gap-2.5 pt-1">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(v) => set(field.name, v === true)}
          />
          <Label className="text-small font-semibold">{field.label}</Label>
        </div>
      )
    case "select":
      return (
        <FieldWrap label={field.label} hint={field.hint}>
          <Select
            value={String(value ?? "")}
            onValueChange={(v) => set(field.name, v)}
            items={Object.fromEntries((field.options ?? []).map((o) => [o, valueLabel(o)]))}
          >
            <SelectTrigger className="w-full justify-between">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((o) => (
                <SelectItem key={o} value={o}>
                  {valueLabel(o)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrap>
      )
    case "number":
      return (
        <FieldWrap label={field.label} hint={field.hint}>
          <Input
            type="number"
            value={Number(value ?? 0)}
            onChange={(e) => set(field.name, Number(e.target.value))}
          />
        </FieldWrap>
      )
    case "image":
      return (
        <ImageField
          value={String(value ?? "")}
          onChange={(url) => set(field.name, url)}
          label={field.label}
          hint={field.hint}
        />
      )
    case "blocks":
      return (
        <BlocksField
          value={(value as Block[]) ?? []}
          onChange={(blocks) => set(field.name, blocks)}
        />
      )
    case "articleCta":
      return (
        <ArticleCtaField
          value={(value as ArticleCta) ?? null}
          onChange={(cta) => set(field.name, cta)}
        />
      )
    default:
      return (
        <FieldWrap
          label={field.label}
          hint={field.hint ?? (kind === "tags" ? "Séparées par des virgules" : undefined)}
        >
          <Input
            value={String(value ?? "")}
            onChange={(e) => set(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        </FieldWrap>
      )
  }
}

export function StatusBadge({ value }: { value: unknown }) {
  const v = String(value ?? "")
  const variant =
    v === "open" || v === "scheduled" || v === "published" ? "default" : v === "soon" ? "secondary" : "outline"
  return <Badge variant={variant}>{valueLabel(v) || "—"}</Badge>
}
