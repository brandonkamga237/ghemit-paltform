import { Link, Navigate, useParams } from "react-router"
import { motion } from "motion/react"
import { useEffect, useState, type ReactNode } from "react"
import { InfoIcon, CheckCircle2Icon, AlertTriangleIcon } from "lucide-react"
import type { Article, Block } from "@/data/content"
import { articleDate } from "@/data/remote"
import { fetchArticle, mediaUrl, imageSrcSet } from "@/lib/api"
import { usePageMeta } from "@/lib/seo"
import { cn } from "@/lib/cn"
import { Container } from "@/components/site/bands"
import { Photo } from "@/components/site/photo"
import { Breadcrumb } from "@/components/site/page-header"
import { CtaLink } from "@/components/site/cta"

const ease = [0.22, 1, 0.36, 1] as const

/** Transforme le markdown léger du rédacteur en éléments React. */
function richText(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    }
    if (/^\*[^*]+\*$/.test(part)) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>
    }
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (m) {
      const [, label, href] = m
      const className = "font-medium text-gehmit underline underline-offset-4"
      if (href.startsWith("/")) {
        return (
          <Link key={i} to={href} className={className}>
            {label}
          </Link>
        )
      }
      return (
        <a key={i} href={href} target="_blank" rel="noreferrer" className={className}>
          {label}
        </a>
      )
    }
    return part
  })
}

/** URL d'intégration pour YouTube (watch, youtu.be, shorts) ; null sinon. */
function youtubeEmbed(url: string): string | null {
  const m =
    url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([\w-]{6,})/) ??
    url.match(/youtu\.be\/([\w-]{6,})/)
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null
}

