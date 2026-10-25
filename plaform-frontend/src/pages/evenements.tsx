import { useState } from "react"
import { cn } from "@/lib/cn"
import type { EventItem } from "@/data/content"
import { useEvents } from "@/data/remote"
import { usePageMeta } from "@/lib/seo"
import { Container } from "@/components/site/bands"
import { MediaImage } from "@/components/site/photo"
import { CtaLink } from "@/components/site/cta"
import { PageHero } from "@/components/site/page-header"

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
]

function dateParts(iso: string) {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? { day: String(Number(m[3])), month: MONTHS[Number(m[2]) - 1], year: m[1] } : null
}

function EventRow({ event }: { event: EventItem }) {
  const d = dateParts(event.date)
  const cancelled = event.cancelled === true
  const external = event.registerUrl && !event.registerUrl.startsWith("/")
  return (
    <article className={cn("grid gap-block border-t border-sand-dark py-block lg:grid-cols-12", cancelled && "opacity-70")}>
      <div className="flex items-baseline gap-3 lg:col-span-2 lg:flex-col lg:gap-1">
        {d ? (
          <>
            <span className="tnum font-heading text-display leading-none font-semibold text-gehmit">{d.day}</span>
            <span className="text-small text-navy">{`${d.month} ${d.year}`}</span>
          </>
        ) : (
          <span className="font-heading text-h3 text-gehmit italic">Date à confirmer</span>
        )}
      </div>
      <div className={cn("flex flex-col gap-4", event.imageUrl ? "lg:col-span-5" : "lg:col-span-8")}>
        <div className="flex flex-col gap-2">
          {cancelled && (
            <span className="w-fit bg-sand px-2.5 py-1 text-caption font-semibold text-navy">Annulé</span>
          )}
          <h2 className={cn("font-heading text-h2 font-semibold text-navy", cancelled && "line-through decoration-1")}>
            {event.title}
          </h2>
          <p className="text-body text-ink-muted">{[event.time, event.location].filter(Boolean).join(" · ")}</p>
        </div>
        {event.description ? (
          <p className="max-w-[620px] text-body text-navy/75">{event.description}</p>
        ) : null}
        {!cancelled && event.registerUrl ? (
          external ? (
            <CtaLink href={event.registerUrl} arrow className="self-start">S'inscrire</CtaLink>
          ) : (
            <CtaLink to={event.registerUrl} arrow className="self-start">S'inscrire</CtaLink>
          )
        ) : null}
      </div>
      {event.imageUrl ? (
        <MediaImage
          src={event.imageUrl}
          alt={event.title}
          sizes="(min-width: 1024px) 40vw, 100vw"
          frame="aspect-[16/10] overflow-hidden bg-sand lg:col-span-5"
        />
      ) : null}
    </article>
  )
}

/** Historique affiché d'emblée ; le reste sur demande. */
const PAST_SHOWN = 12

export function EvenementsPage() {
  const events = useEvents()
  const [showAllPast, setShowAllPast] = useState(false)
  usePageMeta("Événements", "Forums, ateliers et rencontres organisés par Gehmit et ses partenaires.")
  const upcoming = (events ?? []).filter((e) => e.upcoming !== false)
  const past = (events ?? []).filter((e) => e.upcoming === false)

  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "Accueil", to: "/" }, { label: "Événements" }]}
        title={<>L'agenda, <span className="accent-word">en vrai</span>.</>}
        lede="Forums, ateliers, caravanes et rencontres organisés par l'équipe et ses partenaires, à Douala et en ligne."
      />

      <section className="bg-surface">
        <Container className="flex flex-col pb-section">
          {events === null ? (
            <div className="flex flex-col gap-px pt-block" aria-busy="true">
              {[0, 1].map((i) => (
                <div key={i} className="h-40 animate-pulse bg-cream" />
              ))}
            </div>
          ) : upcoming.length > 0 ? (
            <div className="border-b border-sand-dark">
              {upcoming.map((e) => (
                <EventRow key={`${e.title}-${e.date}`} event={e} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 border-y border-sand-dark py-block">
              <p className="font-heading text-h2 text-navy">Aucun rendez-vous annoncé pour l'instant.</p>
              <p className="max-w-[540px] text-body text-ink-muted">
                Les prochaines dates sont publiées ici et dans la lettre mensuelle : inscrivez-vous en
                bas de page pour ne rien manquer.
              </p>
            </div>
          )}

          {past.length > 0 ? (
            <div className="flex flex-col gap-group pt-section">
              <h2 className="font-heading text-h3 font-semibold text-navy">Ils ont eu lieu</h2>
              <ul className="flex flex-col border-t border-sand-dark">
                {(showAllPast ? past : past.slice(0, PAST_SHOWN)).map((e) => {
                  const d = dateParts(e.date)
                  return (
                    <li key={`${e.title}-${e.date}`} className="grid gap-group border-b border-sand py-4 sm:grid-cols-[180px_1fr_auto]">
                      <span className="tnum text-small text-ink-muted">{d ? `${d.day} ${d.month} ${d.year}` : "Date inconnue"}</span>
                      <span className="text-body font-semibold text-navy">{e.title}</span>
                      {e.location ? <span className="text-small text-ink-muted">{e.location}</span> : null}
                    </li>
                  )
                })}
              </ul>
              {past.length > PAST_SHOWN && !showAllPast && (
                <button
                  type="button"
                  onClick={() => setShowAllPast(true)}
                  className="self-start text-small font-semibold text-gehmit underline-offset-4 hover:underline"
                >
                  Voir les {past.length - PAST_SHOWN} rendez-vous plus anciens
                </button>
              )}
            </div>
          ) : null}
        </Container>
      </section>
    </div>
  )
}
