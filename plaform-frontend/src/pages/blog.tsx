import { useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"
import { cn } from "cn"
import { useArticleSummaries } from "@/data/remote"
import { usePageMeta } from "@/lib/seo"
import { Container } from "@/components/site/bands"
import { ArticleCard } from "@/components/site/cards"
import { PageHero } from "@/components/site/page-header"

export function BlogPage() {
  usePageMeta("Blog", "Récits, retours d'expérience et conseils de l'équipe Gehmit sur les métiers du numérique.")
  const articles = useArticleSummaries()
  const [cat, setCat] = useState("Tous")
  const [query, setQuery] = useState("")

  const categories = useMemo(
    () => ["Tous", ...new Set((articles ?? []).map((a) => a.category).filter(Boolean))],
    [articles]
  )

  const list = (articles ?? []).filter((a) => {
    const okCat = cat === "Tous" || a.category === cat
    const okQuery = !query || (a.title + " " + a.excerpt).toLowerCase().includes(query.toLowerCase())
    return okCat && okQuery
  })
  const filtering = cat !== "Tous" || query !== ""
  const lead = filtering ? undefined : (list.find((a) => a.featured) ?? list[0])
  const rest = list.filter((a) => a !== lead)

  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "Accueil", to: "/" }, { label: "Blog" }]}
        title={<>Récits, conseils <span className="accent-word">et coulisses</span>.</>}
        lede="Ce que nous apprenons sur le terrain, les parcours de celles et ceux que nous accompagnons, et des repères pour choisir sa voie."
      />

      <section className="bg-surface">
        <Container className="flex flex-col gap-12 py-10 lg:py-14">
          <div className="flex flex-col gap-4 border-b border-sand-dark pb-6 lg:flex-row lg:items-center lg:justify-between">
            {categories.length > 1 ? (
              <div className="flex flex-wrap gap-x-5 gap-y-2" role="group" aria-label="Rubriques">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={cat === c}
                    onClick={() => setCat(c)}
                    className={cn(
                      "relative h-10 text-[15.5px] transition-colors",
                      cat === c
                        ? "font-semibold text-navy after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-gehmit"
                        : "text-ink-muted hover:text-navy"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : (
              <span />
            )}
            <label className="flex h-11 w-full items-center gap-2.5 border-b border-navy/30 focus-within:border-gehmit lg:max-w-[320px]">
              <SearchIcon className="size-4 text-ink-muted" />
              <span className="sr-only">Rechercher un article</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un article"
                className="w-full bg-transparent text-[16px] text-navy outline-none placeholder:text-ink-faint"
              />
            </label>
          </div>

          {articles === null ? (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-[4/3] animate-pulse bg-cream" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-start gap-3 py-10">
              <p className="font-heading text-[28px] text-navy">
                {articles.length === 0 ? "Les premiers articles arrivent bientôt." : "Aucun article ne correspond."}
              </p>
              {filtering && (
                <button
                  type="button"
                  onClick={() => {
                    setCat("Tous")
                    setQuery("")
                  }}
                  className="text-[16px] font-semibold text-gehmit underline-offset-4 hover:underline"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            <>
              {lead ? <ArticleCard article={lead} lead /> : null}
              {rest.length > 0 && (
                <div className="grid gap-x-8 gap-y-14 border-t border-sand-dark pt-12 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((a) => (
                    <ArticleCard key={a.slug} article={a} />
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </div>
  )
}
