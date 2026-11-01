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
import { GripVerticalIcon, PlusIcon } from "lucide-react"
import { cn } from "@gehmit/ui/cn"
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
import { BlockMenu } from "./block-menu"
import { CalloutFrame, CodeBlock, ImageBlock, QuoteFrame, VideoBlock } from "./blocks"
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
  p: "text-lead text-ink/85",
  h2: "pt-6 font-heading text-h2 font-semibold text-ink",
  h3: "pt-3 font-heading text-h3 font-semibold text-ink",
  quote: "font-heading text-h2 text-ink italic",
  callout: "text-body text-ink",
}

const placeholders: Partial<Record<BlockType, string>> = {
  p: "Écrivez, ou tapez « / » pour insérer un bloc…",
  h2: "Titre de section",
  h3: "Sous-titre",
  quote: "Une citation marquante",
  callout: "Information ou conseil à mettre en avant",
}

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
                      "flex size-8 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-muted transition-transform hover:border-ink hover:text-ink",
                      menuFor === b.id && "rotate-45 border-ink text-ink"
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
                    className="flex h-8 w-6 items-center justify-center rounded-sm text-ink-faint hover:bg-line hover:text-ink"
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
        return <QuoteFrame block={b} onUpdate={(p) => update(b.id, p)}>{editable}</QuoteFrame>
      }
      if (b.type === "callout") {
        return <CalloutFrame block={b} onUpdate={(p) => update(b.id, p)}>{editable}</CalloutFrame>
      }
      return editable
    }

    if (LIST_TYPES.includes(b.type)) {
      const items = b.text.split("\n")
      const Tag = b.type === "ol" ? "ol" : "ul"
      return (
        <Tag
          className={cn(
            "flex flex-col gap-1.5 pl-7 text-lead text-ink/85 marker:text-gehmit",
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
        <CodeBlock
          block={b}
          register={register}
          onUpdate={(p) => update(b.id, p)}
          onRevert={() => {
            update(b.id, { type: "p", text: "" }, true)
            focusLater(b.id, "start")
          }}
          onExit={() => {
            const p = newBlock("p")
            insertAfter(b.id, p)
            focusLater(p.id, "start")
          }}
        />
      )
    }

    if (b.type === "image") {
      return <ImageBlock block={b} register={register} onUpdate={(p) => update(b.id, p)} onPick={() => setPickerFor(b.id)} />
    }

    if (b.type === "video") {
      return <VideoBlock block={b} register={register} onUpdate={(p) => update(b.id, p)} />
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
        className="my-6 flex w-full justify-center gap-4 rounded-sm py-2 text-h3 text-ink-faint outline-none focus-visible:bg-line/60"
      >
        ···
      </button>
    )
  }
}
