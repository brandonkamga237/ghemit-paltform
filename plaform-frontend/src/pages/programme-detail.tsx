import { Link, Navigate, useParams } from "react-router"
import { CheckIcon } from "lucide-react"
import { usePrograms } from "@/data/remote"
import { stageOf, parcours } from "@/data/parcours"
import { Figure } from "@/components/site/photo"
import { Container, Section } from "@/components/site/section"
import { CtaLink } from "@/components/site/cta"
import { Parcours } from "@/components/site/parcours"
import { StatusDot } from "@/components/site/status-pill"
import { Breadcrumb } from "@/components/site/page-header"
import { usePageMeta } from "@/lib/seo"
import { Heading } from "@/components/site/heading"


export function ProgrammeDetailPage() {
  const { slug } = useParams()
  const programs = usePrograms()
  const program = programs.find((p) => p.slug === slug)
  usePageMeta(program?.name, program?.description)

  if (!program || !program.detail) {
    return <Navigate to="/programmes" replace />
  }
  const d = program.detail
  const closed = program.status === "closed" || program.status === "archived"
  const applyTo = closed ? "/contact" : `/candidature/${program.slug}`
  const applyLabel = closed ? "M'avertir à l'ouverture" : "Candidater"
  const secondaryTo = program.slug === "glab-sisters" ? "/partenaire" : "/contact"
  const stage = stageOf(program.slug)
  const stageIndex = stage ? parcours.indexOf(stage) + 1 : 0

  return (
    <div className="flex flex-col">
      {/* En-tête : le programme en une phrase, et sa preuve en image */}
      <section className="overflow-x-clip bg-surface-alt">
        <Container className="grid gap-block pt-block pb-block lg:grid-cols-12">
          <div
            className="flex flex-col gap-group lg:col-span-7">
            <Breadcrumb trail={[{ label: "Programmes", to: "/programmes" }, { label: program.name }]} />
            {stage && (
              <p className="text-small text-ink-muted">
                Étape {stageIndex} du parcours ·{" "}
                <span className="font-heading text-ink italic">{stage.verb}</span>
              </p>
            )}
            <h1 className="font-heading text-display font-semibold text-ink">
              {d.heroTitle}
            </h1>
            <p className="max-w-xl text-h3 text-ink/80">{d.heroText}</p>
            <div className="flex flex-col gap-4 pt-2">
              <span className="flex items-center gap-2.5 text-small font-semibold text-ink">
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
            className="lg:col-span-5 lg:bleed-r">
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
          <dl className="grid grid-cols-2 border-t border-line-strong lg:grid-cols-4">
            {d.facts.map((f, i) => (
              <div
                key={f.label}
                className={
                  "flex flex-col gap-1.5 py-6 pr-4 " +
                  (i % 2 === 1 ? "border-l border-line-strong pl-5 " : "") +
                  (i === 2 ? "lg:border-l lg:border-line-strong lg:pl-5 " : "") +
                  (i >= 2 ? "max-lg:border-t max-lg:border-line-strong" : "")
                }
              >
                <dt className="text-small text-ink-muted">{f.label}</dt>
                <dd className="font-heading text-h3 font-semibold text-ink">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Contenu + encart de candidature */}
      <Section className="grid items-start gap-block lg:grid-cols-12">
        <div className="flex flex-col gap-block lg:col-span-7">
          {d.sections.map((s) => (
            <div key={s.title} className="flex flex-col gap-5">
              <Heading>{s.title}</Heading>
              {s.body ? (
                <p className="max-w-2xl text-lead text-ink/80">{s.body}</p>
              ) : null}
              {s.list ? (
                <ul className="flex max-w-2xl flex-col border-t border-line">
                  {s.list.map((item) => (
                    <li key={item} className="flex items-start gap-4 border-b border-line py-4">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-open-bg text-gehmit">
                        <CheckIcon className="size-3.5" strokeWidth={2.5} />
                      </span>
                      <span className="text-body text-ink/85">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}

          <div className="flex flex-col gap-group">
            <Heading>Comment ça se passe</Heading>
            <ol className="flex max-w-2xl flex-col">
              {d.steps.map((step, i) => (
                <li key={step.title} className="relative grid grid-cols-[44px_1fr] gap-4 pb-8 last:pb-0">
                  {i < d.steps.length - 1 && (
                    <span aria-hidden className="absolute top-9 bottom-1 left-[15px] w-px bg-line-strong" />
                  )}
                  <span className="tnum flex size-8 items-center justify-center rounded-full border border-gehmit text-small font-semibold text-ink">
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-body font-semibold text-ink">{step.title}</span>
                    <span className="text-body text-ink-muted">{step.text}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="flex flex-col gap-5 bg-inverse p-7 text-surface lg:sticky lg:top-24 lg:col-span-4 lg:col-start-9 lg:p-8">
          <span className="flex items-center gap-2.5 text-small font-semibold text-surface/75">
            <StatusDot status={program.status} />
            {program.statusLabel}
          </span>
          <span className="font-heading text-h3 font-semibold">
            {closed ? "Être averti de la réouverture" : "Votre candidature"}
          </span>
          <p className="text-small text-surface/70">{d.sideText}</p>
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
          <p className="border-t border-white/10 pt-4 text-small text-surface/55">
            Une question ?{" "}
            <Link to="/contact" className="font-semibold text-surface underline-offset-4 hover:underline">
              Écrivez-nous
            </Link>
          </p>
        </aside>
      </Section>

      {/* Où se situe ce programme */}
      <section className="border-t border-line bg-surface-alt">
        <Container className="flex flex-col gap-block py-section">
          <Heading className="max-w-2xl">
            {program.name} dans votre parcours, <span className="accent-word">et la suite</span>.
          </Heading>
          <Parcours current={program.slug} />
        </Container>
      </section>
    </div>
  )
}
