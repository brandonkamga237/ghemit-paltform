import { useEffect, useRef } from "react"
import {
  Code2Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ListIcon,
  ListOrderedIcon,
  MegaphoneIcon,
  MinusIcon,
  QuoteIcon,
  TableIcon,
  VideoIcon,
  type LucideIcon,
} from "lucide-react"
import type { BlockType } from "./model"

const ITEMS: { type: BlockType; label: string; hint: string; icon: LucideIcon }[] = [
  { type: "h2", label: "Titre", hint: "## ", icon: Heading2Icon },
  { type: "h3", label: "Sous-titre", hint: "### ", icon: Heading3Icon },
  { type: "image", label: "Image", hint: "Médiathèque", icon: ImageIcon },
  { type: "video", label: "Vidéo", hint: "YouTube ou fichier", icon: VideoIcon },
  { type: "quote", label: "Citation", hint: "> ", icon: QuoteIcon },
  { type: "callout", label: "Encadré", hint: "Info, conseil, attention", icon: MegaphoneIcon },
  { type: "ul", label: "Liste à puces", hint: "- ", icon: ListIcon },
  { type: "ol", label: "Liste numérotée", hint: "1. ", icon: ListOrderedIcon },
  { type: "code", label: "Code", hint: "```", icon: Code2Icon },
  { type: "table", label: "Tableau", hint: "Colonnes « | »", icon: TableIcon },
  { type: "hr", label: "Séparateur", hint: "---", icon: MinusIcon },
]

/**
 * Menu d'insertion ouvert par le « + » de marge ou par « / » sur une ligne
 * vide. Navigation au clavier : flèches, Entrée, Échap.
 */
export function InsertMenu({
  onPick,
  onClose,
}: {
  onPick: (type: BlockType) => void
  onClose: () => void
}) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.querySelector<HTMLButtonElement>("button")?.focus()
    const onDown = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [onClose])

  const move = (dir: 1 | -1) => {
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement)
    buttons[(i + dir + buttons.length) % buttons.length]?.focus()
  }

  return (
    <div
      ref={listRef}
      role="menu"
      aria-label="Insérer un bloc"
      className="absolute top-9 left-0 z-40 grid w-[300px] grid-cols-1 gap-px overflow-hidden rounded-sm border border-sand-dark bg-surface p-1 shadow-[0_16px_40px_-16px_rgba(20,30,51,0.35)]"
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          move(1)
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          move(-1)
        } else if (e.key === "Escape") {
          e.preventDefault()
          onClose()
        }
      }}
    >
      {ITEMS.map((it) => (
        <button
          key={it.type}
          type="button"
          role="menuitem"
          onClick={() => onPick(it.type)}
          className="flex items-center gap-3 rounded-sm px-2.5 py-2 text-left outline-none hover:bg-cream focus-visible:bg-cream"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-sand bg-white text-navy">
            <it.icon className="size-4" strokeWidth={1.75} />
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-small font-semibold text-navy">{it.label}</span>
            <span className="text-caption text-ink-muted">{it.hint}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
