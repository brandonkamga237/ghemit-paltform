import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
import { PenLineIcon, SearchIcon, StarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, mediaSrc } from "@/lib/api"
import type { ContentItem } from "@/lib/types"
import { PageHeader } from "@/components/admin/page-header"

type Filter = "all" | "published" | "draft"

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
const fmt = (iso: string) => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : "—"
}
const isDraft = (a: ContentItem) => a.payload.status === "draft"

/** Liste des articles du blog ; chaque ligne ouvre l'éditeur pleine page. */
export function ArticlesPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ContentItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [q, setQ] = useState("")

  useEffect(() => {
    api
      .get<ContentItem[]>("/api/admin/content/articles")
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Chargement impossible"))
  }, [])

  const counts = useMemo(() => {
    const all = items ?? []
    return { all: all.length, published: all.filter((a) => !isDraft(a)).length, draft: all.filter(isDraft).length }
  }, [items])

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return (items ?? [])
      .filter((a) => (filter === "all" ? true : filter === "draft" ? isDraft(a) : !isDraft(a)))
      .filter((a) => !query || `${a.payload.title ?? ""} ${a.payload.excerpt ?? ""} ${a.payload.category ?? ""}`.toLowerCase().includes(query))
      .sort((a, b) => {
        // Brouillons d'abord (le travail en cours), puis par date de publication.
        if (isDraft(a) !== isDraft(b)) return isDraft(a) ? -1 : 1
        return String(b.payload.publishedAt ?? b.updatedAt).localeCompare(String(a.payload.publishedAt ?? a.updatedAt))
      })
  }, [items, filter, q])

  return (
    <div className="flex flex-col gap-group">
      <PageHeader
        title="Articles"
        description="Le blog du site. Un brouillon n'est jamais visible en ligne."
        actions={
          <Link
            to="/articles/nouveau"
            className="inline-flex h-10 items-center gap-2 rounded-sm bg-gehmit px-4 text-small font-semibold text-surface transition-colors hover:bg-gehmit-hover"
          >
            <PenLineIcon className="size-4" />
            Écrire un article
          </Link>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-5" role="tablist" aria-label="Filtrer">
          {(
            [
              ["all", "Tous"],
              ["published", "Publiés"],
              ["draft", "Brouillons"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={cn(
                "relative h-9 text-small transition-colors",
                filter === key
                  ? "font-semibold text-navy after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-gehmit"
                  : "text-ink-muted hover:text-navy"
              )}
            >
              {label} <span className="tnum text-ink-faint">{counts[key]}</span>
            </button>
          ))}
        </div>
        <label className="flex h-10 w-full items-center gap-2 border-b border-sand-dark focus-within:border-gehmit sm:w-[280px]">
          <SearchIcon className="size-4 text-ink-muted" />
          <span className="sr-only">Rechercher</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Titre, rubrique…"
            className="w-full bg-transparent text-small text-navy outline-none placeholder:text-ink-faint"
          />
        </label>
      </div>

      {error ? (
        <p className="bg-destructive/5 px-5 py-4 text-small text-destructive">Impossible de charger les articles : {error}</p>
      ) : items === null ? (
        <div className="flex flex-col gap-px" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse bg-surface" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-start gap-3 border-y border-sand-dark py-block">
          <p className="font-heading text-h3 text-navy">
            {items.length === 0 ? "Aucun article pour l'instant." : "Aucun article ne correspond."}
          </p>
          {items.length === 0 && (
            <Link to="/articles/nouveau" className="text-small font-semibold text-gehmit hover:underline">
              Écrire le premier article →
            </Link>
          )}
        </div>
      ) : (
        <ul className="flex flex-col border-t border-sand-dark bg-surface">
          {rows.map((a) => {
            const p = a.payload
            return (
              <li key={a.id} className="border-b border-sand">
                <button
                  type="button"
                  onClick={() => navigate(`/articles/${a.id}`)}
                  className="group grid w-full grid-cols-[72px_1fr] items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-cream/70 sm:grid-cols-[96px_1fr_auto] sm:gap-5"
                >
                  <span className="aspect-[4/3] w-full overflow-hidden bg-sand">
                    {p.imageUrl ? (
                      <img src={mediaSrc(String(p.imageUrl))} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : null}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-heading text-lead font-semibold text-navy group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                        {String(p.title || "Sans titre")}
                      </span>
                      {p.featured ? <StarIcon className="size-4 shrink-0 fill-gold text-gold" aria-label="À la une" /> : null}
                    </span>
                    <span className="truncate text-small text-ink-muted">{String(p.excerpt ?? "")}</span>
                  </span>
                  <span className="col-span-2 flex items-center gap-4 text-caption sm:col-span-1 sm:flex-col sm:items-end sm:gap-1">
                    <span className={cn("inline-flex items-center gap-1.5 font-semibold", isDraft(a) ? "text-ink-muted" : "text-gehmit")}>
                      <span className={cn("size-1.5 rounded-full", isDraft(a) ? "bg-ink-faint" : "bg-gehmit")} />
                      {isDraft(a) ? "Brouillon" : "Publié"}
                    </span>
                    <span className="tnum text-ink-muted">
                      {[p.category ? String(p.category) : null, isDraft(a) ? null : fmt(String(p.publishedAt ?? ""))].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