/** Une ligne `a | b | c` → cellules ; la première ligne sert d'en-tête. */
function TableBlock({ text, caption }: { text: string; caption?: string }) {
  const rows = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !/^\|?[\s:-]+\|[\s:|-]*$/.test(l))
    .map((l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()))
  if (rows.length === 0) return null
  const [head, ...body] = rows
  return (
    <figure className="flex flex-col gap-2">
      <div className="overflow-x-auto border-y border-sand-dark">
        <table className="w-full min-w-[480px] text-left">
          <thead>
            <tr className="border-b border-sand-dark bg-cream">
              {head.map((c, i) => (
                <th key={i} className="px-4 py-3 text-small font-semibold text-navy">
                  {richText(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, i) => (
              <tr key={i} className="border-b border-sand last:border-0">
                {row.map((c, j) => (
                  <td key={j} className="px-4 py-3 text-small text-ink-muted">
                    {richText(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <figcaption className="text-small text-ink-muted">{caption}</figcaption>
      ) : null}
    </figure>
  )
}

const CALLOUT_TONES = {
  info: { icon: InfoIcon, className: "bg-open-bg" },
  success: { icon: CheckCircle2Icon, className: "bg-gold-tint" },
  warning: { icon: AlertTriangleIcon, className: "bg-soon-bg" },
} as const

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return <h2 className="pt-4 font-heading text-h2 font-semibold text-navy">{richText(block.text)}</h2>
    case "h3":
      return <h3 className="pt-2 font-heading text-h3 font-semibold text-navy">{richText(block.text)}</h3>
    case "quote":
      return (
        <blockquote className="my-4 flex flex-col gap-3 border-y border-sand-dark py-8">
          <p className="font-heading text-h2 text-navy italic">
            {richText(block.text)}
          </p>
          {block.cite ? (
            <cite className="block text-small font-semibold not-italic text-ink-muted">{block.cite}</cite>
          ) : null}
        </blockquote>
      )
    case "image":
      return (
        <figure className="flex flex-col gap-2">
          <img
            src={mediaUrl(block.url)}
            srcSet={imageSrcSet(mediaUrl(block.url))}
            sizes="(max-width: 680px) 100vw, 680px"
            alt={block.alt ?? block.text ?? ""}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="w-full object-cover"
          />
          {block.text ? (
            <figcaption className="text-small text-ink-muted">{block.text}</figcaption>
          ) : null}
        </figure>
      )
    case "video": {
      const embed = youtubeEmbed(block.url)
      return (
        <figure className="flex flex-col gap-2">
          {embed ? (
            <div className="aspect-video w-full overflow-hidden bg-navy">
              <iframe
                src={embed}
                title={block.text ?? "Vidéo"}
                loading="lazy"
                allow="accelerometer; encrypted-media; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <video
              src={mediaUrl(block.url)}
              controls
              preload="metadata"
              className="w-full"
            />
          )}
          {block.text ? (
            <figcaption className="text-small text-ink-muted">{block.text}</figcaption>
          ) : null}
        </figure>
      )
    }
    case "table":
      return <TableBlock text={block.text} caption={block.caption} />
    case "callout": {
      const tone = CALLOUT_TONES[block.tone ?? "info"]
      const Icon = tone.icon
      return (
        <aside className={cn("flex gap-3.5 px-6 py-5", tone.className)}>
          <Icon className="mt-0.5 size-5 shrink-0 text-navy" />
          <p className="text-body text-navy">{richText(block.text)}</p>
        </aside>
      )
    }
    case "hr":
      return <hr className="border-t border-sand" />
    case "ul":
      return (
        <ul className="list-disc space-y-2 pl-6 text-lead text-navy/80 marker:text-gehmit">
          {block.text.split("\n").filter((l) => l.trim() !== "").map((line, idx) => (
            <li key={idx}>{richText(line)}</li>
          ))}
        </ul>
      )
    case "ol":
      return (
        <ol className="list-decimal space-y-2 pl-6 text-lead text-navy/80 marker:font-semibold marker:text-gehmit">
          {block.text.split("\n").filter((l) => l.trim() !== "").map((line, idx) => (
            <li key={idx}>{richText(line)}</li>
          ))}
        </ol>
      )
    case "code":
      return (
        <pre className="overflow-x-auto bg-navy p-5">
          <code className="font-mono text-small text-surface">{block.text}</code>
        </pre>
      )
    default:
      return <p className="text-lead text-navy/80">{richText(block.text)}</p>
  }
}

/** Titre d'onglet et meta description propres à l'article. */
function useArticleMeta(article: Article | null) {
  usePageMeta(article?.title, article?.excerpt)
}

export function ArticlePage() {
  const { slug } = useParams()
  const [state, setState] = useState<{ slug: string; article: Article | null } | null>(null)

  useEffect(() => {
    if (!slug) return
    let alive = true
    void fetchArticle(slug).then((article) => {
      if (alive) setState({ slug, article })
    })
    return () => {
      alive = false
    }
  }, [slug])

  const article = state !== null && state.slug === slug ? state.article : null
  useArticleMeta(article)

  if (state !== null && state.slug === slug && state.article === null) {
    return <Navigate to="/blog" replace />
  }

  if (!article) {
    return (
      <div className="flex flex-col bg-surface" aria-busy="true">
        <Container className="flex flex-col items-center pt-section pb-block">
          <div className="flex w-full max-w-[680px] flex-col gap-5">
            <div className="h-4 w-32 animate-pulse rounded bg-sand" />
            <div className="h-12 w-full animate-pulse rounded bg-sand" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-sand" />
          </div>
        </Container>
        <Container className="flex justify-center pb-block">
          <div className="h-[240px] w-full max-w-[1040px] animate-pulse bg-sand sm:h-[460px]" />
        </Container>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-surface">
      <Container className="flex flex-col items-center pt-section pb-block">
        <motion.div
          className="flex w-full max-w-[680px] flex-col gap-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <Breadcrumb
            trail={[
              { label: "Blog", to: "/blog" },
              { label: article.category },
            ]}
          />
          <p className="text-small text-ink-muted">
            {articleDate(article)} · {article.readingMinutes} min de lecture
          </p>
          <h1 className="font-heading text-display font-semibold text-navy">
            {article.title}
          </h1>
          <p className="text-lead text-navy/75">{article.excerpt}</p>
        </motion.div>
      </Container>

      <Container className="flex justify-center pb-block">
        {article.imageUrl ? (
          <img
            src={mediaUrl(article.imageUrl)}
            srcSet={imageSrcSet(mediaUrl(article.imageUrl))}
            sizes="(max-width: 640px) 100vw, 1040px"
            alt={article.imageAlt ?? article.title}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="h-[240px] w-full max-w-[1040px] object-cover sm:h-[480px]"
          />
        ) : article.photoLabel ? (
          <Photo
            label={article.photoLabel}
            className="h-[240px] w-full max-w-[1040px] sm:h-[480px]"
          />
        ) : null}
      </Container>

      <Container className="flex flex-col items-center pb-section">
        <article className="flex w-full max-w-[680px] flex-col gap-group">
          {article.body.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </article>
      </Container>

      {article.cta ? (
        <section className="bg-navy text-surface">
          <Container className="flex flex-wrap items-center justify-between gap-group py-block">
            <div className="flex flex-col gap-2">
              <span className="font-heading text-h2 font-semibold">{article.cta.title}</span>
              <span className="text-body text-surface/70">{article.cta.text}</span>
            </div>
            <CtaLink to={article.cta.to} arrow>
              {article.cta.label}
            </CtaLink>
          </Container>
        </section>
      ) : null}
    </div>
  )
}
