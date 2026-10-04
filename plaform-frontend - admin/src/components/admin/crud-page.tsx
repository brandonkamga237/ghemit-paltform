import { useCallback, useEffect, useState, type ReactNode } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { api } from "@/lib/api"
import type { ContentItem } from "@/lib/types"
import { toast } from "@/components/ui/toast"
import { ImageField } from "@/components/admin/media-picker"
import {
  BlocksField,
  ArticleCtaField,
  LinkCtaField,
  SectionsField,
  TextPairListField,
  type ArticleCta,
  type Block,
  type LinkCta,
  type SectionBlock,
} from "@/components/admin/structured-editors"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "select"
  | "tags"
  | "json"
  | "image"
  | "blocks"
  | "articleCta"
  | "linkCta"
  | "pairList"
  | "sections"
  | "programDetail"

export interface FieldDef {
  name: string
  label: string
  kind?: FieldKind
  options?: string[]
  placeholder?: string
  hint?: string
  required?: boolean
  /** Pour kind="tags" : conserve les entrées vides (positions significatives) */
  keepEmpty?: boolean
  /** Pour kind="pairList" : noms des deux propriétés, ex. ["label","value"] */
  pairKeys?: [string, string]
  /** Pour kind="pairList" : libellés affichés des deux colonnes */
  pairLabels?: [string, string]
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
      case "json":
        draft[f.name] = v === undefined || v === null ? "" : JSON.stringify(v, null, 2)
        break
      case "image":
        draft[f.name] = v === undefined || v === null ? "" : String(v)
        break
      case "articleCta":
      case "linkCta":
        draft[f.name] =
          v && typeof v === "object" && !Array.isArray(v)
            ? structuredClone(v)
            : null
        break
      case "blocks":
      case "pairList":
      case "sections":
        draft[f.name] = Array.isArray(v) ? structuredClone(v) : []
        break
      case "programDetail":
        draft[f.name] =
          v && typeof v === "object" && !Array.isArray(v) ? structuredClone(v) : ({} as Draft)
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
        payload[f.name] = f.keepEmpty ? parts : parts.filter(Boolean)
        break
      }
      case "json": {
        const s = String(raw ?? "").trim()
        payload[f.name] = s === "" ? undefined : JSON.parse(s)
        break
      }
      case "image": {
        const s = String(raw ?? "").trim()
        payload[f.name] = s === "" ? undefined : s
        break
      }
      case "articleCta":
      case "linkCta": {
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
            if (b.type === "image") return Boolean(b.url)
            if (b.type === "hr") return true
            return b.text.trim() !== ""
          })
          .map((b) => {
            if (b.type === "image") {
              return b.text.trim()
                ? { type: "image", url: b.url, text: b.text }
                : { type: "image", url: b.url }
            }
            if (b.type === "hr") {
              return { type: "hr" }
            }
            return { type: b.type, text: b.text }
          })
        break
      }
      case "pairList": {
        const arr = (Array.isArray(raw) ? raw : []) as Record<string, string>[]
        const [k1, k2] = f.pairKeys ?? ["label", "value"]
        payload[f.name] = arr.filter((it) => (it[k1] ?? "").trim() !== "" || (it[k2] ?? "").trim() !== "")
        break
      }
      case "sections": {
        const arr = (Array.isArray(raw) ? raw : []) as SectionBlock[]
        payload[f.name] = arr
          .filter((s) => s.title.trim() !== "")
          .map((s) => ({
            title: s.title,
            ...(s.body?.trim() ? { body: s.body } : {}),
            ...(s.list && s.list.some((l) => l.trim())
              ? { list: s.list.filter((l) => l.trim() !== "") }
              : {}),
          }))
        break
      }
      case "programDetail": {
        const d = (raw ?? {}) as Record<string, unknown>
        const clean = (o: Record<string, unknown>) =>
          Object.fromEntries(Object.entries(o).filter(([, v]) => v !== "" && v !== undefined))
        const detail: Record<string, unknown> = {
          heroTitle: d.heroTitle ?? "",
          heroText: d.heroText ?? "",
          sideTitle: d.sideTitle ?? "",
          sideText: d.sideText ?? "",
          sidePrimary: d.sidePrimary ?? "",
          sideSecondary: d.sideSecondary ?? "",
          photoLabel: d.photoLabel ?? "",
          imageUrl: d.imageUrl ?? "",
          facts: cleanListOfPairs(d.facts),
          related: cleanList(d.related),
          steps: cleanListOfPairs(d.steps),
          sections: Array.isArray(d.sections) ? d.sections : [],
        }
        if (detail.heroTitle === "") {
          payload[f.name] = undefined
          break
        }
        // Retire les champs vides mais conserve les listes (même vides, elles
        // structurent la page).
        const out = clean(detail)
        for (const k of ["facts", "related", "steps", "sections"]) {
          if (Array.isArray(detail[k]) && (detail[k] as unknown[]).length > 0) {
            out[k] = detail[k]
          } else {
            delete out[k]
          }
        }
        payload[f.name] = Object.keys(out).length > 0 ? out : undefined
        break
      }
      default:
        payload[f.name] = String(raw ?? "")
    }
  }
  return payload
}

