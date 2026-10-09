import { cn } from "cn"
import type { EventItem } from "@/data/content"
import { useEvents } from "@/data/remote"
import { mediaUrl, imageSrcSet } from "@/lib/api"
import { usePageMeta } from "@/lib/seo"
import { Container } from "@/components/site/bands"
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
    <article className={cn("grid gap-6 border-t border-sand-dark py-10 lg:grid-cols-12 lg:gap-10", cancelled && "opacity-70")}>
      <div className="flex items-baseline gap-3 lg:col-span-2 lg:flex-col lg:gap-1">
        <span className="tnum font-heading text-[56px] leading-none font-semibold text-gehmit">{d?.day ?? "—"}</span>
        <span className="text-[15px] text-navy">
          {d ? `${d.month} ${d.year}` : ""}
        </span>
      </div>
      <div className={cn("flex flex-col gap-4", event.imageUrl ? "lg:col-span-5" : "lg:col-span-8")}>
        <div className="flex flex-col gap-2">
          {cancelled && (
            <span className="w-fit bg-sand px-2.5 py-1 text-[13px] font-semibold text-navy">Annulé</span>
          )}
          <h2 className={cn("font-heading text-[28px] leading-snug font-semibold text-navy", cancelled && "line-through decoration-1")}>
            {event.title}
          </h2>
          <p className="text-[16px] text-ink-muted">{[event.time, event.location].filter(Boolean).join(" · ")}</p>
        </div>
        {event.description ? (
          <p className="max-w-[620px] text-[17px] leading-relaxed text-navy/75">{event.description}</p>
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
        <div className="aspect-[16/10] overflow-hidden bg-sand lg:col-span-5">
          <img
            src={mediaUrl(event.imageUrl)}
            srcSet={imageSrcSet(mediaUrl(event.imageUrl))}
            sizes="(min-width: 1024px) 40vw, 100vw"
            alt={event.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
    </article>
  )
}

export function EvenementsPage() {
  const events = useEvents()
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
        <Container className="flex flex-col pt-4 pb-16 lg:pb-24">
          {events === null ? (
            <div className="flex flex-col gap-px pt-10" aria-busy="true">
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
            <div className="flex flex-col items-start gap-3 border-y border-sand-dark py-14">
              <p className="font-heading text-[30px] leading-tight text-navy">Aucun rendez-vous annoncé pour l'instant.</p>
              <p className="max-w-[540px] text-[17px] leading-relaxed text-ink-muted">
                Les prochaines dates sont publiées ici et dans la lettre mensuelle : inscrivez-vous en
                bas de page pour ne rien manquer.
              </p>
            </div>
          )}

          {past.length > 0 ? (
            <div className="flex flex-col gap-5 pt-16">
              <h2 className="font-heading text-[26px] font-semibold text-navy">Ils ont eu lieu</h2>
              <ul className="flex flex-col border-t border-sand-dark">
                {past.map((e) => {
                  const d = dateParts(e.date)
                  return (
                    <li key={`${e.title}-${e.date}`} className="grid gap-1 border-b border-sand py-4 sm:grid-cols-[180px_1fr_auto] sm:gap-6">
                      <span className="tnum text-[15px] text-ink-muted">{d ? `${d.day} ${d.month} ${d.year}` : e.date}</span>
                      <span className="text-[16.5px] font-semibold text-navy">{e.title}</span>
                      {e.location ? <span className="text-[15px] text-ink-muted">{e.location}</span> : null}
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
        </Container>
      </section>
    </div>
  )
}
