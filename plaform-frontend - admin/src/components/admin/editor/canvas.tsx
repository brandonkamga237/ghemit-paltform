import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  GripVerticalIcon,
  ImageIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { mediaSrc } from "@/lib/api"
import {
  caretAtEnd,
  caretAtStart,
  htmlToMd,
  mdToHtml,
  plainText,
  promptLink,
  setCaret,
  splitAtCaret,
} from "@/lib/rich-text"
import { MediaPicker } from "@/components/admin/media-picker"
import { Editable } from "./editable"
import { InsertMenu } from "./insert-menu"
import { SelectionToolbar } from "./selection-toolbar"
import { LIST_TYPES, RICH_TYPES, newBlock, type BlockType, type EditorBlock } from "./model"

type Focus = { key: string; at: number | "start" | "end" }

/** Raccourcis markdown reconnus en tête de paragraphe. */
const SHORTCUTS: { prefix: string; type: BlockType }[] = [
  { prefix: "### ", type: "h3" },
  { prefix: "## ", type: "h2" },
  { prefix: "> ", type: "quote" },
  { prefix: "- ", type: "ul" },
  { prefix: "* ", type: "ul" },
  { prefix: "1. ", type: "ol" },
  { prefix: "```", type: "code" },
]

const richClass: Partial<Record<BlockType, string>> = {
  p: "text-lead text-navy/85",
  h2: "pt-6 font-heading text-h2 font-semibold text-navy",
  h3: "pt-3 font-heading text-h3 font-semibold text-navy",
  quote: "font-heading text-h2 text-navy italic",
  callout: "text-body text-navy",
}

const placeholders: Partial<Record<BlockType, string>> = {
  p: "Écrivez, ou tapez « / » pour insérer un bloc…",
  h2: "Titre de section",
  h3: "Sous-titre",
  quote: "Une citation marquante",
  callout: "Information ou conseil à mettre en avant",
}

const isYoutube = (url: string) =>
  url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([\w-]{6,})/)?.[1] ??
  url.match(/youtu\.be\/([\w-]{6,})/)?.[1]

/**
 * Le corps de l'article, édité « en place » dans la typographie du site.
 * Chaque bloc garde son type (paragraphe, titre, liste, image…) et le format
 * stocké reste celui que le site public sait afficher.
 */
