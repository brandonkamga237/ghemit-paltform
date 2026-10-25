import { usePageMeta } from "@/lib/seo"
import { achievements, stats, testimonials } from "@/data/content"
import { Container } from "@/components/site/bands"
import { CtaLink } from "@/components/site/cta"
import { Ledger, PageHero } from "@/components/site/page-header"
import { Figure } from "@/components/site/photo"

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
      <section className="bg-surface">
        <Container className="flex flex-col gap-block py-section">
          <h2 className="font-heading text-h2 font-semibold text-navy">
            Les rendez-vous marquants
          </h2>
          <ol className="flex flex-col">
            {achievements.map((a) => (
              <li
                key={a.title}
                className="grid gap-block border-t border-sand-dark py-block lg:grid-cols-12"
              >
                <div className="flex flex-col gap-2 lg:col-span-3">
                  <span className="font-heading text-h3 text-navy italic">{a.date}</span>
                  <span className="tnum font-heading text-h2 leading-none font-semibold text-gold">
                    {a.figure}
                  </span>
                </div>
                <div className="flex flex-col gap-3 lg:col-span-4">
                  <h3 className="font-heading text-h3 font-semibold text-navy">{a.title}</h3>
                  <p className="text-body text-navy/75">{a.text}</p>
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
        </Container>
      </section>

      {/* Témoignage */}
      {testimonial && (
        <section className="bg-navy text-surface">
          <Container className="py-section">
            <figure className="mx-auto flex max-w-[920px] flex-col gap-group">
              <blockquote className="font-heading text-h2 italic">
                <span aria-hidden className="text-gold">« </span>
                {testimonial.quote}
                <span aria-hidden className="text-gold"> »</span>
              </blockquote>
              <figcaption className="text-body">
                <span className="font-semibold">{testimonial.name}</span>
                <span className="text-surface/60"> · {testimonial.place}</span>
              </figcaption>
            </figure>
          </Container>
        </section>
      )}

      {/* Suite */}
      <section className="bg-gehmit-tint">
        <Container className="flex flex-wrap items-center justify-between gap-group py-block">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-h2 font-semibold text-navy">
              Soutenez la prochaine promotion.
            </h2>
            <p className="text-body text-navy/75">Chaque don finance directement l'accompagnement d'un jeune.</p>
          </div>
          <CtaLink to="/don" arrow>
            Faire un don
          </CtaLink>
        </Container>
      </section>
    </div>
  )
}
