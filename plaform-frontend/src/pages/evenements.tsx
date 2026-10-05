import { Link } from "react-router"
import { CalendarDaysIcon, ClockIcon, MapPinIcon } from "lucide-react"
import { cn } from "cn"
import type { EventItem } from "@/data/content"
import { useEvents } from "@/data/remote"
import { mediaUrl } from "@/lib/api"
import { usePageMeta } from "@/lib/seo"
import { imageSrcSet } from "@/components/site/photo"
import { PageHeader } from "@/components/site/page-header"
import { Container } from "@/components/site/bands"
import { Reveal } from "@/components/site/reveal"
import { Button } from "@/components/ui/button"

const MONTHS_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
]

function dateParts(iso: string): { day: string; month: string; year: string } | null {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? { day: String(Number(m[3])), month: MONTHS_SHORT[Number(m[2]) - 1], year: m[1] } : null
}

function longDate(iso: string): string {
  const p = dateParts(iso)
  return p ? `${p.day} ${p.month} ${p.year}` : iso
}

/** Carte d'un événement à venir : badge date, visuel éventuel, détails, action. */
function EventCard({ event }: { event: EventItem }) {
  const d = dateParts(event.date)
  const cancelled = event.cancelled === true
  return (
    <div
      className={cn(
        "grid overflow-hidden rounded-lg border border-sand-dark bg-surface sm:grid-cols-[88px_1fr]",
        cancelled && "opacity-[0.72]"
      )}
    >
      <div className="flex items-center gap-2 border-b border-sand bg-cream px-5 py-4 sm:flex-col sm:items-start sm:justify-center sm:border-r sm:border-b-0 sm:px-0 sm:py-0 sm:text-center">
        <div className="flex w-full flex-col items-center gap-0.5">
          <span className="font-heading text-3xl leading-none font-semibold text-navy">{d?.day ?? "—"}</span>
          <span className="font-mono text-[11px] tracking-[0.1em] text-ink-faint uppercase">
            {d ? `${d.month} ${d.year}` : "—"}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-[24px] font-semibold">{event.title}</h2>
          {cancelled ? (
            <span className="rounded-full border border-sand-dark px-3 py-0.5 font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase">
              Annulé
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-[15px] text-ink-muted">
          {event.time ? (
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="size-4 text-ink-faint" />
              {event.time}
            </span>
          ) : null}
          {event.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="size-4 text-ink-faint" />
              {event.location}
            </span>
          ) : null}
        </div>
        {event.imageUrl ? (
          <img
            src={mediaUrl(event.imageUrl)}
            srcSet={imageSrcSet(mediaUrl(event.imageUrl))}
            sizes="(max-width: 640px) 100vw, 760px"
            alt={event.title}
            loading="lazy"
            decoding="async"
            className="max-h-[280px] w-full rounded-lg object-cover"
          />
        ) : null}
        {event.description ? (
          <p className="max-w-[640px] text-[16px] leading-[1.65] text-ink-muted">
            {event.description}
          </p>
        ) : null}
        {!cancelled && event.registerUrl ? (
          <div className="pt-1">
            {event.registerUrl.startsWith("/") ? (
              <Button
                render={<Link to={event.registerUrl} />}
                className="h-11 rounded-md bg-gehmit px-6 text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
              >
                S'inscrire
              </Button>
            ) : (
              <Button
                render={<a href={event.registerUrl} target="_blank" rel="noreferrer" />}
                className="h-11 rounded-md bg-gehmit px-6 text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
              >
                S'inscrire
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function EvenementsPage() {
  const events = useEvents()
  usePageMeta("Événements", "Forums, ateliers et rencontres organisés par Gehmit et ses partenaires.")
  const upcoming = (events ?? []).filter((e) => e.upcoming !== false)
  const past = (events ?? []).filter((e) => e.upcoming === false)

  return (
    <div className="flex flex-col">
      <Container>
        <PageHeader
          trail={[{ label: "Accueil", to: "/" }, { label: "Événements" }]}
          title="L'agenda Gehmit"
          lede="Forums, ateliers et rencontres organisés par l'équipe et ses partenaires."
        />
      </Container>

      <Container className="flex flex-col gap-6 pb-16">
        {events === null ? (
          <div className="flex flex-col gap-6" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="h-[160px] animate-pulse rounded-lg border border-sand-dark bg-surface" />
            ))}
          </div>
        ) : upcoming.length > 0 ? (
          upcoming.map((e, i) => (
            <Reveal key={`${e.title}-${e.date}`} delay={i * 0.06}>
              <EventCard event={e} />
            </Reveal>
          ))
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-sand-dark bg-surface px-7 py-10">
            <span className="inline-flex items-center gap-2 text-[16px] font-semibold text-navy">
              <CalendarDaysIcon className="size-5" />
              Aucun événement à venir pour le moment
            </span>
            <p className="max-w-[520px] text-[15.5px] leading-relaxed text-ink-muted">
              Les prochains rendez-vous seront annoncés ici et sur le blog.
            </p>
          </div>
        )}

        {past.length > 0 ? (
          <div className="flex flex-col gap-4 pt-6">
            <span className="font-mono text-[12px] tracking-[0.12em] text-ink-faint uppercase">
              Événements passés
            </span>
            <ul className="flex flex-col divide-y divide-sand rounded-lg border border-sand-dark bg-surface">
              {past.map((e) => (
                <li
                  key={`${e.title}-${e.date}`}
                  className="flex flex-wrap items-baseline gap-x-6 gap-y-1 px-6 py-4"
                >
                  <span className="tnum w-[110px] shrink-0 font-mono text-[13px] text-ink-faint">
                    {longDate(e.date)}
                  </span>
                  <span className="text-[15.5px] font-semibold text-navy">{e.title}</span>
                  {e.location ? (
                    <span className="text-[14px] text-ink-faint">{e.location}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </div>
  )
}
