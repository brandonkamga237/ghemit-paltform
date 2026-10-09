import { Link } from "react-router"
import type { ReactNode } from "react"
import { cn } from "cn"
import { parcours } from "@/data/parcours"
import { Container } from "./bands"

export function Breadcrumb({ trail }: { trail: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-[14px]">
      {trail.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-faint">/</span>}
          {item.to ? (
            <Link to={item.to} className="text-ink-muted underline-offset-4 transition-colors hover:text-gehmit hover:underline">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="font-semibold text-navy">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

/** « Étape N du parcours · Verbe » pour une offre du parcours. */
export function StageLine({ offer }: { offer: string }) {
  const i = parcours.findIndex((s) => s.offers.some((o) => o.name === offer || o.programSlug === offer))
  if (i < 0) return null
  return (
    <p className="text-[15px] text-ink-muted">
      Étape {i + 1} du parcours ·{" "}
      <Link to="/programmes" className="font-heading text-navy italic underline-offset-4 hover:underline">
        {parcours[i].verb}
      </Link>
    </p>
  )
}

/**
 * En-tête de page : fil d'Ariane, titre éditorial, chapô, actions, et en
 * option un visuel (photo légendée) qui déborde à droite sur grand écran.
 */
export function PageHero({
  trail,
  kicker,
  title,
  lede,
  actions,
  aside,
  below,
  className,
}: {
  trail: { label: string; to?: string }[]
  kicker?: ReactNode
  title: ReactNode
  lede?: ReactNode
  actions?: ReactNode
  aside?: ReactNode
  below?: ReactNode
  className?: string
}) {
  return (
    <section className={cn("overflow-x-clip bg-cream", className)}>
      <Container
        className={cn(
          "grid gap-10 pt-8 pb-12 lg:gap-x-10 lg:pt-12",
          aside ? "lg:grid-cols-12 lg:pb-16" : "lg:pb-14"
        )}
      >
        <div
          className={cn("flex flex-col gap-6", aside ? "lg:col-span-7" : "max-w-[860px]")}>
          <Breadcrumb trail={trail} />
          {kicker}
          <h1 className="font-heading text-[40px] leading-[1.04] font-semibold tracking-[-0.025em] text-navy sm:text-[56px] lg:text-[64px]">
            {title}
          </h1>
          {lede ? (
            <div className="max-w-[600px] text-[19px] leading-[1.6] text-navy/75 sm:text-[20px]">{lede}</div>
          ) : null}
          {actions ? <div className="flex flex-wrap items-center gap-x-7 gap-y-4 pt-1">{actions}</div> : null}
        </div>
        {aside ? (
          <div
            className="lg:col-span-5 lg:-mr-10 xl:-mr-[max(2.5rem,calc((100vw-1240px)/2+2.5rem))]">
            {aside}
          </div>
        ) : null}
      </Container>
      {below}
    </section>
  )
}

/** Registre de chiffres ou de faits sous un en-tête (2 colonnes mobile, 4 desktop). */
export function Ledger({ items, tone = "light" }: { items: { label: string; value: string }[]; tone?: "light" | "dark" }) {
  const line = tone === "dark" ? "border-white/15" : "border-sand-dark"
  return (
    <Container>
      <dl className={cn("grid grid-cols-2 border-t lg:grid-cols-4", line)}>
        {items.map((f, i) => (
          <div
            key={f.label}
            className={cn(
              "flex flex-col gap-1.5 py-6 pr-4",
              i % 2 === 1 && cn("border-l pl-5", line),
              i === 2 && cn("lg:border-l lg:pl-5", line),
              i >= 2 && cn("max-lg:border-t", line)
            )}
          >
            <dt className={cn("order-2 text-[14.5px]", tone === "dark" ? "text-surface/65" : "text-ink-muted")}>
              {f.label}
            </dt>
            <dd
              className={cn(
                "tnum order-1 font-heading text-[24px] leading-tight font-semibold sm:text-[32px]",
                tone === "dark" ? "text-surface" : "text-navy"
              )}
            >
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
    </Container>
  )
}

/**
 * Lignes éditoriales titre / texte : remplace les blocs « trois colonnes »
 * répétés de page en page.
 */
export function InfoRows({ rows, className }: { rows: { title: string; text: ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("flex flex-col border-t border-sand-dark", className)}>
      {rows.map((r) => (
        <div key={r.title} className="grid gap-2 border-b border-sand py-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
          <dt className="font-heading text-[22px] leading-snug font-semibold text-navy">{r.title}</dt>
          <dd className="max-w-[620px] text-[17px] leading-relaxed text-navy/75">{r.text}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Titre de section avec phrase d'accompagnement optionnelle. */
export function SectionTitle({ title, text, className }: { title: ReactNode; text?: ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-12 lg:items-end", className)}>
      <h2 className="font-heading text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] text-navy sm:text-[40px] lg:col-span-7">
        {title}
      </h2>
      {text ? (
        <p className="max-w-[440px] text-[17px] leading-relaxed text-ink-muted lg:col-span-5 lg:justify-self-end">{text}</p>
      ) : null}
    </div>
  )
}
