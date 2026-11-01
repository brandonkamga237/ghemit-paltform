import type { ReactNode } from "react"
import { ImageIcon } from "lucide-react"
import { cn } from "@gehmit/ui/cn"
import { mediaSrc } from "@/lib/api"
import type { EditorBlock } from "./model"

/**
 * Rendu des blocs non textuels de l'éditeur (image, vidéo, code, tableau) et
 * des cadres des blocs enrichis (citation, encadré). Affichage seulement :
 * l'état et la navigation clavier restent dans `Canvas`.
 */

type Register = (key: string, el: HTMLElement | null) => void
type Update = (patch: Partial<EditorBlock>) => void

const isYoutube = (url: string) =>
  url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([\w-]{6,})/)?.[1] ??
  url.match(/youtu\.be\/([\w-]{6,})/)?.[1]

/** Citation : le texte enrichi (`children`) et sa source. */
export function QuoteFrame({ block: b, onUpdate, children }: { block: EditorBlock; onUpdate: Update; children: ReactNode }) {
  return (
    <figure className="my-4 flex flex-col gap-3 border-y border-line-strong py-7">
      {children}
      <input
        value={b.cite ?? ""}
        onChange={(e) => onUpdate({ cite: e.target.value })}
        placeholder="Source de la citation (facultative)"
        className="bg-transparent text-small font-semibold text-ink-muted outline-none placeholder:font-normal placeholder:text-ink-faint"
      />
    </figure>
  )
}

const CALLOUT_TONES = [
  ["info", "Information", "bg-open-bg"],
  ["success", "Conseil", "bg-surface-tint"],
  ["warning", "Attention", "bg-soon-bg"],
] as const

