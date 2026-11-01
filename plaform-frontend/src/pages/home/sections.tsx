import { Link } from "react-router"
import type { ArticleSummary, EventItem } from "@/data/content"
import { achievements, donationEquivalences } from "@/data/content"
import { forCompanies } from "@/data/parcours"
import { articleDate } from "@/data/remote"
import { dateParts } from "@/lib/date"
import { MediaImage, Photo } from "@/components/site/photo"
import { ArrowLink, CtaLink } from "@/components/site/cta"
import { Section } from "@/components/site/section"
import { Heading, SectionHeader } from "@/components/site/heading"
import { LinkList } from "@/components/site/link-list"

/** Sur le terrain : des dates, des lieux, des chiffres. */
export function FieldSection() {
  return (
    <Section bg="inverse" className="flex flex-col gap-block">
      <SectionHeader
        title={<>Sur le terrain, <span className="font-normal text-gehmit-light italic">pas seulement en ligne</span>.</>}
        action={<ArrowLink to="/notre-impact">Notre impact</ArrowLink>}
      />
      <div className="grid gap-block md:grid-cols-3">
        {achievements.map((a) => (
          <article key={a.title} className="flex flex-col gap-5">
            {a.photo ? (
              <div className="aspect-[4/3] overflow-hidden bg-inverse-soft">
                <Photo photo={a.photo} alt={a.title} sizes="(min-width: 768px) 33vw, 100vw" />
              </div>
            ) : null}
            <div className="flex flex-col gap-2 border-t border-white/15 pt-4">
              <span className="text-caption font-semibold text-surface/55">{a.date}</span>
              <span className="tnum font-heading text-h2 leading-none font-semibold text-gehmit-light">
                {a.figure}
              </span>
              <h3 className="pt-1 text-body font-semibold">{a.title}</h3>
              <p className="text-small text-surface/70">{a.text}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

/** À venir et à lire : chaque colonne n'apparaît que si elle a du contenu. */
export function AgendaAndReading({ upcoming, articles }: { upcoming: EventItem[]; articles: ArticleSummary[] }) {
  const [lead, ...others] = articles
  if (upcoming.length === 0 && !lead) return null
  const both = upcoming.length > 0 && lead
  return (
    <Section className="grid gap-block lg:grid-cols-12">
      {upcoming.length > 0 && (
        <div className={both ? "flex flex-col gap-group lg:col-span-5" : "flex flex-col gap-group lg:col-span-12"}>
          <SectionHeader title="À venir" action={<ArrowLink to="/evenements">Agenda</ArrowLink>} />
          <UpcomingList events={upcoming} />
        </div>
      )}
      {lead && (
        <div className={both ? "flex flex-col gap-group lg:col-span-7" : "flex flex-col gap-group lg:col-span-12"}>
          <SectionHeader title="À lire" action={<ArrowLink to="/blog">Le blog</ArrowLink>} />
          <ReadingList lead={lead} others={others.slice(0, 2)} />
        </div>
      )}
    </Section>
  )
}

function UpcomingList({ events }: { events: EventItem[] }) {
  return (
    <ul className="flex flex-col border-t border-line-strong">
      {events.map((e) => {
        const d = dateParts(e.date)
        return (
          <li key={`${e.title}-${e.date}`} className="border-b border-line">
            <Link to="/evenements" className="group grid grid-cols-[4rem_1fr] gap-4 py-5">
              {d ? (
                <span className="flex flex-col">
                  <span className="tnum font-heading text-h2 leading-none font-semibold text-gehmit">{d.day}</span>
                  <span className="pt-1 text-caption text-ink-muted">{d.monthShort}</span>
                </span>
              ) : (
                <span className="text-caption font-semibold text-gehmit">Date à confirmer</span>
              )}
              <span className="flex flex-col gap-1">
                <span className="text-body font-semibold text-ink group-hover:text-gehmit">{e.title}</span>
                <span className="text-small text-ink-muted">{[e.time, e.location].filter(Boolean).join(" · ")}</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function ReadingList({ lead, others }: { lead: ArticleSummary; others: ArticleSummary[] }) {
  return (
    <>
      <Link to={`/blog/${lead.slug}`} className="group grid gap-5 border-t border-line-strong pt-6 sm:grid-cols-[1.1fr_1fr]">
        {lead.imageUrl ? (
          <MediaImage
            src={lead.imageUrl}
            alt={lead.imageAlt ?? lead.title}
            sizes="(min-width: 1024px) 30vw, 100vw"
            frame="aspect-[4/3] overflow-hidden bg-line"
            className="transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : null}
        <div className="flex flex-col gap-3">
          <span className="text-caption text-ink-muted">
            {[articleDate(lead), lead.category].filter(Boolean).join(" · ")}
          </span>
          <span className="font-heading text-h3 font-semibold text-ink group-hover:text-gehmit">{lead.title}</span>
          <p className="line-clamp-3 text-small text-ink-muted">{lead.excerpt}</p>
        </div>
      </Link>
      {others.map((a) => (
        <Link
          key={a.slug}
          to={`/blog/${a.slug}`}
          className="group flex items-baseline justify-between gap-group border-t border-line pt-4"
        >
          <span className="text-body font-semibold text-ink group-hover:text-gehmit">{a.title}</span>
          <span className="shrink-0 text-caption text-ink-muted">{articleDate(a)}</span>
        </Link>
      ))}
    </>
  )
}

/** Les deux autres publics, côte à côte : entreprises et donateurs. */
export function AudiencesSection() {
  return (
    <section className="grid lg:grid-cols-2">
      <div className="flex flex-col gap-group bg-surface px-gutter py-section lg:border-t lg:border-line lg:pl-edge">
        <div className="flex flex-col gap-3">
          <Heading>Vous recrutez ?</Heading>
          <p className="max-w-md text-body text-ink-muted">
            Des profils formés et suivis par l'équipe, présentés sans commission.
          </p>
        </div>
        <LinkList items={forCompanies} className="max-w-md" />
      </div>

      <div className="flex flex-col gap-group bg-surface-tint px-gutter py-section lg:pr-edge">
        <div className="flex flex-col gap-3">
          <Heading>Un don finance un accompagnement.</Heading>
          <p className="max-w-md text-body text-ink-muted">Mobile Money, carte ou virement, une fois ou chaque mois.</p>
        </div>
        <dl className="flex max-w-md flex-col border-t border-gehmit/30">
          {donationEquivalences.map((e) => (
            <div key={e.amount} className="flex items-baseline justify-between gap-4 border-b border-gehmit/20 py-4">
              <dt className="text-body text-ink">{e.text}</dt>
              <dd className="tnum font-heading text-h3 font-semibold text-ink">{e.amount}</dd>
            </div>
          ))}
        </dl>
        <CtaLink to="/don" arrow className="self-start">
          Faire un don
        </CtaLink>
      </div>
    </section>
  )
}
