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
  MinusIcon,
  PlusIcon,
  QuoteIcon,
  Trash2Icon,
  TypeIcon,
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
  type: "p" | "h2" | "h3" | "quote" | "image" | "hr" | "ul" | "ol" | "code"
  /** Texte du bloc ; pour « image », c'est la légende (facultative). */
  text: string
  /** Pour « image » : URL du média choisi. */
  url?: string
}

const BLOCK_TYPES: { value: Block["type"]; label: string; icon?: typeof TypeIcon }[] = [
  { value: "p", label: "Paragraphe", icon: TypeIcon },
  { value: "h2", label: "Titre", icon: TypeIcon },
  { value: "h3", label: "Sous-titre", icon: TypeIcon },
  { value: "quote", label: "Citation", icon: QuoteIcon },
  { value: "ul", label: "Liste à puces", icon: ListIcon },
  { value: "ol", label: "Liste numérotée", icon: ListOrderedIcon },
  { value: "code", label: "Bloc de code", icon: Code2Icon },
  { value: "hr", label: "Séparateur", icon: MinusIcon },
  { value: "image", label: "Image", icon: ImageIcon },
]

const FORMATTABLE_TYPES: Block["type"][] = ["p", "h2", "h3", "quote"]

function blockPlaceholder(type: Block["type"]): string {
  switch (type) {
    case "h2":
      return "Titre de section…"
    case "h3":
      return "Sous-titre…"
    case "quote":
      return "« Une citation marquante… »"
    case "ul":
      return "Un élément par ligne"
    case "ol":
      return "Un élément par ligne"
    case "code":
      return "console.log('exemple');"
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
        type === "image" ? { type, text: "", url: "" } : { type, text: "" }
      const idx = blocks.length
      onChange([...blocks, block])
      setActive(idx)
      setTimeout(() => {
        if (type === "image" || type === "hr") return
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
      <Label className="text-[14px] font-semibold">Corps de l'article</Label>

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
                          ? "font-heading text-[26px] font-semibold leading-tight text-foreground placeholder:text-ink-faint"
                          : block.type === "h3"
                            ? "font-heading text-[22px] font-semibold leading-tight text-foreground placeholder:text-ink-faint"
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

              {(block.type === "ul" || block.type === "ol") && (
                <span className="text-[12px] text-ink-faint">
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
        <Label className="text-[14px] font-semibold">Encart d'appel à l'action en fin d'article</Label>
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

// ─── Bouton de programme (CTA principal / secondaire) ────────────────────────

export interface LinkCta {
  label: string
  to: string
  disabled?: boolean
}

export function LinkCtaField({
  value,
  onChange,
  label,
}: {
  value: LinkCta | null
  onChange: (cta: LinkCta | null) => void
  label: string
}) {
  const cta = value ?? { label: "", to: "", disabled: false }
  const empty = !value

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <Checkbox checked={!empty} onCheckedChange={(v) => onChange(v === true ? cta : null)} />
        <Label className="text-[14px] font-semibold">{label}</Label>
      </div>
      {!empty && (
        <div className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <LabeledInput label="Libellé" value={cta.label} onChange={(v) => onChange({ ...cta, label: v })} placeholder="Ex. Candidater" />
          <LabeledInput label="Lien" value={cta.to} onChange={(v) => onChange({ ...cta, to: v })} placeholder="/candidature/paei" />
          <div className="flex items-center gap-2 pb-1">
            <Checkbox
              checked={cta.disabled ?? false}
              onCheckedChange={(v) => onChange({ ...cta, disabled: v === true })}
            />
            <Label className="text-[13px]">Désactivé</Label>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Listes clé/valeur génériques (faits, étapes) ────────────────────────────

interface TextPair {
  [key: string]: string
}

export function TextPairListField({
  value,
  onChange,
  label,
  keyNames,
  keyLabels,
}: {
  value: TextPair[]
  onChange: (items: TextPair[]) => void
  label: string
  keyNames: [string, string]
  keyLabels: [string, string]
}) {
  const [k1, k2] = keyNames
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[14px] font-semibold">{label}</Label>
      <div className="flex flex-col gap-2">
        {value.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-lg border p-2.5">
            <LabeledInput label={i === 0 ? keyLabels[0] : ""} value={item[k1] ?? ""} onChange={(v) => onChange(value.map((it, idx) => idx === i ? { ...it, [k1]: v } : it))} />
            <LabeledInput label={i === 0 ? keyLabels[1] : ""} value={item[k2] ?? ""} onChange={(v) => onChange(value.map((it, idx) => idx === i ? { ...it, [k2]: v } : it))} />
            <Button type="button" variant="ghost" size="icon" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Supprimer la ligne">
              <Trash2Icon className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...value, { [k1]: "", [k2]: "" }])}
      >
        <PlusIcon className="mr-1 size-3.5" />
        Ajouter
      </Button>
    </div>
  )
}

// ─── Sections de page détail programme ────────────────────────────────────────

export interface SectionBlock {
  title: string
  body?: string
  list?: string[]
}

export function SectionsField({
  value,
  onChange,
}: {
  value: SectionBlock[]
  onChange: (sections: SectionBlock[]) => void
}) {
  const update = (i: number, patch: Partial<SectionBlock>) =>
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[14px] font-semibold">Sections de la page détail</Label>
      <div className="flex flex-col gap-3">
        {value.map((s, i) => (
          <div key={i} className="flex flex-col gap-2.5 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Input
                value={s.title}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder="Titre de la section"
                className="font-semibold"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Supprimer la section">
                <Trash2Icon className="size-4 text-destructive" />
              </Button>
            </div>
            <Textarea
              value={s.body ?? ""}
              onChange={(e) => update(i, { body: e.target.value })}
              placeholder="Texte de la section…"
              rows={3}
            />
            <div className="flex flex-col gap-1">
              <Label className="text-[12px] text-muted-foreground">
                Points en liste (un par ligne, facultatif)
              </Label>
              <Textarea
                value={(s.list ?? []).join("\n")}
                onChange={(e) =>
                  update(i, { list: e.target.value.split("\n") })
                }
                placeholder={"Être jeune diplômé…\nÊtre disponible à Douala…"}
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...value, { title: "", body: "", list: [] }])}
      >
        <PlusIcon className="mr-1 size-3.5" />
        Ajouter une section
      </Button>
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
      {label ? <Label className="text-[12px] text-muted-foreground">{label}</Label> : null}
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}
