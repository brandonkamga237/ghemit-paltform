import { Link, Navigate, useParams } from "react-router"
import { motion } from "motion/react"
import { articles } from "@/data/content"
import { Container } from "@/components/site/bands"
import { Photo } from "@/components/site/photo"
import { Reveal } from "@/components/site/reveal"
import { Breadcrumb } from "@/components/site/page-header"
import { Button } from "@/components/ui/button"

const ease = [0.22, 1, 0.36, 1] as const

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
        <Photo
          label={article.photoLabel + " — 2080 × 920"}
          className="h-[240px] w-full max-w-[1040px] rounded-lg sm:h-[460px]"
        />
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
            return (
              <Reveal key={i}>
                <p className="text-lg leading-[1.8] text-ink-muted">{block.text}</p>
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
