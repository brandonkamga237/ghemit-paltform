import { Link } from "react-router"
import { ArrowRightIcon } from "lucide-react"
import { achievements, donationEquivalences, stats, testimonials } from "@/data/content"
import { forCompanies } from "@/data/parcours"
import { articleDate, useArticleSummaries, useEvents } from "@/data/remote"
import { mediaUrl, imageSrcSet } from "@/lib/api"
import { Figure, Photo } from "@/components/site/photo"
import { PartnerLogos } from "@/components/site/partner-logos"
import { Parcours } from "@/components/site/parcours"
import { ArrowLink, CtaLink } from "@/components/site/cta"
import { Container } from "@/components/site/bands"


const MONTHS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
]

export function HomePage() {
  const articles = useArticleSummaries()
  const events = useEvents()
  const upcoming = (events ?? []).filter((e) => e.upcoming !== false).slice(0, 3)
  const [lead, ...others] = articles ?? []
  const testimonial = testimonials[0]

  return (
    <div className="flex flex-col">
      {/* 1. Qui, pour qui, et la preuve en image */}
      <section className="overflow-x-clip bg-cream">
        <Container className="grid gap-block pt-block pb-block lg:grid-cols-12">
          <div
            className="flex flex-col gap-group lg:col-span-7 lg:pt-6">
            <p className="text-small font-semibold text-ink-muted">
              Association à but non lucratif · Douala, Cameroun
            </p>
            <h1 className="font-heading text-display font-semibold text-navy">
              Former, inspirer, <span className="accent-word">connecter</span> les talents du numérique.
            </h1>
            <p className="max-w-[560px] text-lead text-ink-muted">
              Gehmit oriente, forme et accompagne les jeunes jusqu'à leur premier emploi dans
              le numérique, et les met en relation avec les entreprises qui recrutent. La plupart
              de nos programmes sont gratuits.
            </p>
            <div className="flex flex-wrap items-center gap-x-group gap-y-item pt-1">
              <CtaLink to="/programmes" arrow>
                Trouver mon programme
              </CtaLink>
              <ArrowLink to="/louer-developpeur">Je recrute un talent</ArrowLink>
            </div>
          </div>

          <div
            className="lg:col-span-5 lg:bleed-r">
            <Figure
              photo="seminaire-public"
              alt="Le public du séminaire Gehmit « De la recherche à l'innovation »"
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              frameClassName="aspect-[4/3] lg:aspect-auto lg:h-[540px]"
              position="50% 40%"
              caption="Séminaire « De la recherche à l'innovation », Douala, septembre 2025 — 120 participants."
            />
          </div>
        </Container>

        {/* Registre des chiffres : sobre, en pied de héros */}
        <Container>
          <dl className="grid grid-cols-2 border-t border-sand-dark lg:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={
                  "flex flex-col gap-1 py-6 pr-4" +
                  (i % 2 === 1 ? "pl-5 border-l border-sand-dark " : "") +
                  (i === 2 ? "lg:pl-5 lg:border-l lg:border-sand-dark " : "") +
                  (i >= 2 ? "max-lg:border-t max-lg:border-sand-dark" : "")
                }
              >
                <dt className="order-2 text-small text-ink-muted">{s.label}</dt>
                <dd className="tnum order-1 font-heading text-h1 leading-none font-semibold text-navy">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* 2. Le parcours : l'offre racontée comme un chemin */}
      <section className="bg-surface">
        <Container className="flex flex-col gap-block py-section">
          <div className="grid gap-group lg:grid-cols-12 lg:items-end">
            <h2 className="font-heading text-h2 font-semibold text-navy lg:col-span-7">
              Un parcours, <span className="accent-word">pas un catalogue</span>.
            </h2>
            <p className="max-w-[440px] text-body text-ink-muted lg:col-span-5 lg:justify-self-end">
              Où que vous en soyez, il y a une étape pour vous. Commencez par celle qui vous
              ressemble ; nous vous accompagnons vers la suivante.
            </p>
          </div>
          <Parcours />
          <p className="text-small text-ink-muted">
            Pas encore décidé ?{" "}
            <Link to="/solutions" className="font-semibold text-gehmit underline-offset-4 hover:underline">
              TechPath vous oriente en quelques questions
            </Link>
            .
          </p>
        </Container>
      </section>

      {/* 3. Sur le terrain : des dates, des lieux, des chiffres */}
      <section className="bg-navy text-surface">
        <Container className="flex flex-col gap-block py-section">
          <div className="flex flex-wrap items-end justify-between gap-group">
            <h2 className="max-w-[640px] font-heading text-h2 font-semibold">
              Sur le terrain, <span className="font-normal text-gold italic">pas seulement en ligne</span>.
            </h2>
            <Link
              to="/notre-impact"
              className="group inline-flex items-center gap-2 text-small font-semibold text-surface underline-offset-4 hover:underline"
            >
              Notre impact
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid gap-block md:grid-cols-3">
            {achievements.map((a) => (
              <article key={a.title} className="flex flex-col gap-5">
                {a.photo ? (
                  <div className="aspect-[4/3] overflow-hidden bg-navy-light">
                    <Photo photo={a.photo} alt={a.title} sizes="(min-width: 768px) 33vw, 100vw" />
                  </div>
                ) : null}
                <div className="flex flex-col gap-2 border-t border-white/15 pt-4">
                  <span className="text-caption font-semibold text-surface/55">{a.date}</span>
                  <span className="tnum font-heading text-h2 leading-none font-semibold text-gold">
                    {a.figure}
                  </span>
                  <h3 className="pt-1 text-body font-semibold">{a.title}</h3>
                  <p className="text-small text-surface/70">{a.text}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Une voix */}
      {testimonial && (
        <section className="bg-cream">
          <Container className="py-section">
            <figure className="mx-auto flex max-w-[920px] flex-col gap-group">
              <span aria-hidden className="font-heading text-display text-gold">
                “
              </span>
              <blockquote className="font-heading text-h2 text-navy italic">
                {testimonial.quote}
              </blockquote>
              <figcaption className="flex items-center gap-4">
                <span
                  aria-hidden
                  className="flex size-11 items-center justify-center rounded-full bg-gehmit text-small font-semibold text-surface"
                >
                  {testimonial.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
                <span className="flex flex-col">
                  <span className="text-body font-semibold text-navy">{testimonial.name}</span>
                  <span className="text-small text-ink-muted">{testimonial.place}</span>
                </span>
              </figcaption>
            </figure>
          </Container>
        </section>
      )}

      {/* 5. À venir et à lire — n'apparaissent que s'il y a du contenu */}
      {(upcoming.length > 0 || lead) && (
        <section className="bg-surface">
          <Container className="grid gap-block py-section lg:grid-cols-12">
            {upcoming.length > 0 && (
              <div className={lead ? "flex flex-col gap-group lg:col-span-5" : "flex flex-col gap-group lg:col-span-12"}>
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-heading text-h2 font-semibold text-navy">À venir</h2>
                  <ArrowLink to="/evenements">Agenda</ArrowLink>
                </div>
                <ul className="flex flex-col border-t border-sand-dark">
                  {upcoming.map((e) => {
                    const m = e.date.match(/^(\d{4})-(\d{2})-(\d{2})/)
                    return (
                      <li key={`${e.title}-${e.date}`} className="border-b border-sand">
                        <Link to="/evenements" className="group grid grid-cols-[64px_1fr] gap-4 py-5">
                          <span className="flex flex-col">
                            <span className="tnum font-heading text-h2 leading-none font-semibold text-gehmit">
                              {m ? Number(m[3]) : "—"}
                            </span>
                            <span className="pt-1 text-caption text-ink-muted">
                              {m ? MONTHS[Number(m[2]) - 1] : ""}
                            </span>
                          </span>
                          <span className="flex flex-col gap-1">
                            <span className="text-body font-semibold text-navy group-hover:text-gehmit">
                              {e.title}
                            </span>
                            <span className="text-small text-ink-muted">
                              {[e.time, e.location].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {lead && (
              <div className={upcoming.length > 0 ? "flex flex-col gap-group lg:col-span-7" : "flex flex-col gap-group lg:col-span-12"}>
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-heading text-h2 font-semibold text-navy">À lire</h2>
                  <ArrowLink to="/blog">Le blog</ArrowLink>
                </div>
                <Link to={`/blog/${lead.slug}`} className="group grid gap-5 border-t border-sand-dark pt-6 sm:grid-cols-[1.1fr_1fr]">
                  {lead.imageUrl ? (
                    <div className="aspect-[4/3] overflow-hidden bg-sand">
                      <img
                        src={mediaUrl(lead.imageUrl)}
                        srcSet={imageSrcSet(mediaUrl(lead.imageUrl))}
                        sizes="(min-width: 1024px) 30vw, 100vw"
                        alt={lead.imageAlt ?? lead.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-3">
                    <span className="text-caption text-ink-muted">
                      {[articleDate(lead), lead.category].filter(Boolean).join(" · ")}
                    </span>
                    <span className="font-heading text-h3 font-semibold text-navy group-hover:text-gehmit">
                      {lead.title}
                    </span>
                    <p className="line-clamp-3 text-small text-ink-muted">{lead.excerpt}</p>
                  </div>
                </Link>
                {others.slice(0, 2).map((a) => (
                  <Link
                    key={a.slug}
                    to={`/blog/${a.slug}`}
                    className="group flex items-baseline justify-between gap-group border-t border-sand pt-4"
                  >
                    <span className="text-body font-semibold text-navy group-hover:text-gehmit">
                      {a.title}
                    </span>
                    <span className="shrink-0 text-caption text-ink-muted">{articleDate(a)}</span>
                  </Link>
                ))}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* 6. Les deux autres publics : entreprises et donateurs */}
      <section className="grid lg:grid-cols-2">
        <div className="flex flex-col gap-group bg-surface px-gutter py-section lg:border-t lg:border-sand lg:pl-edge">
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-h2 font-semibold text-navy">
              Vous recrutez ?
            </h2>
            <p className="max-w-[440px] text-body text-ink-muted">
              Des profils formés et suivis par l'équipe, présentés sans commission.
            </p>
          </div>
          <ul className="flex max-w-[480px] flex-col border-t border-sand-dark">
            {forCompanies.map((o) => (
              <li key={o.name} className="border-b border-sand">
                <Link to={o.to} className="group flex items-center justify-between gap-4 py-4">
                  <span className="flex flex-col gap-0.5">
                    <span className="text-body font-semibold text-navy group-hover:text-gehmit">{o.name}</span>
                    <span className="text-small text-ink-muted">{o.line}</span>
                  </span>
                  <ArrowRightIcon className="size-4 shrink-0 text-ink-faint transition-all group-hover:translate-x-0.5 group-hover:text-gehmit" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-group bg-gold-tint px-gutter py-section lg:pr-edge">
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-h2 font-semibold text-navy">
              Un don finance un accompagnement.
            </h2>
            <p className="max-w-[440px] text-body text-ink-muted">
              Mobile Money, carte ou virement, une fois ou chaque mois.
            </p>
          </div>
          <dl className="flex max-w-[480px] flex-col border-t border-gold/40">
            {donationEquivalences.map((e) => (
              <div key={e.amount} className="flex items-baseline justify-between gap-4 border-b border-gold/25 py-4">
                <dt className="text-body text-navy">{e.text}</dt>
                <dd className="tnum font-heading text-h3 font-semibold text-navy">{e.amount}</dd>
              </div>
            ))}
          </dl>
          <CtaLink to="/don" variant="gold" arrow className="self-start">
            Faire un don
          </CtaLink>
        </div>
      </section>

      <PartnerLogos title="Ils nous accompagnent" />
    </div>
  )
}
