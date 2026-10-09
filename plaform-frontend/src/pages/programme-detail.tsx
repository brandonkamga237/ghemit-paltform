import { Link, Navigate, useParams } from "react-router"
import { CheckIcon } from "lucide-react"
import { usePrograms } from "@/data/remote"
import { stageOf, parcours } from "@/data/parcours"
import { Figure } from "@/components/site/photo"
import { Container } from "@/components/site/bands"
import { CtaLink } from "@/components/site/cta"
import { Parcours } from "@/components/site/parcours"
import { StatusDot } from "@/components/site/status-pill"
import { Breadcrumb } from "@/components/site/page-header"
import { usePageMeta } from "@/lib/seo"


export function ProgrammeDetailPage() {
  const { slug } = useParams()
  const programs = usePrograms()
  const program = programs.find((p) => p.slug === slug)
  usePageMeta(program?.name, program?.description)

  if (!program || !program.detail) {
    return <Navigate to="/programmes" replace />
  }
  const d = program.detail
  const closed = program.status === "closed"
  const applyTo = closed ? "/contact" : `/candidature/${program.slug}`
  const applyLabel = closed ? "M'avertir à l'ouverture" : "Candidater"
  const secondaryTo = program.slug === "glab-sisters" ? "/partenaire" : "/contact"
  const stage = stageOf(program.slug)
  const stageIndex = stage ? parcours.indexOf(stage) + 1 : 0

  return (
    <div className="flex flex-col">
      {/* En-tête : le programme en une phrase, et sa preuve en image */}
      <section className="overflow-x-clip bg-cream">
        <Container className="grid gap-10 pt-8 pb-12 lg:grid-cols-12 lg:gap-x-10 lg:pt-12 lg:pb-16">
          <div
            className="flex flex-col gap-6 lg:col-span-7">
            <Breadcrumb trail={[{ label: "Programmes", to: "/programmes" }, { label: program.name }]} />
            {stage && (
              <p className="text-[15px] text-ink-muted">
                Étape {stageIndex} du parcours ·{" "}
                <span className="font-heading text-navy italic">{stage.verb}</span>
              </p>
            )}
            <h1 className="font-heading text-[48px] leading-[1] font-semibold tracking-[-0.03em] text-navy sm:text-[72px] lg:text-[88px]">
              {d.heroTitle}
            </h1>
            <p className="max-w-[560px] text-[20px] leading-[1.55] text-navy/80 sm:text-[22px]">{d.heroText}</p>
            <div className="flex flex-col gap-4 pt-2">
              <span className="flex items-center gap-2.5 text-[15.5px] font-semibold text-navy">
                <StatusDot status={program.status} />
                {d.sideTitle}
              </span>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <CtaLink to={applyTo} arrow>
                  {applyLabel}
                </CtaLink>
              </div>
            </div>
          </div>

          <div
            className="lg:col-span-5 lg:-mr-10 xl:-mr-[max(2.5rem,calc((100vw-1240px)/2+2.5rem))]">
            <Figure
              photo={program.photo}
              alt={program.photoAlt}
              position={program.photoPosition}
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              frameClassName="aspect-[4/3] lg:aspect-auto lg:h-[480px]"
            />
          </div>
        </Container>

        {/* Faits clés */}
        <Container>
          <dl className="grid grid-cols-2 border-t border-sand-dark lg:grid-cols-4">
            {d.facts.map((f, i) => (
              <div
                key={f.label}
                className={
                  "flex flex-col gap-1.5 py-6 pr-4 " +
                  (i % 2 === 1 ? "border-l border-sand-dark pl-5 " : "") +
                  (i === 2 ? "lg:border-l lg:border-sand-dark lg:pl-5 " : "") +
                  (i >= 2 ? "max-lg:border-t max-lg:border-sand-dark" : "")
                }
              >
                <dt className="text-[14px] text-ink-muted">{f.label}</dt>
                <dd className="font-heading text-[22px] leading-tight font-semibold text-navy sm:text-[26px]">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Contenu + encart de candidature */}
      <section className="bg-surface">
        <Container className="grid items-start gap-14 py-16 lg:grid-cols-12 lg:gap-10 lg:py-24">
          <div className="flex flex-col gap-16 lg:col-span-7">
            {d.sections.map((s) => (
              <div key={s.title} className="flex flex-col gap-5">
                <h2 className="font-heading text-[30px] leading-tight font-semibold text-navy">{s.title}</h2>
                {s.body ? (
                  <p className="max-w-[640px] text-[19px] leading-[1.7] text-navy/80">{s.body}</p>
                ) : null}
                {s.list ? (
                  <ul className="flex max-w-[640px] flex-col border-t border-sand">
                    {s.list.map((item) => (
                      <li key={item} className="flex items-start gap-4 border-b border-sand py-4">
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-open-bg text-gehmit">
                          <CheckIcon className="size-3.5" strokeWidth={2.5} />
                        </span>
                        <span className="text-[17px] leading-relaxed text-navy/85">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}

            <div className="flex flex-col gap-6">
              <h2 className="font-heading text-[30px] leading-tight font-semibold text-navy">Comment ça se passe</h2>
              <ol className="flex max-w-[640px] flex-col">
                {d.steps.map((step, i) => (
                  <li key={step.title} className="relative grid grid-cols-[44px_1fr] gap-4 pb-8 last:pb-0">
                    {i < d.steps.length - 1 && (
                      <span aria-hidden className="absolute top-9 bottom-1 left-[15px] w-px bg-sand-dark" />
                    )}
                    <span className="tnum flex size-8 items-center justify-center rounded-full border border-gold text-[14px] font-semibold text-navy">
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-[18px] font-semibold text-navy">{step.title}</span>
                      <span className="text-[16.5px] leading-relaxed text-ink-muted">{step.text}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <aside className="flex flex-col gap-5 bg-navy p-7 text-surface lg:sticky lg:top-24 lg:col-span-4 lg:col-start-9 lg:p-8">
            <span className="flex items-center gap-2.5 text-[14px] font-semibold text-surface/75">
              <StatusDot status={program.status} />
              {program.statusLabel}
            </span>
            <span className="font-heading text-[26px] leading-[1.2] font-semibold">
              {closed ? "Être averti de la réouverture" : "Votre candidature"}
            </span>
            <p className="text-[15.5px] leading-relaxed text-surface/70">{d.sideText}</p>
            <div className="flex flex-col gap-2.5 pt-1">
              <CtaLink to={applyTo} variant={closed ? "inverse" : "primary"} className="w-full">
                {d.sidePrimary}
              </CtaLink>
              {d.sideSecondary ? (
                <CtaLink to={secondaryTo} variant="outline-inverse" className="w-full">
                  {d.sideSecondary}
                </CtaLink>
              ) : null}
            </div>
            <p className="border-t border-white/10 pt-4 text-[14px] text-surface/55">
              Une question ?{" "}
              <Link to="/contact" className="font-semibold text-surface underline-offset-4 hover:underline">
                Écrivez-nous
              </Link>
            </p>
          </aside>
        </Container>
      </section>

      {/* Où se situe ce programme */}
      <section className="border-t border-sand bg-cream">
        <Container className="flex flex-col gap-10 py-16 lg:py-24">
          <h2 className="max-w-[640px] font-heading text-[30px] leading-[1.15] font-semibold text-navy sm:text-[38px]">
            {program.name} dans votre parcours, <span className="accent-word">et la suite</span>.
          </h2>
          <Parcours current={program.slug} />
        </Container>
      </section>
    </div>
  )
}