export function Canvas({
  blocks,
  setBlocks,
}: {
  blocks: EditorBlock[]
  setBlocks: Dispatch<SetStateAction<EditorBlock[]>>
}) {
  const nodes = useRef(new Map<string, HTMLElement>())
  const pending = useRef<Focus | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [blockMenu, setBlockMenu] = useState<string | null>(null)
  const [pickerFor, setPickerFor] = useState<string | null>(null)

  const register = useCallback((key: string, el: HTMLElement | null) => {
    if (el) nodes.current.set(key, el)
    else nodes.current.delete(key)
  }, [])

  const applyFocus = (f: Focus) => {
    const el = nodes.current.get(f.key)
    if (!el) return false
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      el.focus()
      const pos = f.at === "start" ? 0 : f.at === "end" ? el.value.length : f.at
      el.setSelectionRange(pos, pos)
    } else if (el.isContentEditable) {
      setCaret(el, f.at)
    } else {
      el.focus()
    }
    return true
  }

  // Focus demandé par une opération : appliqué après le rendu qui crée le nœud.
  useEffect(() => {
    if (pending.current && applyFocus(pending.current)) pending.current = null
  })

  const focusLater = (key: string, at: Focus["at"]) => {
    pending.current = { key, at }
  }

  /** Clé du premier / dernier élément focalisable d'un bloc. */
  const entryKey = (b: EditorBlock, end: boolean) => {
    if (LIST_TYPES.includes(b.type)) {
      const n = Math.max(1, b.text.split("\n").length)
      return `${b.id}:${end ? n - 1 : 0}`
    }
    if (b.type === "image" || b.type === "video") return `${b.id}:caption`
    return b.id
  }

  const update = (id: string, patch: Partial<EditorBlock>, rerender = false) =>
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch, rev: rerender ? b.rev + 1 : b.rev } : b)))

  const insertAfter = (id: string, ...added: EditorBlock[]) =>
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === id)
      const next = [...bs]
      next.splice(i + 1, 0, ...added)
      return next
    })

  const remove = (id: string) =>
    setBlocks((bs) => {
      const next = bs.filter((b) => b.id !== id)
      return next.length ? next : [newBlock("p")]
    })

  const move = (id: string, dir: -1 | 1) =>
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === id)
      const j = i + dir
      if (j < 0 || j >= bs.length) return bs
      const next = [...bs]
      const [b] = next.splice(i, 1)
      next.splice(j, 0, b)
      return next
    })

  const neighbours = (id: string) => {
    const i = blocks.findIndex((b) => b.id === id)
    return { i, prev: blocks[i - 1], next: blocks[i + 1] }
  }

  /** Transforme un bloc (toolbar, menu, raccourci) en conservant son texte. */
  const convert = (id: string, type: BlockType) => {
    const b = blocks.find((x) => x.id === id)
    if (!b) return
    if (type === "hr") {
      const p = newBlock("p")
      setBlocks((bs) => bs.flatMap((x) => (x.id === id ? [{ ...newBlock("hr"), id }, p] : [x])))
      focusLater(p.id, "start")
      return
    }
    if (type === "image") {
      update(id, { type, text: "", url: "" }, true)
      setPickerFor(id)
      return
    }
    update(id, { type, ...(type === "callout" && !b.tone ? { tone: "info" as const } : {}) }, true)
    focusLater(type === "video" ? `${id}:url` : entryKey({ ...b, type }, false), type === "video" ? "start" : "end")
  }

  // ─── Blocs de texte enrichi ────────────────────────────────────────────────

  const onRichInput = (b: EditorBlock, el: HTMLElement) => {
    const md = htmlToMd(el)
    if (b.type === "p") {
      if (md === "---") {
        convert(b.id, "hr")
        return
      }
      const hit = SHORTCUTS.find((s) => md.startsWith(s.prefix))
      if (hit) {
        update(b.id, { type: hit.type, text: md.slice(hit.prefix.length) }, true)
        focusLater(LIST_TYPES.includes(hit.type) ? `${b.id}:0` : b.id, "start")
        return
      }
    }
    update(b.id, { text: md })
  }

  const onRichKey = (b: EditorBlock, e: KeyboardEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const { prev, next } = neighbours(b.id)
    const mod = e.metaKey || e.ctrlKey

    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault()
      promptLink()
      return
    }
    if (e.key === "/" && b.type === "p" && (el.textContent ?? "") === "") {
      e.preventDefault()
      setMenuFor(b.id)
      return
    }
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault()
      // Entrée sur un titre ou une citation vide : retour au paragraphe.
      if (b.type !== "p" && (el.textContent ?? "") === "") {
        update(b.id, { type: "p" }, true)
        focusLater(b.id, "start")
        return
      }
      const { before, after } = splitAtCaret(el)
      const created = newBlock("p", after)
      update(b.id, { text: before })
      insertAfter(b.id, created)
      focusLater(created.id, "start")
      return
    }
    if (e.key === "Backspace" && caretAtStart(el)) {
      if (b.type !== "p") {
        e.preventDefault()
        update(b.id, { type: "p" }, true)
        focusLater(b.id, "start")
        return
      }
      if (!prev) return
      e.preventDefault()
      if (RICH_TYPES.includes(prev.type)) {
        const at = plainText(prev.text).length
        update(prev.id, { text: prev.text + b.text }, true)
        remove(b.id)
        focusLater(prev.id, at)
      } else if ((el.textContent ?? "") === "") {
        remove(b.id)
        focusLater(entryKey(prev, true), "end")
      } else {
        applyFocus({ key: entryKey(prev, true), at: "end" })
      }
      return
    }
    if (e.key === "ArrowUp" && prev && caretAtStart(el)) {
      e.preventDefault()
      applyFocus({ key: entryKey(prev, true), at: "end" })
    } else if (e.key === "ArrowDown" && next && caretAtEnd(el)) {
      e.preventDefault()
      applyFocus({ key: entryKey(next, false), at: "start" })
    }
  }

  /** Collage en texte brut ; plusieurs paragraphes deviennent plusieurs blocs. */
  const onRichPaste = (b: EditorBlock, e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain").replace(/\r/g, "")
    const parts = text.split(/\n+/).map((s) => s.trim()).filter(Boolean)
    if (parts.length <= 1) {
      document.execCommand("insertText", false, text.replace(/\n/g, " "))
      return
    }
    document.execCommand("insertText", false, parts[0])
    const added = parts.slice(1).map((t) => newBlock("p", t))
    insertAfter(b.id, ...added)
    focusLater(added[added.length - 1].id, "end")
  }

  // ─── Listes : une zone éditable par élément ────────────────────────────────

  const onItemKey = (b: EditorBlock, i: number, e: KeyboardEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const items = b.text.split("\n")
    const { prev, next } = neighbours(b.id)

    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if ((el.textContent ?? "") === "") {
        // Entrée sur un élément vide : on sort de la liste.
        const rest = items.filter((_, k) => k !== i)
        const p = newBlock("p")
        if (rest.length === 0) {
          update(b.id, { type: "p", text: "" }, true)
          focusLater(b.id, "start")
          return
        }
        update(b.id, { text: rest.join("\n") }, true)
        insertAfter(b.id, p)
        focusLater(p.id, "start")
        return
      }
      const { before, after } = splitAtCaret(el)
      const nextItems = [...items]
      nextItems.splice(i, 1, before, after)
      update(b.id, { text: nextItems.join("\n") }, true)
      focusLater(`${b.id}:${i + 1}`, "start")
      return
    }
    if (e.key === "Backspace" && caretAtStart(el)) {
      e.preventDefault()
      if (i === 0) {
        // Premier élément : il redevient un paragraphe avant la liste.
        const rest = items.slice(1)
        if (rest.length === 0) {
          update(b.id, { type: "p", text: items[0] }, true)
          focusLater(b.id, "start")
          return
        }
        const p = { ...newBlock("p", items[0]) }
        setBlocks((bs) =>
          bs.flatMap((x) => (x.id === b.id ? [p, { ...x, text: rest.join("\n"), rev: x.rev + 1 }] : [x]))
        )
        focusLater(p.id, "start")
        return
      }
      const at = plainText(items[i - 1]).length
      const merged = [...items]
      merged.splice(i - 1, 2, items[i - 1] + items[i])
      update(b.id, { text: merged.join("\n") }, true)
      focusLater(`${b.id}:${i - 1}`, at)
      return
    }
    if (e.key === "ArrowUp" && caretAtStart(el)) {
      const target = i > 0 ? { key: `${b.id}:${i - 1}`, at: "end" as const } : prev && { key: entryKey(prev, true), at: "end" as const }
      if (target) {
        e.preventDefault()
        applyFocus(target)
      }
    } else if (e.key === "ArrowDown" && caretAtEnd(el)) {
      const target =
        i < items.length - 1 ? { key: `${b.id}:${i + 1}`, at: "start" as const } : next && { key: entryKey(next, false), at: "start" as const }
      if (target) {
        e.preventDefault()
        applyFocus(target)
      }
    }
  }

  // ─── Rendu ─────────────────────────────────────────────────────────────────

  const lastIsEmptyP = (() => {
    const last = blocks[blocks.length - 1]
    return last && last.type === "p" && last.text === ""
  })()

  return (
    <div className="flex flex-col">
      {blocks.map((b, index) => {
        const showPlus = focused === b.id && b.type === "p" && b.text === ""
        return (
          <div
            key={b.id}
            className="group/block relative py-1.5"
            onFocusCapture={() => setFocused(b.id)}
          >
            {/* Marge gauche : insertion et actions du bloc */}
            <div className="absolute top-2 -left-14 flex w-12 justify-end gap-0.5 max-md:hidden">
              {showPlus || menuFor === b.id ? (
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Insérer un bloc"
                    aria-expanded={menuFor === b.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setMenuFor(menuFor === b.id ? null : b.id)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border border-sand-dark bg-surface text-ink-muted transition-transform hover:border-navy hover:text-navy",
                      menuFor === b.id && "rotate-45 border-navy text-navy"
                    )}
                  >
                    <PlusIcon className="size-4" />
                  </button>
                  {menuFor === b.id && (
                    <InsertMenu
                      onPick={(t) => {
                        setMenuFor(null)
                        convert(b.id, t)
                      }}
                      onClose={() => {
                        setMenuFor(null)
                        applyFocus({ key: b.id, at: "start" })
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="relative opacity-0 transition-opacity group-focus-within/block:opacity-100 group-hover/block:opacity-100">
                  <button
                    type="button"
                    aria-label="Actions du bloc"
                    aria-expanded={blockMenu === b.id}
                    onClick={() => setBlockMenu(blockMenu === b.id ? null : b.id)}
                    className="flex h-8 w-6 items-center justify-center rounded-sm text-ink-faint hover:bg-sand hover:text-navy"
                  >
                    <GripVerticalIcon className="size-4" />
                  </button>
                  {blockMenu === b.id && (
                    <BlockMenu
                      canUp={index > 0}
                      canDown={index < blocks.length - 1}
                      onUp={() => move(b.id, -1)}
                      onDown={() => move(b.id, 1)}
                      onDelete={() => remove(b.id)}
                      onClose={() => setBlockMenu(null)}
                    />
                  )}
                </div>
              )}
            </div>

            {renderBlock(b)}
          </div>
        )
      })}

      {/* Zone de clic sous le dernier bloc : continuer à écrire */}
      <button
        type="button"
        aria-label="Continuer à écrire"
        className="h-24 cursor-text"
        onClick={() => {
          if (lastIsEmptyP) {
            applyFocus({ key: blocks[blocks.length - 1].id, at: "start" })
            return
          }
          const p = newBlock("p")
          setBlocks((bs) => [...bs, p])
          focusLater(p.id, "start")
        }}
      />

      <SelectionToolbar
        typeOf={(id) => blocks.find((x) => x.id === id)?.type}
        onConvert={(id, t) => convert(id, t)}
      />

      <MediaPicker
        open={pickerFor !== null}
        onOpenChange={(o) => !o && setPickerFor(null)}
        onSelect={(img) => {
          if (pickerFor) {
            update(pickerFor, { url: img.url })
            focusLater(`${pickerFor}:caption`, "start")
          }
          setPickerFor(null)
        }}
      />
    </div>
  )

  function renderBlock(b: EditorBlock) {
    if (RICH_TYPES.includes(b.type)) {
      const editable = (
        <Editable
          nodeKey={b.id}
          blockId={b.id}
          html={mdToHtml(b.text)}
          rev={b.rev}
          solo={blocks.length === 1}
          placeholder={placeholders[b.type]}
          className={richClass[b.type]}
          register={register}
          onInput={(e) => onRichInput(b, e.currentTarget)}
          onKeyDown={(e) => onRichKey(b, e)}
          onPaste={(e) => onRichPaste(b, e)}
        />
      )
      if (b.type === "quote") {
        return (
          <figure className="my-4 flex flex-col gap-3 border-y border-sand-dark py-7">
            {editable}
            <input
              value={b.cite ?? ""}
              onChange={(e) => update(b.id, { cite: e.target.value })}
              placeholder="Source de la citation (facultative)"
              className="bg-transparent text-small font-semibold text-ink-muted outline-none placeholder:font-normal placeholder:text-ink-faint"
            />
          </figure>
        )
      }
      if (b.type === "callout") {
        const tones = { info: "bg-open-bg", success: "bg-gold-tint", warning: "bg-soon-bg" } as const
        return (
          <div className={cn("my-2 flex flex-col gap-3 px-6 py-5", tones[b.tone ?? "info"])}>
            <div className="flex gap-1.5" role="radiogroup" aria-label="Ton de l'encadré">
              {(
                [
                  ["info", "Information"],
                  ["success", "Conseil"],
                  ["warning", "Attention"],
                ] as const
              ).map(([tone, label]) => (
                <button
                  key={tone}
                  type="button"
                  role="radio"
                  aria-checked={(b.tone ?? "info") === tone}
                  onClick={() => update(b.id, { tone })}
                  className={cn(
                    "rounded-sm px-2 py-0.5 text-caption font-semibold transition-colors",
                    (b.tone ?? "info") === tone ? "bg-navy text-surface" : "text-ink-muted hover:text-navy"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {editable}
          </div>
        )
      }
      return editable
    }

    if (LIST_TYPES.includes(b.type)) {
      const items = b.text.split("\n")
      const Tag = b.type === "ol" ? "ol" : "ul"
      return (
        <Tag
          className={cn(
            "flex flex-col gap-1.5 pl-7 text-lead text-navy/85 marker:text-gehmit",
            b.type === "ol" ? "list-decimal marker:font-semibold" : "list-disc"
          )}
        >
          {items.map((item, i) => (
            <li key={`${b.rev}-${i}`}>
              <Editable
                nodeKey={`${b.id}:${i}`}
                blockId={b.id}
                html={mdToHtml(item)}
                rev={b.rev}
                rich={false}
                placeholder="Élément de liste"
                register={register}
                onInput={(e) => {
                  const next = [...items]
                  next[i] = htmlToMd(e.currentTarget)
                  update(b.id, { text: next.join("\n") })
                }}
                onKeyDown={(e) => onItemKey(b, i, e)}
                onPaste={(e) => {
                  e.preventDefault()
                  document.execCommand("insertText", false, e.clipboardData.getData("text/plain").replace(/\s*\n\s*/g, " "))
                }}
              />
            </li>
          ))}
        </Tag>
      )
    }

    if (b.type === "code" || b.type === "table") {
      return (
        <div className="my-2 flex flex-col gap-2">
          <textarea
            ref={(el) => register(b.id, el)}
            value={b.text}
            spellCheck={false}
            aria-label={b.type === "code" ? "Bloc de code" : "Tableau"}
            placeholder={b.type === "code" ? "console.log('exemple')" : "Colonne 1 | Colonne 2\nValeur A | Valeur B"}
            onChange={(e) => update(b.id, { text: e.target.value })}
            onKeyDown={(e) => {
              const el = e.currentTarget
              if (e.key === "Tab") {
                e.preventDefault()
                const s = el.selectionStart
                const v = el.value
                update(b.id, { text: v.slice(0, s) + "  " + v.slice(el.selectionEnd) })
                requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2))
              } else if (e.key === "Backspace" && el.value === "") {
                e.preventDefault()
                update(b.id, { type: "p", text: "" }, true)
                focusLater(b.id, "start")
              } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault()
                const p = newBlock("p")
                insertAfter(b.id, p)
                focusLater(p.id, "start")
              }
            }}
            className={cn(
              "min-h-[120px] w-full resize-none p-5 font-mono text-small outline-none [field-sizing:content]",
              b.type === "code" ? "bg-navy-deep text-surface placeholder:text-surface/35" : "border-y border-sand-dark bg-white text-navy placeholder:text-ink-faint"
            )}
          />
          {b.type === "table" ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <input
                value={b.caption ?? ""}
                onChange={(e) => update(b.id, { caption: e.target.value })}
                placeholder="Légende du tableau (facultative)"
                className="min-w-0 flex-1 bg-transparent text-small text-ink-muted outline-none placeholder:text-ink-faint"
              />
              <span className="text-caption text-ink-faint">Une ligne par rangée, cellules séparées par « | » ; la première ligne est l'en-tête.</span>
            </div>
          ) : (
            <span className="text-caption text-ink-faint">Ctrl+Entrée pour sortir du bloc.</span>
          )}
        </div>
      )
    }

    if (b.type === "image") {
      return (
        <figure className="my-4 flex flex-col gap-2.5">
          {b.url ? (
            <div className="group/img relative bg-sand">
              <img src={mediaSrc(b.url)} alt={b.alt ?? b.text} className="w-full object-cover" />
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 transition-opacity group-hover/img:opacity-100 group-focus-within/img:opacity-100">
                <OverlayButton onClick={() => setPickerFor(b.id)}>Remplacer</OverlayButton>
                <OverlayButton onClick={() => update(b.id, { wide: b.wide ? undefined : true })}>
                  {b.wide ? "Largeur du texte" : "Pleine largeur"}
                </OverlayButton>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPickerFor(b.id)}
              className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 border border-dashed border-sand-dark bg-white text-ink-muted transition-colors hover:border-navy hover:text-navy"
            >
              <ImageIcon className="size-6" strokeWidth={1.5} />
              <span className="text-small font-semibold">Choisir une image</span>
              <span className="text-caption">Médiathèque ou ordinateur</span>
            </button>
          )}
          <input
            ref={(el) => register(`${b.id}:caption`, el)}
            value={b.text}
            onChange={(e) => update(b.id, { text: e.target.value })}
            placeholder="Légende (facultative)"
            className="bg-transparent text-center text-small text-ink-muted outline-none placeholder:text-ink-faint"
          />
          <input
            value={b.alt ?? ""}
            onChange={(e) => update(b.id, { alt: e.target.value || undefined })}
            placeholder="Texte alternatif : décrire l'image pour les lecteurs d'écran"
            className="bg-transparent text-center text-caption text-ink-faint outline-none placeholder:text-ink-faint/70"
          />
        </figure>
      )
    }

    if (b.type === "video") {
      const yt = b.url ? isYoutube(b.url) : undefined
      return (
        <figure className="my-4 flex flex-col gap-2.5">
          {yt ? (
            <div className="aspect-video w-full bg-navy-deep">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${yt}`}
                title={b.text || "Vidéo"}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          ) : null}
          <input
            ref={(el) => register(`${b.id}:url`, el)}
            value={b.url ?? ""}
            onChange={(e) => update(b.id, { url: e.target.value })}
            placeholder="Collez l'adresse d'une vidéo YouTube ou d'un fichier de la médiathèque"
            className="h-11 border-b border-sand-dark bg-transparent text-small text-navy outline-none placeholder:text-ink-faint focus:border-gehmit"
          />
          <input
            ref={(el) => register(`${b.id}:caption`, el)}
            value={b.text}
            onChange={(e) => update(b.id, { text: e.target.value })}
            placeholder="Légende (facultative)"
            className="bg-transparent text-center text-small text-ink-muted outline-none placeholder:text-ink-faint"
          />
        </figure>
      )
    }

    // Séparateur
    return (
      <button
        type="button"
        ref={(el) => register(b.id, el)}
        aria-label="Séparateur (Retour arrière pour supprimer)"
        onKeyDown={(e) => {
          if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault()
            const { prev } = neighbours(b.id)
            remove(b.id)
            if (prev) focusLater(entryKey(prev, true), "end")
          }
        }}
        className="my-6 flex w-full justify-center gap-4 rounded-sm py-2 text-h3 text-ink-faint outline-none focus-visible:bg-sand/60"
      >
        ···
      </button>
    )
  }
}

function OverlayButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm bg-navy-deep/85 px-3 py-1.5 text-caption font-semibold text-surface backdrop-blur-sm hover:bg-navy-deep"
    >
      {children}
    </button>
  )
}

function BlockMenu({
  canUp,
  canDown,
  onUp,
  onDown,
  onDelete,
  onClose,
}: {
  canUp: boolean
  canDown: boolean
  onUp: () => void
  onDown: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDownDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", onDownDoc)
    return () => document.removeEventListener("mousedown", onDownDoc)
  }, [onClose])
  const item = "flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-small text-navy hover:bg-cream disabled:opacity-40"
  return (
    <div
      ref={ref}
      role="menu"
      className="absolute top-9 left-0 z-40 w-[190px] rounded-sm border border-sand-dark bg-surface p-1 shadow-[0_16px_40px_-16px_rgba(20,30,51,0.35)]"
    >
      <button type="button" role="menuitem" className={item} disabled={!canUp} onClick={() => { onUp(); onClose() }}>
        <ArrowUpIcon className="size-4" /> Monter
      </button>
      <button type="button" role="menuitem" className={item} disabled={!canDown} onClick={() => { onDown(); onClose() }}>
        <ArrowDownIcon className="size-4" /> Descendre
      </button>
      <button type="button" role="menuitem" className={cn(item, "text-destructive")} onClick={() => { onDelete(); onClose() }}>
        <Trash2Icon className="size-4" /> Supprimer le bloc
      </button>
    </div>
  )
}
