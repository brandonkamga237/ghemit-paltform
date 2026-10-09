import { useCallback, useRef, useState } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoldIcon,
  Code2Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MegaphoneIcon,
  MinusIcon,
  PlusIcon,
  QuoteIcon,
  TableIcon,
  Trash2Icon,
  TypeIcon,
  VideoIcon,
} from "lucide-react"
import { ImageField } from "@/components/admin/media-picker"
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

// ─── Éditeur de blocs professionnel (style Medium) ─────────────────────────────

export interface Block {
  type:
    | "p" | "h2" | "h3" | "quote" | "image" | "hr"
    | "ul" | "ol" | "code" | "video" | "table" | "callout"
  /** Texte du bloc ; pour « image »/« vidéo », c'est la légende (facultative). */
  text: string
  /** Pour « image » : URL du média choisi. Pour « video » : URL YouTube ou fichier. */
  url?: string
  /** Pour « table » : légende sous le tableau. */
  caption?: string
  /** Pour « callout » : info | success | warning. */
  tone?: "info" | "success" | "warning"
  /** Pour « quote » : source de la citation. */
  cite?: string
}

const BLOCK_TYPES: { value: Block["type"]; label: string; icon?: typeof TypeIcon }[] = [
  { value: "p", label: "Paragraphe", icon: TypeIcon },
  { value: "h2", label: "Titre", icon: TypeIcon },
  { value: "h3", label: "Sous-titre", icon: TypeIcon },
  { value: "quote", label: "Citation", icon: QuoteIcon },
  { value: "callout", label: "Encadré", icon: MegaphoneIcon },
  { value: "ul", label: "Liste à puces", icon: ListIcon },
  { value: "ol", label: "Liste numérotée", icon: ListOrderedIcon },
  { value: "code", label: "Bloc de code", icon: Code2Icon },
  { value: "table", label: "Tableau", icon: TableIcon },
  { value: "hr", label: "Séparateur", icon: MinusIcon },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "video", label: "Vidéo", icon: VideoIcon },
]

const FORMATTABLE_TYPES: Block["type"][] = ["p", "h2", "h3", "quote", "callout"]

function blockPlaceholder(type: Block["type"]): string {
  switch (type) {
    case "h2":
      return "Titre de section…"
    case "h3":
      return "Sous-titre…"
    case "quote":
      return "« Une citation marquante… »"
    case "callout":
      return "Information ou conseil à mettre en avant…"
    case "ul":
      return "Un élément par ligne"
    case "ol":
      return "Un élément par ligne"
    case "code":
      return "console.log('exemple');"
    case "table":
      return "Colonne 1 | Colonne 2\nValeur A | Valeur B"
    default:
      return "Écrivez votre paragraphe…"
  }
}

