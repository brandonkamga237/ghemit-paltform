import { Link, Navigate, useParams } from "react-router"
import { motion } from "motion/react"
import { useEffect, useState, type ReactNode } from "react"
import { InfoIcon, CheckCircle2Icon, AlertTriangleIcon } from "lucide-react"
import type { Article, Block } from "@/data/content"
import { articleDate } from "@/data/remote"
import { fetchArticle, mediaUrl } from "@/lib/api"
import { cn } from "cn"
import { Container } from "@/components/site/bands"
import { imageSrcSet, Photo } from "@/components/site/photo"
import { Reveal } from "@/components/site/reveal"
import { Breadcrumb } from "@/components/site/page-header"
import { Button } from "@/components/ui/button"

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
      <div className="overflow-x-auto rounded-lg border border-sand-dark">
        <table className="w-full min-w-[480px] text-left">
          <thead>
            <tr className="border-b border-sand-dark bg-cream">
              {head.map((c, i) => (
                <th key={i} className="px-4 py-3 font-mono text-[12px] font-medium tracking-[0.08em] text-ink-faint uppercase">
                  {richText(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, i) => (
              <tr key={i} className="border-b border-sand last:border-0">
                {row.map((c, j) => (
                  <td key={j} className="px-4 py-3 text-[15.5px] leading-relaxed text-ink-muted">
                    {richText(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? (
        <figcaption className="text-center text-sm text-ink-faint">{caption}</figcaption>
      ) : null}
    </figure>
  )
}

const CALLOUT_TONES = {
  info: { icon: InfoIcon, className: "border-gehmit bg-gehmit/5" },
  success: { icon: CheckCircle2Icon, className: "border-gold bg-cream" },
  warning: { icon: AlertTriangleIcon, className: "border-amber-500 bg-amber-50" },
} as const

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return <h2 className="font-heading text-[28px] font-semibold">{richText(block.text)}</h2>
    case "h3":
      return <h3 className="font-heading text-[24px] font-semibold">{richText(block.text)}</h3>
    case "quote":
      return (
        <blockquote className="rounded-r-lg border-l-[3px] border-gold bg-cream px-7 py-6">
          <p className="font-heading text-[22px] leading-[1.5] text-navy italic">
            {richText(block.text)}
          </p>
          {block.cite ? (
            <cite className="mt-3 block text-sm not-italic text-ink-faint">— {block.cite}</cite>
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
            className="w-full rounded-lg object-cover"
          />
          {block.text ? (
            <figcaption className="text-center text-sm text-ink-faint">{block.text}</figcaption>
          ) : null}
        </figure>
      )
    case "video": {
      const embed = youtubeEmbed(block.url)
      return (
        <figure className="flex flex-col gap-2">
          {embed ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-navy">
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
              className="w-full rounded-lg"
            />
          )}
          {block.text ? (
            <figcaption className="text-center text-sm text-ink-faint">{block.text}</figcaption>
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
        <aside className={cn("flex gap-3.5 rounded-lg border-l-[3px] px-6 py-5", tone.className)}>
          <Icon className="mt-0.5 size-5 shrink-0 text-navy" />
          <p className="text-[17px] leading-[1.7] text-navy">{richText(block.text)}</p>
        </aside>
      )
    }
    case "hr":
      return <hr className="border-t border-sand" />
    case "ul":
      return (
        <ul className="list-disc space-y-2 pl-6 text-lg leading-[1.8] text-ink-muted">
          {block.text.split("\n").filter((l) => l.trim() !== "").map((line, idx) => (
            <li key={idx}>{richText(line)}</li>
          ))}
        </ul>
      )
    case "ol":
      return (
        <ol className="list-decimal space-y-2 pl-6 text-lg leading-[1.8] text-ink-muted">
          {block.text.split("\n").filter((l) => l.trim() !== "").map((line, idx) => (
            <li key={idx}>{richText(line)}</li>
          ))}
        </ol>
      )
    case "code":
      return (
        <pre className="overflow-x-auto rounded-lg bg-cream p-4">
          <code className="font-mono text-sm text-navy">{block.text}</code>
        </pre>
      )
    default:
      return <p className="text-lg leading-[1.8] text-ink-muted">{richText(block.text)}</p>
  }
}

/** Titre d'onglet et meta description propres à l'article. */
function useArticleMeta(article: Article | null) {
  useEffect(() => {
    if (!article) return
    const prevTitle = document.title
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const prevDesc = meta?.content
    document.title = `${article.title} — Gehmit`
    if (meta && article.excerpt) meta.content = article.excerpt
    return () => {
      document.title = prevTitle
      if (meta && prevDesc !== undefined) meta.content = prevDesc
    }
  }, [article])
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
        <Container className="flex flex-col items-center pt-16 pb-10">
          <div className="flex w-full max-w-[680px] flex-col gap-5">
            <div className="h-4 w-32 animate-pulse rounded bg-sand" />
            <div className="h-12 w-full animate-pulse rounded bg-sand" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-sand" />
          </div>
        </Container>
        <Container className="flex justify-center pb-12">
          <div className="h-[240px] w-full max-w-[1040px] animate-pulse rounded-lg bg-sand sm:h-[460px]" />
        </Container>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-surface">
      <Container className="flex flex-col items-center pt-16 pb-10">
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
          <div className="font-mono text-xs tracking-[0.14em] text-ink-faint uppercase">
            {articleDate(article)} · {article.readingMinutes} min de lecture
          </div>
          <h1 className="font-heading text-4xl leading-[1.14] font-semibold tracking-[-0.015em] text-balance sm:text-[44px]">
            {article.title}
          </h1>
          <p className="text-xl leading-relaxed text-ink-muted">{article.excerpt}</p>
        </motion.div>
      </Container>

      <Container className="flex justify-center pb-12">
        {article.imageUrl ? (
          <img
            src={mediaUrl(article.imageUrl)}
            srcSet={imageSrcSet(mediaUrl(article.imageUrl))}
            sizes="(max-width: 640px) 100vw, 1040px"
            alt={article.imageAlt ?? article.title}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="h-[240px] w-full max-w-[1040px] rounded-lg object-cover sm:h-[460px]"
          />
        ) : article.photoLabel ? (
          <Photo
            label={article.photoLabel}
            className="h-[240px] w-full max-w-[1040px] rounded-lg sm:h-[460px]"
          />
        ) : null}
      </Container>

      <Container className="flex flex-col items-center pb-16">
        <article className="flex w-full max-w-[680px] flex-col gap-6">
          {article.body.map((block, i) => (
            <Reveal key={i}>
              <BlockView block={block} />
            </Reveal>
          ))}
        </article>
      </Container>

      {article.cta ? (
        <section className="border-t border-sand bg-cream">
          <Container className="flex flex-wrap items-center justify-between gap-8 py-10">
            <div className="flex flex-col gap-1.5">
              <span className="font-heading text-2xl font-semibold">{article.cta.title}</span>
              <span className="text-base text-ink-muted">{article.cta.text}</span>
            </div>
            <Button
              render={<Link to={article.cta.to} />}
              className="h-12 rounded-md bg-gehmit px-7 text-base font-semibold whitespace-nowrap text-surface hover:bg-gehmit-hover"
            >
              {article.cta.label}
            </Button>
          </Container>
        </section>
      ) : null}
    </div>
  )
}
