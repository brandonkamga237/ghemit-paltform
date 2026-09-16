import { Link } from "react-router"
import type { ReactNode } from "react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Reveal } from "./reveal"

/** Bande de chiffres — navy ou vert, Lora tabular-nums. */
export function StatBand({
  stats,
  tone = "navy",
}: {
  stats: { value: string; label: string; gold?: boolean }[]
  tone?: "navy" | "gehmit"
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4",
        tone === "navy" ? "bg-navy" : "bg-gehmit"
      )}
    >
      {stats.map((s, i) => (
        <Reveal
          key={s.label}
          delay={i * 0.06}
          className={cn(
            "flex flex-col gap-1.5 px-8 py-9 sm:py-11",
            i > 0 && "border-l border-white/15",
            i === 2 && "max-lg:border-l-0 max-lg:border-t max-lg:border-white/15",
            i === 3 && "max-lg:border-t max-lg:border-white/15"
          )}
        >
          <span
            className={cn(
              "tnum font-heading text-4xl leading-none font-semibold sm:text-[52px]",
              s.gold ? "text-gold" : "text-surface"
            )}
          >
            {s.value}
          </span>
          <span className="text-[15px] text-surface/75 sm:text-base">{s.label}</span>
        </Reveal>
      ))}
    </div>
  )
}

/** Bande d'appel à l'action en fin de page. */
export function CtaBand({
  title,
  text,
  ctaLabel,
  ctaTo,
  tone = "gehmit",
}: {
  title: string
  text?: string
  ctaLabel: string
  ctaTo: string
  tone?: "gehmit" | "navy"
}) {
  const gold = tone === "navy"
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-8 px-5 py-14 sm:px-10",
        tone === "navy" ? "bg-navy" : "bg-gehmit"
      )}
    >
      <div className="flex flex-col gap-2.5">
        <h2 className="max-w-[620px] font-heading text-3xl leading-[1.2] font-semibold text-surface">
          {title}
        </h2>
        {text ? <p className="text-[17px] text-surface/75">{text}</p> : null}
      </div>
      <Button
        render={<Link to={ctaTo} />}
        className={cn(
          "h-12 rounded-md px-7 text-base font-semibold whitespace-nowrap",
          gold
            ? "bg-gold text-navy hover:bg-gold-hover"
            : "bg-surface text-gehmit hover:bg-cream"
        )}
      >
        {ctaLabel}
      </Button>
    </div>
  )
}

/** Titre de section avec lien « tout voir ». */
export function SectionHeading({
  title,
  linkLabel,
  linkTo,
}: {
  title: string
  linkLabel?: string
  linkTo?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <h2 className="font-heading text-2xl font-semibold sm:text-3xl">{title}</h2>
      {linkLabel && linkTo ? (
        <Link
          to={linkTo}
          className="text-[15.5px] font-semibold whitespace-nowrap text-gehmit transition-colors hover:text-gehmit-deep hover:underline"
        >
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  )
}

export function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1240px] px-5 sm:px-10", className)}>
      {children}
    </div>
  )
}
