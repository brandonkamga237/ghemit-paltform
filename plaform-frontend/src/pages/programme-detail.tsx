import { Link, Navigate, useParams } from "react-router"
import { motion } from "motion/react"
import { CheckIcon } from "lucide-react"
import { usePrograms } from "@/data/remote"
import { Photo } from "@/components/site/photo"
import { Reveal } from "@/components/site/reveal"
import { Container } from "@/components/site/bands"
import { StatusPill } from "@/components/site/status-pill"
import { Button } from "@/components/ui/button"

const ease = [0.22, 1, 0.36, 1] as const

export function ProgrammeDetailPage() {
  const { slug } = useParams()
  const programs = usePrograms()
  const program = programs.find((p) => p.slug === slug)

  if (!program || !program.detail) {
    return <Navigate to="/programmes" replace />
  }
  const d = program.detail
  const closed = program.status === "closed"

  return (
    <div className="flex flex-col">
      {/* Héros — bannière compacte (page secondaire) */}
      <section className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          className="flex flex-col justify-center gap-4 bg-gehmit px-6 py-10 sm:px-11"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease }}
        >
          <span className="font-mono text-xs tracking-[0.16em] text-surface/65 uppercase">
            Programmes / {program.name}
          </span>
          <motion.h1
            className="font-heading text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-surface sm:text-4xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
          >
            {d.heroTitle}
          </motion.h1>
          <motion.p
            className="max-w-[420px] text-lg leading-[1.65] text-surface/90"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease }}
          >
            {d.heroText}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease }}
          >
            {closed ? (
              <Button
                render={<Link to="/contact" />}
                className="h-12 rounded-md bg-surface px-7 text-base font-semibold text-gehmit hover:bg-cream"
              >
                M'avertir à l'ouverture
              </Button>
            ) : (
              <Button
                render={<Link to={`/candidature/${program.slug}`} />}
                className="h-12 rounded-md bg-surface px-7 text-base font-semibold text-gehmit hover:bg-cream"
              >
                Candidater
              </Button>
            )}
          </motion.div>
        </motion.div>
        <div className="min-h-[200px] lg:min-h-[260px]">
          <Photo
            photo={program.photo}
            alt={program.photoAlt}
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
        </div>
      </section>

      {/* Bandeau de faits */}
      <section className="border-b border-sand bg-surface">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 lg:grid-cols-4">
          {d.facts.map((f, i) => (
            <div
              key={f.label}
              className={
                "flex flex-col gap-1 px-8 py-6 " +
                (i > 0 ? "border-l border-sand " : "") +
                (i === 2 ? "max-lg:border-t max-lg:border-l-0 " : "") +
                (i === 3 ? "max-lg:border-t" : "")
              }
            >
              <span className="font-mono text-[11px] tracking-[0.12em] text-ink-faint uppercase">
                {f.label}
              </span>
              <span className="text-lg font-semibold">{f.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Contenu + barre latérale */}
      <section className="bg-surface">
        <Container className="grid items-start gap-12 py-16 lg:grid-cols-[1fr_360px] lg:gap-14">
          <div className="flex max-w-[680px] flex-col gap-10">
            {d.sections.map((s) => (
              <Reveal key={s.title} className="flex flex-col gap-4">
                <h2 className="font-heading text-[28px] font-semibold">{s.title}</h2>
                {s.body ? (
                  <p className="text-[17px] leading-[1.75] text-ink-muted">{s.body}</p>
                ) : null}
                {s.list ? (
                  <ul className="flex flex-col gap-3">
                    {s.list.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckIcon className="mt-1 size-[18px] shrink-0 text-gehmit" strokeWidth={2} />
                        <span className="text-[16.5px] leading-relaxed text-ink-muted">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Reveal>
            ))}

            <Reveal className="flex flex-col gap-4">
              <h2 className="font-heading text-[28px] font-semibold">Déroulé</h2>
              <div className="flex flex-col">
                {d.steps.map((step, i) => (
                  <div
                    key={step.title}
                    className={
                      "grid grid-cols-[52px_1fr] gap-5 border-t border-sand py-[18px] " +
                      (i === d.steps.length - 1 ? "border-b" : "")
                    }
                  >
                    <span className="font-mono text-sm text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-[17px] font-semibold">{step.title}</span>
                      <span className="text-base text-ink-muted">{step.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Latérale collante */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-28">
            <Reveal className="flex flex-col gap-3.5 rounded-lg border border-sand-dark bg-cream p-6">
              <StatusPill status={program.status} label={program.statusLabel} />
              <span className="font-heading text-[21px] leading-[1.3] font-semibold">
                {d.sideTitle}
              </span>
              <p className="text-[15.5px] leading-relaxed text-ink-muted">{d.sideText}</p>
              {closed ? (
                <Button
                  render={<Link to="/contact" />}
                  className="h-12 rounded-md bg-gehmit text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
                >
                  {d.sidePrimary}
                </Button>
              ) : (
                <Button
                  render={<Link to={`/candidature/${program.slug}`} />}
                  className="h-12 rounded-md bg-gehmit text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
                >
                  {d.sidePrimary}
                </Button>
              )}
              {d.sideSecondary ? (
                <Button
                  variant="outline"
                  render={<Link to={program.slug === "glab-sisters" ? "/partenaire" : "/contact"} />}
                  className="h-12 rounded-md border-navy text-[15px] font-semibold text-navy hover:bg-navy hover:text-surface"
                >
                  {d.sideSecondary}
                </Button>
              ) : null}
            </Reveal>
            <Reveal delay={0.08} className="flex flex-col gap-3 rounded-lg border border-sand bg-surface p-6">
              <span className="font-mono text-[11px] tracking-[0.12em] text-ink-faint uppercase">
                Programmes liés
              </span>
              {programs
                .filter((p) => d.related.includes(p.slug))
                .map((rp) => (
                  <Link
                    key={rp.slug}
                    to={rp.slug === "formations" ? "/formations" : `/programmes/${rp.slug}`}
                    className="text-base font-semibold text-gehmit transition-colors hover:text-gehmit-deep"
                  >
                    {rp.name} →
                  </Link>
                ))}
            </Reveal>
          </div>
        </Container>
      </section>
    </div>
  )
}
