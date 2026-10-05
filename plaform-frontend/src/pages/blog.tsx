import { useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"
import { cn } from "cn"
import { useArticleSummaries } from "@/data/remote"
import { Container } from "@/components/site/bands"
import { Breadcrumb } from "@/components/site/page-header"
import { ArticleCard } from "@/components/site/cards"
import { Reveal } from "@/components/site/reveal"
import { motion } from "motion/react"
import { usePageMeta } from "@/lib/seo"

export function BlogPage() {
  usePageMeta("Blog", "Actualités, retours d'expérience et conseils de l'équipe Gehmit.")
  const articles = useArticleSummaries()
  const [cat, setCat] = useState("Tous")
  const [query, setQuery] = useState("")

  const categories = useMemo(
    () => ["Tous", ...new Set((articles ?? []).map((a) => a.category).filter(Boolean))],
    [articles]
  )

  const list = (articles ?? []).filter((a) => {
    const okCat = cat === "Tous" || a.category === cat
    const okQuery =
      !query || (a.title + " " + a.excerpt).toLowerCase().includes(query.toLowerCase())
    return okCat && okQuery
  })
  const featured = list.find((a) => a.featured)
  const rest = list.filter((a) => a !== featured)

  return (
    <div className="flex flex-col bg-cream">
      <Container className="flex flex-wrap items-end justify-between gap-8 pt-14 pb-8">
        <motion.div
          className="flex flex-col gap-3.5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Breadcrumb trail={[{ label: "Accueil", to: "/" }, { label: "Blog" }]} />
          <h1 className="font-heading text-4xl leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[46px]">
            Le blog
          </h1>
        </motion.div>
        <label className="flex h-12 w-full max-w-[320px] items-center gap-2.5 rounded-md border border-sand-dark bg-white px-4">
          <SearchIcon className="size-4 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-ink-faint"
          />
        </label>
      </Container>

      {categories.length > 1 ? (
        <Container className="flex flex-wrap gap-2.5 pb-8">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "h-10 rounded-full px-4 text-sm transition-colors duration-150",
                cat === c
                  ? "bg-navy font-semibold text-surface"
                  : "border border-sand-dark bg-surface hover:border-navy"
              )}
            >
              {c}
            </button>
          ))}
        </Container>
      ) : null}

      <Container className="flex flex-col gap-8 pb-16">
        {articles === null ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[320px] animate-pulse rounded-lg border border-sand-dark bg-surface"
              />
            ))}
          </div>
        ) : (
          <>
            {featured ? (
              <Reveal>
                <ArticleCard article={featured} large />
              </Reveal>
            ) : null}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((a, i) => (
                <Reveal key={a.slug} delay={i * 0.06}>
                  <ArticleCard article={a} />
                </Reveal>
              ))}
            </div>
            {list.length === 0 && (
              <p className="py-10 text-center text-[15.5px] text-ink-muted">
                Aucun article ne correspond à cette recherche.
              </p>
            )}
          </>
        )}
      </Container>
    </div>
  )
}
