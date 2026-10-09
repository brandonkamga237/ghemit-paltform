import { useEffect, useState } from "react"
import { BoldIcon, ItalicIcon, LinkIcon, QuoteIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { promptLink } from "@/lib/rich-text"
import type { BlockType } from "./model"

interface Anchor {
  top: number
  left: number
  blockId: string
  /** Le bloc accepte d'être transformé (titre, citation…). */
  convertible: boolean
}

/**
 * Barre flottante au-dessus du texte sélectionné, comme sur Medium : gras,
 * italique, lien, et transformation du bloc en titre, sous-titre ou citation.
 */
export function SelectionToolbar({
  typeOf,
  onConvert,
}: {
  typeOf: (blockId: string) => BlockType | undefined
  onConvert: (blockId: string, type: BlockType) => void
}) {
  const [anchor, setAnchor] = useState<Anchor | null>(null)

  useEffect(() => {
    const update = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setAnchor(null)
        return
      }
      const range = sel.getRangeAt(0)
      const node = range.commonAncestorContainer
      const el = (node instanceof HTMLElement ? node : node.parentElement)?.closest<HTMLElement>("[data-block-id]")
      if (!el || !el.isContentEditable) {
        setAnchor(null)
        return
      }
      const rect = range.getBoundingClientRect()
      if (rect.width === 0) {
        setAnchor(null)
        return
      }
      setAnchor({
        top: rect.top - 50,
        left: rect.left + rect.width / 2,
        blockId: el.dataset.blockId ?? "",
        convertible: el.dataset.rich === "true",
      })
    }
    document.addEventListener("selectionchange", update)
    window.addEventListener("scroll", update, true)
    return () => {
      document.removeEventListener("selectionchange", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [])

  if (!anchor) return null
  const type = typeOf(anchor.blockId)
  const toggle = (t: BlockType) => onConvert(anchor.blockId, type === t ? "p" : t)

  return (
    <div
      role="toolbar"
      aria-label="Mise en forme"
      style={{ top: Math.max(8, anchor.top), left: anchor.left }}
      className="fixed z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-sm bg-navy-deep p-1 text-surface shadow-[0_8px_24px_-8px_rgba(20,30,51,0.5)]"
      onMouseDown={(e) => e.preventDefault()}
    >
      <ToolButton label="Gras (Ctrl+B)" onClick={() => document.execCommand("bold")}>
        <BoldIcon className="size-4" />
      </ToolButton>
      <ToolButton label="Italique (Ctrl+I)" onClick={() => document.execCommand("italic")}>
        <ItalicIcon className="size-4" />
      </ToolButton>
      <ToolButton label="Lien (Ctrl+K)" onClick={promptLink}>
        <LinkIcon className="size-4" />
      </ToolButton>
      {anchor.convertible && (
        <>
          <span aria-hidden className="mx-1 h-5 w-px bg-white/20" />
          <ToolButton label="Titre" active={type === "h2"} onClick={() => toggle("h2")}>
            <span className="font-heading text-body font-semibold">T</span>
          </ToolButton>
          <ToolButton label="Sous-titre" active={type === "h3"} onClick={() => toggle("h3")}>
            <span className="font-heading text-caption font-semibold">T</span>
          </ToolButton>
          <ToolButton label="Citation" active={type === "quote"} onClick={() => toggle("quote")}>
            <QuoteIcon className="size-4" />
          </ToolButton>
        </>
      )}
    </div>
  )
}

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-sm transition-colors hover:bg-white/10",
        active && "text-gold"
      )}
    >
      {children}
    </button>
  )
}