/** Encadré : choix du ton puis le texte enrichi (`children`). */
export function CalloutFrame({ block: b, onUpdate, children }: { block: EditorBlock; onUpdate: Update; children: ReactNode }) {
  const current = b.tone ?? "info"
  const bg = CALLOUT_TONES.find(([t]) => t === current)?.[2]
  return (
    <div className={cn("my-2 flex flex-col gap-3 px-6 py-5", bg)}>
      <div className="flex gap-1.5" role="radiogroup" aria-label="Ton de l'encadré">
        {CALLOUT_TONES.map(([tone, label]) => (
          <button
            key={tone}
            type="button"
            role="radio"
            aria-checked={current === tone}
            onClick={() => onUpdate({ tone })}
            className={cn(
              "rounded-sm px-2 py-0.5 text-caption font-semibold transition-colors",
              current === tone ? "bg-inverse text-surface" : "text-ink-muted hover:text-ink"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {children}
    </div>
  )
}

/**
 * Bloc de code ou tableau (texte brut). Tab indente ; Retour arrière sur un
 * bloc vide le rend paragraphe (`onRevert`) ; Ctrl+Entrée en sort (`onExit`).
 */
export function CodeBlock({
  block: b,
  register,
  onUpdate,
  onRevert,
  onExit,
}: {
  block: EditorBlock
  register: Register
  onUpdate: Update
  onRevert: () => void
  onExit: () => void
}) {
  const isCode = b.type === "code"
  return (
    <div className="my-2 flex flex-col gap-2">
      <textarea
        ref={(el) => register(b.id, el)}
        value={b.text}
        spellCheck={false}
        aria-label={isCode ? "Bloc de code" : "Tableau"}
        placeholder={isCode ? "console.log('exemple')" : "Colonne 1 | Colonne 2\nValeur A | Valeur B"}
        onChange={(e) => onUpdate({ text: e.target.value })}
        onKeyDown={(e) => {
          const el = e.currentTarget
          if (e.key === "Tab") {
            e.preventDefault()
            const s = el.selectionStart
            const v = el.value
            onUpdate({ text: v.slice(0, s) + "  " + v.slice(el.selectionEnd) })
            requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2))
          } else if (e.key === "Backspace" && el.value === "") {
            e.preventDefault()
            onRevert()
          } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault()
            onExit()
          }
        }}
        className={cn(
          "min-h-30 w-full resize-none p-5 font-mono text-small outline-none [field-sizing:content]",
          isCode
            ? "bg-inverse-deep text-surface placeholder:text-surface/35"
            : "border-y border-line-strong bg-surface text-ink placeholder:text-ink-faint"
        )}
      />
      {isCode ? (
        <span className="text-caption text-ink-faint">Ctrl+Entrée pour sortir du bloc.</span>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <input
            value={b.caption ?? ""}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            placeholder="Légende du tableau (facultative)"
            className="min-w-0 flex-1 bg-transparent text-small text-ink-muted outline-none placeholder:text-ink-faint"
          />
          <span className="text-caption text-ink-faint">
            Une ligne par rangée, cellules séparées par « | » ; la première ligne est l'en-tête.
          </span>
        </div>
      )}
    </div>
  )
}

/** Image : choix dans la médiathèque (`onPick`), largeur, légende et texte alternatif. */
export function ImageBlock({
  block: b,
  register,
  onUpdate,
  onPick,
}: {
  block: EditorBlock
  register: Register
  onUpdate: Update
  onPick: () => void
}) {
  return (
    <figure className="my-4 flex flex-col gap-2.5">
      {b.url ? (
        <div className="group/img relative bg-line">
          <img src={mediaSrc(b.url)} alt={b.alt ?? b.text} className="w-full object-cover" />
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 transition-opacity group-hover/img:opacity-100 group-focus-within/img:opacity-100">
            <OverlayButton onClick={onPick}>Remplacer</OverlayButton>
            <OverlayButton onClick={() => onUpdate({ wide: b.wide ? undefined : true })}>
              {b.wide ? "Largeur du texte" : "Pleine largeur"}
            </OverlayButton>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPick}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 border border-dashed border-line-strong bg-surface text-ink-muted transition-colors hover:border-ink hover:text-ink"
        >
          <ImageIcon className="size-6" strokeWidth={1.5} />
          <span className="text-small font-semibold">Choisir une image</span>
          <span className="text-caption">Médiathèque ou ordinateur</span>
        </button>
      )}
      <input
        ref={(el) => register(`${b.id}:caption`, el)}
        value={b.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        placeholder="Légende (facultative)"
        className="bg-transparent text-center text-small text-ink-muted outline-none placeholder:text-ink-faint"
      />
      <input
        value={b.alt ?? ""}
        onChange={(e) => onUpdate({ alt: e.target.value || undefined })}
        placeholder="Texte alternatif : décrire l'image pour les lecteurs d'écran"
        className="bg-transparent text-center text-caption text-ink-faint outline-none placeholder:text-ink-faint/70"
      />
    </figure>
  )
}

/** Vidéo : aperçu YouTube, adresse et légende. */
export function VideoBlock({ block: b, register, onUpdate }: { block: EditorBlock; register: Register; onUpdate: Update }) {
  const yt = b.url ? isYoutube(b.url) : undefined
  return (
    <figure className="my-4 flex flex-col gap-2.5">
      {yt ? (
        <div className="aspect-video w-full bg-inverse-deep">
          <iframe src={`https://www.youtube-nocookie.com/embed/${yt}`} title={b.text || "Vidéo"} className="h-full w-full" allowFullScreen />
        </div>
      ) : null}
      <input
        ref={(el) => register(`${b.id}:url`, el)}
        value={b.url ?? ""}
        onChange={(e) => onUpdate({ url: e.target.value })}
        placeholder="Collez l'adresse d'une vidéo YouTube ou d'un fichier de la médiathèque"
        className="h-11 border-b border-line-strong bg-transparent text-small text-ink outline-none placeholder:text-ink-faint focus:border-gehmit"
      />
      <input
        ref={(el) => register(`${b.id}:caption`, el)}
        value={b.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        placeholder="Légende (facultative)"
        className="bg-transparent text-center text-small text-ink-muted outline-none placeholder:text-ink-faint"
      />
    </figure>
  )
}

/** Bouton posé sur une image (remplacer, retirer, largeur). */
export function OverlayButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm bg-inverse-deep/85 px-3 py-1.5 text-caption font-semibold text-surface backdrop-blur-sm hover:bg-inverse-deep"
    >
      {children}
    </button>
  )
}
