import { Link, Navigate, useParams } from "react-router"
import { motion } from "motion/react"
import type { ReactNode } from "react"
import { articles } from "@/data/content"
import { API_URL } from "@/lib/api"
import { Container } from "@/components/site/bands"
import { Photo } from "@/components/site/photo"
import { Reveal } from "@/components/site/reveal"
import { Breadcrumb } from "@/components/site/page-header"
import { Button } from "@/components/ui/button"

const ease = [0.22, 1, 0.36, 1] as const

const mediaUrl = (url: string) => (url.startsWith("/") ? `${API_URL}${url}` : url)

/** Transforme les liens « [libellé](url) » insérés dans le texte en vrais liens. */
function linkify(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (!m) return part
    const [, label, href] = m
    if (href.startsWith("/")) {
      return (
        <Link key={i} to={href} className="font-medium text-gehmit underline underline-offset-4">
          {label}
        </Link>
      )
    }
    return (
      <a
        key={i}
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-gehmit underline underline-offset-4"
      >
        {label}
      </a>
    )
  })
}

export function ArticlePage() {
  const { slug } = useParams()
  const article = articles.find((a) => a.slug === slug)
  if (!article) return <Navigate to="/blog" replace />

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
            {article.date} · {article.readingTime}
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
            alt={article.title}
            className="h-[240px] w-full max-w-[1040px] rounded-lg object-cover sm:h-[460px]"
          />
        ) : (
          <Photo
            label={article.photoLabel + " — 2080 × 920"}
            className="h-[240px] w-full max-w-[1040px] rounded-lg sm:h-[460px]"
          />
        )}
      </Container>

      <Container className="flex flex-col items-center pb-16">
        <article className="flex w-full max-w-[680px] flex-col gap-6">
          {article.body.map((block, i) => {
            if (block.type === "h2") {
              return (
                <Reveal key={i}>
                  <h2 className="font-heading text-[28px] font-semibold">{block.text}</h2>
                </Reveal>
              )
            }
            if (block.type === "quote") {
              return (
                <Reveal key={i}>
                  <blockquote className="rounded-r-lg border-l-[3px] border-gold bg-cream px-7 py-6">
                    <p className="font-heading text-[22px] leading-[1.5] text-navy italic">
                      {block.text}
                    </p>
                  </blockquote>
                </Reveal>
              )
            }
            if (block.type === "image") {
              return (
                <Reveal key={i}>
                  <figure className="flex flex-col gap-2">
                    <img
                      src={mediaUrl(block.url)}
                      alt={block.text ?? ""}
                      className="w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                    {block.text ? (
                      <figcaption className="text-center text-sm text-ink-faint">
                        {block.text}
                      </figcaption>
                    ) : null}
                  </figure>
                </Reveal>
              )
            }
            return (
              <Reveal key={i}>
                <p className="text-lg leading-[1.8] text-ink-muted">{linkify(block.text)}</p>
              </Reveal>
            )
          })}
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
