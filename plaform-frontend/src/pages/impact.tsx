import { usePageMeta } from "@/lib/seo"
import { achievements, stats, testimonials } from "@/data/content"
import { Section } from "@/components/site/section"
import { CtaLink } from "@/components/site/cta"
import { Ledger, PageHero } from "@/components/site/page-header"
import { Figure } from "@/components/site/photo"
import { Heading } from "@/components/site/heading"
import { Testimonial } from "@/components/site/testimonial"

export function ImpactPage() {
  usePageMeta("Notre impact", "Ce que Gehmit a accompli : jeunes accompagnés, événements et résultats.")
  const testimonial = testimonials[0]

  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "Accueil", to: "/" }, { label: "Notre impact" }]}
        title={<>Ce que nous avons <span className="accent-word">accompli</span>.</>}
        lede="Des chiffres tenus à jour par l'équipe, et les rendez-vous qui les ont rendus possibles. Dernière mise à jour le 12 août 2026."
        below={<Ledger items={stats} />}
      />

      {/* Réalisations, en chronologie */}
      <Section className="flex flex-col gap-block">
        <Heading>
          Les rendez-vous marquants
        </Heading>
        <ol className="flex flex-col">
          {achievements.map((a) => (
            <li
              key={a.title}
              className="grid gap-block border-t border-line-strong py-block lg:grid-cols-12"
            >
              <div className="flex flex-col gap-2 lg:col-span-3">
                <span className="font-heading text-h3 text-ink italic">{a.date}</span>
                <span className="tnum font-heading text-h2 leading-none font-semibold text-gehmit">
                  {a.figure}
                </span>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-4">
                <Heading as="h3">{a.title}</Heading>
                <p className="text-body text-ink/75">{a.text}</p>
              </div>
              {a.photo ? (
                <Figure
                  photo={a.photo}
                  alt={a.title}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  frameClassName="aspect-[16/10]"
                  className="lg:col-span-5"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </Section>

      {/* Témoignage */}
      {testimonial && (
        <Section bg="inverse">
          <Testimonial testimonial={testimonial} />
        </Section>
      )}

      {/* Suite */}
      <Section bg="tint" compact className="flex flex-wrap items-center justify-between gap-group">
        <div className="flex flex-col gap-2">
          <Heading>
            Soutenez la prochaine promotion.
          </Heading>
          <p className="text-body text-ink/75">Chaque don finance directement l'accompagnement d'un jeune.</p>
        </div>
        <CtaLink to="/don" arrow>
          Faire un don
        </CtaLink>
      </Section>
    </div>
  )
}
