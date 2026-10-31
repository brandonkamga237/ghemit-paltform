import { useRef } from "react"
import { ImagePlusIcon } from "lucide-react"
import { mediaSrc } from "@/lib/api"
import { Canvas } from "@/components/admin/editor/canvas"
import { OverlayButton } from "@/components/admin/editor/blocks"
import { newBlock } from "@/components/admin/editor/model"
import type { ArticleEditor } from "./use-article-doc"

/**
 * Page d'écriture dans la typographie du site : couverture, titre, chapô,
 * puis le corps (canevas). Entrée passe du titre au chapô, puis au premier bloc.
 */
export function ArticleBody({ editor: ed, onPickCover }: { editor: ArticleEditor; onPickCover: () => void }) {
  const excerptRef = useRef<HTMLTextAreaElement>(null)
  const { doc } = ed
  return (
    <main className="mx-auto box-content max-w-text px-gutter pt-12 pb-32 md:pt-16">
      {doc.imageUrl ? (
        <figure className="group/cover relative mb-12 -mx-5 md:-mx-24">
          <img src={mediaSrc(doc.imageUrl)} alt={doc.imageAlt || ""} className="aspect-[16/8] w-full object-cover" />
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 transition-opacity group-hover/cover:opacity-100 group-focus-within/cover:opacity-100">
            <OverlayButton onClick={onPickCover}>Remplacer</OverlayButton>
            <OverlayButton onClick={() => ed.change({ imageUrl: "", imageAlt: "" })}>Retirer</OverlayButton>
          </div>
        </figure>
      ) : (
        <button
          type="button"
          onClick={onPickCover}
          className="mb-6 inline-flex items-center gap-2 rounded-sm px-2 py-1.5 text-small text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
        >
          <ImagePlusIcon className="size-4" />
          Ajouter une image de couverture
        </button>
      )}

      <textarea
        value={doc.title}
        onChange={(e) => ed.change({ title: e.target.value.replace(/\n/g, " ") })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            excerptRef.current?.focus()
          }
        }}
        placeholder="Titre"
        aria-label="Titre de l'article"
        maxLength={140}
        rows={1}
        autoFocus={!ed.item}
        className="w-full resize-none bg-transparent font-heading text-display font-semibold text-ink outline-none [field-sizing:content] placeholder:text-line-strong"
      />
      <textarea
        ref={excerptRef}
        value={doc.excerpt}
        onChange={(e) => ed.change({ excerpt: e.target.value.replace(/\n/g, " ") })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            const first = doc.blocks[0]
            if (first) document.querySelector<HTMLElement>(`[data-block-id="${first.id}"]`)?.focus()
            else ed.setBlocks([newBlock("p")])
          }
        }}
        placeholder="Chapô : une ou deux phrases qui donnent envie de lire (aussi affichées sur le blog)"
        aria-label="Chapô"
        maxLength={300}
        rows={1}
        className="mt-4 mb-10 w-full resize-none bg-transparent text-lead text-ink/75 outline-none [field-sizing:content] placeholder:text-ink-faint"
      />

      <Canvas blocks={doc.blocks} setBlocks={ed.setBlocks} />
    </main>
  )
}
