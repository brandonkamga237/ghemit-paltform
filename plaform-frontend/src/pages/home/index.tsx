import { stats, testimonials } from "@/data/content"
import { useArticleSummaries, useEvents, usePrograms } from "@/data/remote"
import { PartnerLogos } from "@/components/site/partner-logos"
import { Ledger } from "@/components/site/page-header"
import { Section } from "@/components/site/section"
import { Testimonial } from "@/components/site/testimonial"
import { HomeHero } from "./hero"
import { AgendaAndReading, AudiencesSection, FieldSection } from "./sections"

/**
 * Accueil : une suite de sections autonomes. Chacune est un composant
 * (`./hero`, `./sections`) ; cette page ne fait que les ordonner et leur
 * passer les données.
 */
export function HomePage() {
  const programs = usePrograms()
  const events = useEvents()
  const articles = useArticleSummaries()
  const upcoming = (events ?? []).filter((e) => e.upcoming !== false).slice(0, 3)
  const testimonial = testimonials[0]

  return (
    <div className="flex flex-col">
      <HomeHero programs={programs} />

      {/* Chiffres clés */}
      <section className="bg-surface-alt">
        <Ledger items={stats} />
      </section>

      <FieldSection />

      {testimonial && (
        <Section bg="alt">
          <Testimonial testimonial={testimonial} />
        </Section>
      )}

      <AgendaAndReading upcoming={upcoming} articles={articles ?? []} />

      <AudiencesSection />

      <PartnerLogos title="Ils nous accompagnent" />
    </div>
  )
}
