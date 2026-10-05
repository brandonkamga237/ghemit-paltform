import { Link } from "react-router"
import { motion } from "motion/react"
import { ArrowRightIcon } from "lucide-react"
import { stats } from "@/data/content"
import { useArticleSummaries, useEvents, usePrograms } from "@/data/remote"
import { Photo } from "@/components/site/photo"
import { PartnerLogos } from "@/components/site/partner-logos"
import { Reveal } from "@/components/site/reveal"
import { ArticleCard, ProgramCard } from "@/components/site/cards"
import { Container, SectionHeading, StatBand } from "@/components/site/bands"
import { Button } from "@/components/ui/button"

const ease = [0.22, 1, 0.36, 1] as const

const MONTHS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
]

export function HomePage() {
  const programs = usePrograms()
  const articles = useArticleSummaries()
  const events = useEvents()
  const upcoming = (events ?? []).filter((e) => e.upcoming !== false).slice(0, 3)
  const featured = ["mentorat", "formations", "glab-sisters"]
    .map((s) => programs.find((p) => p.slug === s)!)
    .filter(Boolean)

  return (
    <div className="flex flex-col">
      {/* Héros — panneau vert, photo qui chevauche la bande suivante */}
      <section className="bg-gehmit">
        <Container className="grid items-center gap-10 pt-16 pb-24 lg:grid-cols-2 lg:gap-14 lg:pt-[76px] lg:pb-[60px]">
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease }}
          >
            <motion.span
              className="h-0.5 w-14 bg-gold"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease }}
            />
            <motion.h1
              className="font-heading text-4xl leading-[1.06] font-medium tracking-[-0.02em] text-balance text-surface sm:text-[54px]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.55, ease }}
            >
              Votre place dans le numérique existe.
            </motion.h1>
            <motion.p
              className="text-[19px] leading-relaxed text-surface/90"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.55, ease }}
            >
              Nous vous aidons à la trouver.
            </motion.p>
            <motion.div
              className="pt-2"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.55, ease }}
            >
              <Button
                render={<Link to="/programmes" />}
                className="h-12 gap-2.5 rounded-md bg-surface px-7 text-base font-semibold text-gehmit hover:bg-cream"
              >
                Découvrir les programmes
                <ArrowRightIcon className="size-[17px]" />
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative z-10 lg:-mb-[200px] lg:self-end"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease }}
          >
            <Photo
              dark
              photo="seminaire-public"
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              alt="Participants au séminaire Gehmit « De la recherche à l'innovation »"
              className="h-[300px] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.10),0_1px_3px_rgba(0,0,0,0.06)] sm:h-[380px] lg:h-[560px]"
            />
          </motion.div>
        </Container>
      </section>

      {/* Programmes */}
      <section className="bg-cream">
        <Container className="flex flex-col gap-7 py-16 lg:pt-[170px]">
          <Reveal>
            <SectionHeading title="Cinq programmes" linkLabel="Tout voir" linkTo="/programmes" />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <ProgramCard program={p} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Chiffres */}
      <StatBand stats={stats} tone="navy" />

      {/* Prochains événements — n'apparaît que si l'agenda est rempli */}
      {upcoming.length > 0 && (
        <section className="bg-surface">
          <Container className="flex flex-col gap-7 py-16">
            <Reveal>
              <SectionHeading
                title="Prochains événements"
                linkLabel="Tout l'agenda"
                linkTo="/evenements"
              />
            </Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {upcoming.map((e, i) => {
                const m = e.date.match(/^(\d{4})-(\d{2})-(\d{2})/)
                return (
                  <Reveal key={`${e.title}-${e.date}`} delay={i * 0.08}>
                    <Link
                      to="/evenements"
                      className="group flex h-full gap-4 rounded-lg border border-sand-dark bg-cream p-5 transition-colors hover:border-gehmit/50"
                    >
                      <div className="flex w-14 shrink-0 flex-col items-center gap-0.5 border-r border-sand pr-4">
                        <span className="font-heading text-2xl leading-none font-semibold text-navy">
                          {m ? Number(m[3]) : "—"}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.08em] text-ink-faint uppercase">
                          {m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : ""}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-[15.5px] leading-snug font-semibold text-navy group-hover:text-gehmit">
                          {e.title}
                        </span>
                        <span className="text-[13.5px] text-ink-faint">
                          {[e.time, e.location].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                )
              })}
            </div>
          </Container>
        </section>
      )}

      {/* TechPath */}
      <section className="grid bg-surface lg:grid-cols-2">
        <div className="min-h-[280px] lg:min-h-[340px]">
          <Photo
            photo="seminaire-presentation"
            alt="Présentation sur écran lors du séminaire Gehmit"
            className="h-full"
          />
        </div>
        <Reveal className="flex flex-col justify-center gap-5 px-6 py-14 sm:px-11">
          <span className="mono-label">Solutions</span>
          <h2 className="font-heading text-3xl leading-[1.15] font-semibold sm:text-[34px]">
            Pas encore décidé ? TechPath vous oriente.
          </h2>
          <p className="max-w-[460px] text-[17px] leading-[1.65] text-ink-muted">
            Un coach conversationnel et un annuaire d'écoles, puis une recommandation
            vers le programme qui correspond.
          </p>
          <Button
            variant="outline"
            render={<Link to="/solutions" />}
            className="h-12 self-start rounded-md border-navy px-7 text-base font-semibold text-navy hover:bg-navy hover:text-surface"
          >
            Ouvrir TechPath
          </Button>
        </Reveal>
      </section>

      {/* Publications */}
      <section className="bg-cream">
        <Container className="flex flex-col gap-7 py-16">
          <Reveal>
            <SectionHeading
              title="Publications récentes"
              linkLabel="Voir le blog"
              linkTo="/blog"
            />
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
            {articles === null ? (
              <div
                className="col-span-full h-[280px] animate-pulse rounded-lg border border-sand-dark bg-surface"
                aria-busy="true"
              />
            ) : (
              articles.slice(0, 3).map((a, i) => (
                <Reveal key={a.slug} delay={i * 0.08}>
                  <ArticleCard article={a} large={i === 0} />
                </Reveal>
              ))
            )}
          </div>
        </Container>
      </section>

      {/* Partenaires */}
      <PartnerLogos title="Ils nous accompagnent" />
    </div>
  )
}
