import { Link } from "react-router"
import { ArrowRightIcon } from "lucide-react"
import { cn } from "cn"
import type { Article, Program } from "@/data/content"
import { Photo } from "./photo"
import { StatusPill } from "./status-pill"
import { Button } from "@/components/ui/button"

const cardBase =
  "group overflow-hidden rounded-lg border border-sand-dark bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color] duration-200 hover:border-gold hover:shadow-[0_4px_12px_rgba(0,0,0,0.10),0_1px_3px_rgba(0,0,0,0.06)]"

/** Carte programme — image, titre, statut, une ligne, un lien. */
export function ProgramCard({ program }: { program: Program }) {
  const to = program.slug === "formations" ? "/formations" : `/programmes/${program.slug}`
  return (
    <Link to={to} className={cn(cardBase, "flex flex-col")}>
      <div className="h-[220px] overflow-hidden">
        <Photo
          label={`Photo — ${program.name.toLowerCase()}`}
          className="h-full transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2.5">
          <span className="font-heading text-[22px] font-semibold">{program.name}</span>
          <StatusPill status={program.status} label={program.statusLabel} />
        </div>
        <p className="text-[15.5px] leading-[1.55] text-ink-muted">{program.cardDescription}</p>
        <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-gehmit">
          {program.cardLink}
          <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

/** Rangée programme de la liste — photo à gauche, détails et actions à droite. */
export function ProgramRow({ program }: { program: Program }) {
  const to = program.slug === "formations" ? "/formations" : `/programmes/${program.slug}`
  const closed = program.status === "closed"
  return (
    <div
      className={cn(
        "grid overflow-hidden rounded-lg border border-sand-dark bg-surface md:grid-cols-[minmax(0,380px)_1fr] lg:grid-cols-[440px_1fr]",
        closed && "opacity-[0.72]"
      )}
    >
      <Photo label={`Photo — ${program.name.toLowerCase()}`} className="min-h-[220px] md:min-h-[260px]" />
      <div className="flex flex-col justify-center gap-4 p-7 md:px-9">
        <div className="flex flex-wrap items-center gap-3">
          <Link to={to} className="font-heading text-[28px] font-semibold transition-colors hover:text-gehmit">
            {program.name}
          </Link>
          <StatusPill status={program.status} label={program.statusLabel} />
        </div>
        <p className="max-w-[560px] text-[16.5px] leading-[1.65] text-ink-muted">
          {program.description}
        </p>
        <div className="flex flex-wrap gap-x-7 gap-y-1 text-[15px] text-ink-faint">
          {program.meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          {program.primaryCta.disabled ? (
            <Button disabled className="h-12 rounded-md px-6 text-[15px] font-semibold">
              {program.primaryCta.label}
            </Button>
          ) : (
            <Button
              render={<Link to={program.primaryCta.to} />}
              className="h-12 rounded-md bg-gehmit px-6 text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
            >
              {program.primaryCta.label}
            </Button>
          )}
          {program.secondaryCta ? (
            <Button
              variant="outline"
              render={<Link to={program.secondaryCta.to} />}
              className="h-12 rounded-md border-navy px-6 text-[15px] font-semibold text-navy hover:bg-navy hover:text-surface"
            >
              {program.secondaryCta.label}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** Carte article de blog. */
export function ArticleCard({ article, large = false }: { article: Article; large?: boolean }) {
  return (
    <Link
      to={`/blog/${article.slug}`}
      className={cn(cardBase, "flex flex-col")}
    >
      <div className={cn("overflow-hidden", large ? "h-[280px]" : "h-[190px]")}>
        <Photo
          label={article.photoLabel}
          className="h-full transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-col gap-2.5 p-5">
        <span className="font-mono text-[11.5px] tracking-[0.12em] text-ink-faint uppercase">
          {article.date}
          {article.category ? ` · ${article.category}` : ""}
        </span>
        <span
          className={cn(
            "font-heading leading-[1.3] font-semibold",
            large ? "text-2xl" : "text-xl"
          )}
        >
          {article.title}
        </span>
        {large ? (
          <p className="text-[16.5px] leading-[1.65] text-ink-muted">{article.excerpt}</p>
        ) : null}
        <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-gehmit">
          {large ? "Lire l'article" : "Lire"}
          <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