function cleanListOfPairs(v: unknown): Record<string, string>[] {
  if (!Array.isArray(v)) return []
  return v.filter(
    (it) => it && typeof it === "object" && Object.values(it).some((x) => String(x ?? "").trim() !== "")
  )
}

function cleanList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter((s) => s.trim() !== "")
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean)
  return []
}

export function CrudPage({ config }: { config: CrudConfig }) {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
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
    let payload: Record<string, unknown>
    try {
      payload = toPayload(config.fields, draft)
    } catch {
      setFormError("Un champ JSON est invalide — vérifiez la syntaxe.")
      return
    }
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">
            {config.title}
          </h1>
          {config.description && (
            <p className="text-[15px] text-ink-muted">{config.description}</p>
          )}
        </div>
        <Button onClick={openCreate} className="gap-2">
          <PlusIcon className="size-4" />
          Nouveau
        </Button>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-[15px]">
          Impossible de charger les données : {loadError}
        </div>
      ) : loading ? (
        <div className="py-16 text-center text-ink-muted">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed px-5 py-16 text-center text-ink-muted">
          Aucun élément. Cliquez sur « Nouveau » pour commencer.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {config.columns.map((c) => (
                  <TableHead key={c.key}>{c.label}</TableHead>
                ))}
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  {config.columns.map((c) => (
                    <TableCell key={c.key}>
                      {c.render
                        ? c.render(item)
                        : String(item.payload[c.key] ?? item.slug ?? "—")}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item)}
                        aria-label="Modifier"
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(item)}
                        aria-label="Supprimer"
                      >
                        <Trash2Icon className="size-4 text-destructive" />
                      </Button>
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
            {config.fields.map((f) => (
              <FieldInput key={f.name} field={f} draft={draft} set={set} />
            ))}
            {formError && (
              <p className="text-[14px] text-destructive">{formError}</p>
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
      <Label className="text-[14px] font-semibold">{label}</Label>
      {children}
      {hint && <span className="text-[13px] text-ink-faint">{hint}</span>}
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
    case "json":
      return (
        <FieldWrap label={field.label} hint={field.hint ?? "JSON"}>
          <Textarea
            value={String(value ?? "")}
            onChange={(e) => set(field.name, e.target.value)}
            placeholder='{"cle": "valeur"}'
            className="min-h-[120px] font-mono text-[13px]"
            spellCheck={false}
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
          <Label className="text-[14px] font-semibold">{field.label}</Label>
        </div>
      )
    case "select":
      return (
        <FieldWrap label={field.label} hint={field.hint}>
          <Select
            value={String(value ?? "")}
            onValueChange={(v) => set(field.name, v)}
          >
            <SelectTrigger className="w-full justify-between">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
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
    case "linkCta":
      return (
        <LinkCtaField
          label={field.label}
          value={(value as LinkCta) ?? null}
          onChange={(cta) => set(field.name, cta)}
        />
      )
    case "pairList":
      return (
        <TextPairListField
          label={field.label}
          keyNames={field.pairKeys ?? ["label", "value"]}
          keyLabels={field.pairLabels ?? ["Clé", "Valeur"]}
          value={(value as Record<string, string>[]) ?? []}
          onChange={(items) => set(field.name, items)}
        />
      )
    case "sections":
      return (
        <SectionsField
          value={(value as SectionBlock[]) ?? []}
          onChange={(sections) => set(field.name, sections)}
        />
      )
    case "programDetail":
      return (
        <ProgramDetailField
          value={(value as Record<string, unknown>) ?? {}}
          onChange={(detail) => set(field.name, detail)}
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

/** Édition structurée de la page détail d'un programme (zéro JSON). */
function ProgramDetailField({
  value,
  onChange,
}: {
  value: Record<string, unknown>
  onChange: (v: Record<string, unknown>) => void
}) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v })
  const text = (k: string) => String(value[k] ?? "")
  const strList = (k: string) => (Array.isArray(value[k]) ? (value[k] as string[]).join(", ") : "")
  return (
    <div className="flex flex-col gap-4 rounded-lg border-2 border-primary/20 bg-muted/30 p-4">
      <span className="font-heading text-lg font-semibold">Page détail du programme</span>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrap label="Titre du héros">
          <Input value={text("heroTitle")} onChange={(e) => set("heroTitle", e.target.value)} />
        </FieldWrap>
        <FieldWrap label="Texte du héros">
          <Input value={text("heroText")} onChange={(e) => set("heroText", e.target.value)} />
        </FieldWrap>
      </div>

      <TextPairListField
        label="Chiffres clés (bandeau de faits)"
        keyNames={["label", "value"]}
        keyLabels={["Libellé", "Valeur"]}
        value={(value.facts as Record<string, string>[]) ?? []}
        onChange={(items) => set("facts", items)}
      />

      <SectionsField
        value={(value.sections as SectionBlock[]) ?? []}
        onChange={(sections) => set("sections", sections)}
      />

      <TextPairListField
        label="Étapes du parcours"
        keyNames={["title", "text"]}
        keyLabels={["Titre", "Texte"]}
        value={(value.steps as Record<string, string>[]) ?? []}
        onChange={(items) => set("steps", items)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrap label="Barre latérale — titre">
          <Input value={text("sideTitle")} onChange={(e) => set("sideTitle", e.target.value)} />
        </FieldWrap>
        <FieldWrap label="Barre latérale — texte">
          <Input value={text("sideText")} onChange={(e) => set("sideText", e.target.value)} />
        </FieldWrap>
        <FieldWrap label="Barre latérale — bouton principal">
          <Input value={text("sidePrimary")} onChange={(e) => set("sidePrimary", e.target.value)} placeholder="Ex. Candidater" />
        </FieldWrap>
        <FieldWrap label="Barre latérale — bouton secondaire" hint="Facultatif">
          <Input value={text("sideSecondary")} onChange={(e) => set("sideSecondary", e.target.value)} />
        </FieldWrap>
      </div>

      <FieldWrap label="Programmes liés" hint="Slugs séparés par des virgules, ex. mentorat, formations">
        <Input
          value={strList("related")}
          onChange={(e) =>
            set("related", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
          }
        />
      </FieldWrap>

      <FieldWrap label="Libellé de la photo de couverture" hint="Texte affiché si aucune image n'est choisie">
        <Input value={text("photoLabel")} onChange={(e) => set("photoLabel", e.target.value)} placeholder="Ex. Photo — session PAEI" />
      </FieldWrap>

      <ImageField
        label="Image de couverture"
        hint="Affichée dans le héros de la page détail. Vide = visuel par défaut."
        value={text("imageUrl")}
        onChange={(url) => set("imageUrl", url)}
      />
    </div>
  )
}

export function StatusBadge({ value }: { value: unknown }) {
  const v = String(value ?? "")
  const variant =
    v === "open" ? "default" : v === "soon" ? "secondary" : "outline"
  return <Badge variant={variant}>{v || "—"}</Badge>
}
