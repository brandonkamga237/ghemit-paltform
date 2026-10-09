import { Link } from "react-router"
import { cn } from "@/lib/cn"
import type { ArticleSummary } from "@/data/content"
import { articleDate } from "@/data/remote"
import { mediaUrl, imageSrcSet } from "@/lib/api"

/**
 * Article de blog, à la manière d'une page de magazine : image, date et
 * rubrique, titre, chapô. `lead` = mise en avant sur deux colonnes.
 */
export function ArticleCard({ article, lead = false }: { article: ArticleSummary; lead?: boolean }) {
  return (
    <Link
      to={`/blog/${article.slug}`}
      className={cn("group grid gap-5", lead && "lg:grid-cols-12 lg:items-center gap-block")}
    >
      <div className={cn("aspect-[4/3] overflow-hidden bg-sand", lead && "lg:col-span-7 lg:aspect-[16/10]")}>
        {article.imageUrl ? (
          <img
            src={mediaUrl(article.imageUrl)}
            srcSet={imageSrcSet(mediaUrl(article.imageUrl))}
            sizes={lead ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            alt={article.imageAlt ?? article.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-end bg-navy p-6">
            <span className="font-heading text-h3 text-surface/80 italic">{article.category || "Gehmit"}</span>
          </div>
        )}
      </div>
      <div className={cn("flex flex-col gap-3", lead && "lg:col-span-5")}>
        <span className="text-small text-ink-muted">
          {[articleDate(article), article.category, `${article.readingMinutes} min`].filter(Boolean).join(" · ")}
        </span>
        <span
          className={cn(
            "font-heading leading-[1.2] font-semibold text-navy decoration-1 underline-offset-4 group-hover:underline",
            lead ? "text-h3" : "text-h3"
          )}
        >
          {article.title}
        </span>
        <p className={cn("leading-relaxed text-navy/70", lead ? "text-body" : "line-clamp-3 text-body")}>
          {article.excerpt}
        </p>
      </div>
    </Link>
  )
}
