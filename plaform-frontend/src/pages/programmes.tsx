import { usePrograms } from "@/data/remote"
import { PageHeader } from "@/components/site/page-header"
import { ProgramRow } from "@/components/site/cards"
import { Container } from "@/components/site/bands"
import { Reveal } from "@/components/site/reveal"

export function ProgrammesPage() {
  const programs = usePrograms()
  return (
    <div className="flex flex-col">
      <Container>
        <PageHeader
          trail={[{ label: "Accueil", to: "/" }, { label: "Programmes" }]}
          title="Cinq façons d'avancer"
          lede="Chaque programme a ses conditions, sa durée et son calendrier. Candidature directe, sans compte à créer."
        />
        <div className="flex flex-col gap-6 pb-16">
          {programs.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <ProgramRow program={p} />
            </Reveal>
          ))}
        </div>
      </Container>
    </div>
  )
}
