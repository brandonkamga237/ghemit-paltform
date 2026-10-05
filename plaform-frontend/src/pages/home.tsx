import { Link } from "react-router"
import { motion } from "motion/react"
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react"
import { stats } from "@/data/content"
import { useArticleSummaries, useEvents, usePrograms } from "@/data/remote"
import { Photo } from "@/components/site/photo"
import { PartnerLogos } from "@/components/site/partner-logos"
import { Reveal } from "@/components/site/reveal"
import { ArticleCard } from "@/components/site/cards"
import { Container, SectionHeading, StatBand } from "@/components/site/bands"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

const ease = [0.22, 1, 0.36, 1] as const

const MONTHS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
]

const statusLabel = { open: "Ouvert", soon: "Bientôt", closed: "Fermé" } as const
const statusCls = {
  open: "bg-gehmit/12 text-open-text",
  soon: "bg-soon-bg text-soon-text",
  closed: "bg-sand text-ink-muted",
} as const

export function HomePage() {
  const programs = usePrograms()
  const articles = useArticleSummaries()
  const events = useEvents()
  const upcoming = (events ?? []).filter((e) => e.upcoming !== false).slice(0, 3)

  return (
    <div className="flex flex-col">
      {/* Héros — panneau vert, diptyque photo qui chevauche la bande suivante */}
      <section className="bg-gehmit">
        <Container className="grid items-center gap-10 pt-16 pb-16 lg:grid-cols-2 lg:gap-14 lg:pt-[76px] lg:pb-[60px]">
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
              className="flex flex-wrap gap-3 pt-2"
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
              <Button
                variant="outline"
                render={<Link to="/a-propos" />}
                className="h-12 rounded-md border-surface/35 bg-transparent px-6 text-base font-semibold text-surface hover:bg-surface/10"
              >
                Qui sommes-nous
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative z-10 hidden lg:-mb-[200px] lg:block lg:self-end"
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

      {/* Programmes — index éditorial numéroté */}
      <section className="bg-cream">
        <Container className="flex flex-col gap-7 py-16 lg:pt-[170px]">
          <Reveal>
            <SectionHeading title="Nos programmes" linkLabel="Tout voir" linkTo="/programmes" />
          </Reveal>
          <Reveal className="overflow-hidden rounded-xl border border-sand-dark bg-surface">
            <div className="flex flex-col divide-y divide-sand">
              {programs.map((p, i) => (
                <Link
                  key={p.slug}
                  to={p.slug === "formations" ? "/formations" : `/programmes/${p.slug}`}
                  className="group flex items-center gap-5 px-5 py-5 transition-colors hover:bg-cream sm:px-7"
                >
                  <span className="tnum w-10 shrink-0 font-mono text-[13px] tracking-[0.08em] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-heading text-[19px] font-semibold text-navy transition-colors group-hover:text-gehmit">
                      {p.name}
                    </span>
                    <span className="truncate text-[14.5px] text-ink-muted">
                      {p.cardDescription}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "hidden shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold sm:inline",
                      statusCls[p.status as keyof typeof statusCls] ?? statusCls.closed
                    )}
                  >
                    {statusLabel[p.status as keyof typeof statusLabel] ?? p.status}
                  </span>
                  <ArrowUpRightIcon className="size-5 shrink-0 text-ink-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gehmit" />
                </Link>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Chiffres */}
      <StatBand stats={stats} tone="navy" />

      {/* Prochains événements — lignes agenda, pas de cartes */}
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
            <div className="flex flex-col divide-y divide-sand border-y border-sand">
              {upcoming.map((e, i) => {
                const m = e.date.match(/^(\d{4})-(\d{2})-(\d{2})/)
                return (
                  <Reveal key={`${e.title}-${e.date}`} delay={i * 0.06}>
                    <Link
                      to="/evenements"
                      className="group flex items-center gap-6 py-5 transition-colors hover:bg-cream/60 sm:px-2"
                    >
                      <div className="flex w-16 shrink-0 flex-col items-center gap-0.5">
                        <span className="font-heading text-[30px] leading-none font-semibold text-gehmit">
                          {m ? Number(m[3]) : "—"}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.08em] text-ink-faint uppercase">
                          {m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : ""}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-[17px] leading-snug font-semibold text-navy group-hover:text-gehmit">
                          {e.title}
                        </span>
                        <span className="text-[14px] text-ink-faint">
                          {[e.time, e.location].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                      <ArrowRightIcon className="size-5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-gehmit" />
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

      {/* Bande photo pleine largeur — respiration */}
      <section className="relative">
        <Photo
          photo="seminaire-laureats"
          alt="Lauréats du séminaire Gehmit"
          className="h-[280px] sm:h-[360px]"
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-navy/80 via-navy/25 to-transparent p-7 sm:p-11">
          <Reveal>
            <p className="max-w-[520px] font-heading text-2xl leading-[1.25] font-semibold text-surface sm:text-[30px]">
              « De la recherche à l'innovation » — chaque rencontre ouvre une porte.
            </p>
          </Reveal>
        </div>
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
