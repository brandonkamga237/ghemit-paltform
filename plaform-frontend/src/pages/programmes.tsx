import { Link } from "react-router"
import { ArrowRightIcon } from "lucide-react"
import { usePrograms } from "@/data/remote"
import { parcours } from "@/data/parcours"
import { usePageMeta } from "@/lib/seo"
import { PageHero } from "@/components/site/page-header"
import { Container } from "@/components/site/bands"
import { CtaLink } from "@/components/site/cta"
import { StatusDot } from "@/components/site/status-pill"

export function ProgrammesPage() {
  const programs = usePrograms()
  usePageMeta("Programmes", "Le parcours Gehmit : s'orienter, se former, être accompagné, s'insérer. Conditions, durée, calendrier.")

  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "Accueil", to: "/" }, { label: "Programmes" }]}
        title={<>Quatre étapes, <span className="accent-word">une seule direction</span>.</>}
        lede="De la découverte des métiers au premier emploi. Commencez par l'étape qui vous ressemble : la candidature est directe, sans compte à créer, et la plupart des programmes sont gratuits."
        below={
          <Container>
            <nav aria-label="Étapes" className="grid grid-cols-2 gap-px border-y border-sand-dark bg-sand-dark sm:grid-cols-4">
              {parcours.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="group flex items-baseline gap-2.5 bg-cream py-5 pr-3 transition-colors hover:bg-surface [&:not(:nth-child(2n+1))]:pl-5 sm:[&:not(:first-child)]:pl-5"
                >
                  <span className="tnum text-[14px] font-semibold text-gold">{i + 1}</span>
                  <span className="font-heading text-[20px] text-navy italic group-hover:text-gehmit sm:text-[22px]">
                    {s.verb}
                  </span>
                </a>
              ))}
            </nav>
          </Container>
        }
      />

      {parcours.map((stage, i) => (
        <section
          key={stage.id}
          id={stage.id}
          className={"scroll-mt-20 " + (i % 2 === 0 ? "bg-surface" : "bg-cream")}
        >
          <Container className="grid gap-10 py-16 lg:grid-cols-12 lg:gap-10 lg:py-20">
            <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
              <span className="tnum font-heading text-[56px] leading-none font-semibold text-gold/80">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-heading text-[36px] leading-tight font-normal text-navy italic">{stage.verb}</h2>
              <p className="max-w-[320px] text-[17px] leading-relaxed text-ink-muted">{stage.text}</p>
            </div>

            <ul className="flex flex-col border-t border-sand-dark lg:col-span-8">
              {stage.offers.map((o) => {
                const p = programs.find((x) => x.slug === o.programSlug)
                const closed = p?.status === "closed"
                return (
                  <li key={o.name} className="flex flex-col gap-4 border-b border-sand-dark py-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                      <Link
                        to={o.to}
                        className="font-heading text-[30px] leading-tight font-semibold text-navy transition-colors hover:text-gehmit"
                      >
                        {o.name}
                      </Link>
                      {p && (
                        <span className="flex items-center gap-2 text-[14.5px] font-semibold text-navy">
                          <StatusDot status={p.status} />
                          {p.statusLabel}
                        </span>
                      )}
                    </div>
                    <p className="max-w-[620px] text-[17px] leading-relaxed text-navy/75">
                      {p?.description ?? o.line}
                    </p>
                    {p?.meta?.length ? (
                      <ul className="flex flex-wrap gap-x-2 gap-y-1 text-[15px] text-ink-muted">
                        {p.meta.map((m, k) => (
                          <li key={m} className="flex items-center gap-2">
                            {k > 0 && <span aria-hidden className="text-sand-dark">·</span>}
                            {m}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
                      {p && p.detail && !p.primaryCta.disabled && !closed ? (
                        <CtaLink to={p.primaryCta.to}>{p.primaryCta.label}</CtaLink>
                      ) : null}
                      <Link
                        to={o.to}
                        className="group inline-flex items-center gap-2 text-[15.5px] font-semibold text-gehmit underline-offset-4 hover:underline"
                      >
                        {p?.detail ? "Le programme en détail" : closed ? "M'avertir à l'ouverture" : "Découvrir"}
                        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Container>
        </section>
      ))}
    </div>
  )
}