export function BlocksField({
  value,
  onChange,
}: {
  value: Block[]
  onChange: (blocks: Block[]) => void
}) {
  const blocks = (value ?? []).map((b) => ({
    type: b.type,
    text: b.text ?? "",
    url: b.url,
    caption: b.caption,
    tone: b.tone,
    cite: b.cite,
  })) as Block[]

  const [active, setActive] = useState<number | null>(null)
  const [nextType, setNextType] = useState<Block["type"]>("p")
  const refs = useRef<(HTMLTextAreaElement | null)[]>([])

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    const next = [...blocks]
    const [b] = next.splice(i, 1)
    next.splice(j, 0, b)
    onChange(next)
  }

  const update = (i: number, patch: Partial<Block>) => {
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)))
  }

  const remove = (i: number) => {
    onChange(blocks.filter((_, idx) => idx !== i))
    if (active === i) setActive(null)
  }

  const add = useCallback(
    (type: Block["type"]) => {
      const block: Block =
        type === "image" || type === "video"
          ? { type, text: "", url: "" }
          : type === "callout"
            ? { type, text: "", tone: "info" }
            : { type, text: "" }
      const idx = blocks.length
      onChange([...blocks, block])
      setActive(idx)
      setTimeout(() => {
        if (type === "image" || type === "hr" || type === "video") return
        refs.current[idx]?.focus()
      }, 0)
    },
    [blocks, onChange]
  )

  const setRef = (el: HTMLTextAreaElement | null, i: number) => {
    refs.current[i] = el
  }

  const applyFormat = (i: number, format: "bold" | "italic" | "link") => {
    const el = refs.current[i]
    if (!el) return
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const text = el.value
    const selected = text.slice(start, end)
    let next = text
    let nextStart = start
    let nextEnd = end

    if (format === "bold") {
      if (selected) {
        next = text.slice(0, start) + `**${selected}**` + text.slice(end)
        nextStart = start + 2
        nextEnd = end + 2
      } else {
        const ph = "texte en gras"
        next = text.slice(0, start) + `**${ph}**` + text.slice(end)
        nextStart = start + 2
        nextEnd = start + 2 + ph.length
      }
    } else if (format === "italic") {
      if (selected) {
        next = text.slice(0, start) + `*${selected}*` + text.slice(end)
        nextStart = start + 1
        nextEnd = end + 1
      } else {
        const ph = "texte en italique"
        next = text.slice(0, start) + `*${ph}*` + text.slice(end)
        nextStart = start + 1
        nextEnd = start + 1 + ph.length
      }
    } else if (format === "link") {
      const url = window.prompt("URL du lien")
      if (!url) return
      if (selected) {
        const inserted = `[${selected}](${url})`
        next = text.slice(0, start) + inserted + text.slice(end)
        nextStart = start
        nextEnd = start + inserted.length
      } else {
        const ph = "libellé"
        const inserted = `[${ph}](${url})`
        next = text.slice(0, start) + inserted + text.slice(end)
        nextStart = start + 1
        nextEnd = start + 1 + ph.length
      }
    }

    update(i, { text: next })
    setTimeout(() => {
      const nextEl = refs.current[i]
      if (!nextEl) return
      nextEl.focus()
      nextEl.setSelectionRange(nextStart, nextEnd)
    }, 0)
  }

  return (
    <div className="flex flex-col gap-4">
      <Label className="text-small font-semibold">Corps de l'article</Label>

      <div className="flex flex-col gap-4">
        {blocks.map((block, i) => {
          const formatable = FORMATTABLE_TYPES.includes(block.type)
          return (
            <div
              key={i}
              className={`flex flex-col gap-2 rounded-xl border bg-surface p-4 transition-shadow ${
                active === i ? "ring-1 ring-ring/30" : ""
              }`}
              onFocus={() => setActive(i)}
              tabIndex={-1}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={block.type}
                  onValueChange={(v) => update(i, { type: v as Block["type"] })}
                >
                  <SelectTrigger className="h-8 w-[150px]" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOCK_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          {t.icon && <t.icon className="size-4" />}
                          {t.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {formatable && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => applyFormat(i, "bold")}
                      aria-label="Gras"
                    >
                      <BoldIcon className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => applyFormat(i, "italic")}
                      aria-label="Italique"
                    >
                      <ItalicIcon className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => applyFormat(i, "link")}
                      aria-label="Lien"
                    >
                      <LinkIcon className="size-4" />
                    </Button>
                  </>
                )}

                <div className="ml-auto flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    aria-label="Monter"
                  >
                    <ArrowUpIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={i === blocks.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label="Descendre"
                  >
                    <ArrowDownIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => remove(i)}
                    aria-label="Supprimer le bloc"
                  >
                    <Trash2Icon className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {block.type === "image" ? (
                <div className="flex flex-col gap-3">
                  <ImageField
                    label="Image du bloc"
                    value={block.url ?? ""}
                    onChange={(url) => update(i, { url })}
                  />
                  <Input
                    value={block.text}
                    onChange={(e) => update(i, { text: e.target.value })}
                    placeholder="Légende (facultative)"
                  />
                </div>
              ) : block.type === "video" ? (
                <div className="flex flex-col gap-3">
                  <LabeledInput
                    label="URL de la vidéo (YouTube ou médiathèque)"
                    value={block.url ?? ""}
                    onChange={(v) => update(i, { url: v })}
                    placeholder="https://www.youtube.com/watch?v=…"
                  />
                  <Input
                    value={block.text}
                    onChange={(e) => update(i, { text: e.target.value })}
                    placeholder="Légende (facultative)"
                  />
                </div>
              ) : block.type === "hr" ? (
                <div className="flex items-center gap-4 py-3">
                  <hr className="flex-1 border-t border-sand" />
                  <span className="mono-label">Séparateur</span>
                  <hr className="flex-1 border-t border-sand" />
                </div>
              ) : (
                <Textarea
                  ref={(el) => setRef(el, i)}
                  value={block.text}
                  onChange={(e) => update(i, { text: e.target.value })}
                  onFocus={() => setActive(i)}
                  placeholder={blockPlaceholder(block.type)}
                  rows={
                    block.type === "p" || block.type === "ul" || block.type === "ol" || block.type === "code"
                      ? 4
                      : 2
                  }
                  className={`
                    w-full resize-none border-0 bg-transparent p-0 shadow-none
                    focus-visible:ring-0 focus-visible:ring-offset-0
                    ${
                      block.type === "p"
                        ? "text-lg leading-[1.8] text-ink-muted placeholder:text-ink-faint/60"
                        : block.type === "h2"
                          ? "font-heading text-h3 font-semibold text-foreground placeholder:text-ink-faint"
                          : block.type === "h3"
                            ? "font-heading text-h3 font-semibold text-foreground placeholder:text-ink-faint"
                            : block.type === "quote"
                              ? "italic text-lg leading-relaxed text-navy border-l-[3px] border-gold pl-4 placeholder:text-ink-faint"
                              : block.type === "code"
                                ? "font-mono text-sm bg-muted rounded-lg p-3 text-foreground placeholder:text-ink-faint"
                                : block.type === "ul" || block.type === "ol"
                                  ? "text-lg leading-relaxed text-ink-muted placeholder:text-ink-faint/60"
                                  : ""
                    }
                  `}
                />
              )}

              {block.type === "quote" && (
                <Input
                  value={block.cite ?? ""}
                  onChange={(e) => update(i, { cite: e.target.value })}
                  placeholder="Source de la citation (facultative)"
                />
              )}

              {block.type === "callout" && (
                <Select
                  value={block.tone ?? "info"}
                  onValueChange={(v) => update(i, { tone: v as Block["tone"] })}
                >
                  <SelectTrigger className="h-8 w-[180px]" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="success">Succès / conseil</SelectItem>
                    <SelectItem value="warning">Attention</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {block.type === "table" && (
                <div className="flex flex-col gap-2">
                  <Input
                    value={block.caption ?? ""}
                    onChange={(e) => update(i, { caption: e.target.value })}
                    placeholder="Légende du tableau (facultative)"
                  />
                  <span className="text-caption text-ink-faint">
                    Une ligne = une ligne du tableau, cellules séparées par « | ».
                    La première ligne sert d'en-tête.
                  </span>
                </div>
              )}

              {(block.type === "ul" || block.type === "ol") && (
                <span className="text-caption text-ink-faint">
                  Une ligne = un élément de liste.
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <Select value={nextType} onValueChange={(v) => setNextType(v as Block["type"])}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BLOCK_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                <span className="flex items-center gap-2">
                  {t.icon && <t.icon className="size-4" />}
                  {t.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => add(nextType)}
        >
          <PlusIcon className="mr-1 size-3.5" />
          Ajouter un bloc
        </Button>
      </div>
    </div>
  )
}

// ─── Encart CTA d'article (titre + texte + bouton) ────────────────────────────

export interface ArticleCta {
  title: string
  text: string
  label: string
  to: string
}

export function ArticleCtaField({
  value,
  onChange,
}: {
  value: ArticleCta | null
  onChange: (cta: ArticleCta | null) => void
}) {
  const cta = value ?? { title: "", text: "", label: "", to: "" }
  const empty = !value

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <Checkbox
          checked={!empty}
          onCheckedChange={(v) => onChange(v === true ? cta : null)}
        />
        <Label className="text-small font-semibold">Encart d'appel à l'action en fin d'article</Label>
      </div>
      {!empty && (
        <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
          <LabeledInput label="Titre de l'encart" value={cta.title} onChange={(v) => onChange({ ...cta, title: v })} placeholder="Ex. Rejoindre le programme" />
          <LabeledInput label="Texte" value={cta.text} onChange={(v) => onChange({ ...cta, text: v })} placeholder="Ex. Candidatures ouvertes…" />
          <LabeledInput label="Libellé du bouton" value={cta.label} onChange={(v) => onChange({ ...cta, label: v })} placeholder="Ex. Candidater" />
          <LabeledInput label="Lien du bouton" value={cta.to} onChange={(v) => onChange({ ...cta, to: v })} placeholder="/candidature/paei" />
        </div>
      )}
    </div>
  )
}

// ─── Petit helper interne ─────────────────────────────────────────────────────

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      {label ? <Label className="text-caption text-muted-foreground">{label}</Label> : null}
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}
