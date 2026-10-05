import { achievements, stats } from "@/data/content"
import { PageHeader } from "@/components/site/page-header"
import { Container, CtaBand, StatBand } from "@/components/site/bands"
import { Photo } from "@/components/site/photo"
import { Reveal } from "@/components/site/reveal"

export function ImpactPage() {
  return (
    <div className="flex flex-col">
      <Container>
        <PageHeader
          trail={[{ label: "Accueil", to: "/" }, { label: "Notre impact" }]}
          title="Ce que nous avons accompli"
          lede="Chiffres tenus à jour par l'équipe. Dernière mise à jour le 12 août 2026."
        />
      </Container>

      <StatBand stats={stats} tone="gehmit" />

      {/* Réalisations */}
      <section className="bg-surface">
        <Container className="flex flex-col gap-7 py-16">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold">Réalisations</h2>
          </Reveal>
          <div className="flex flex-col">
            {achievements.map((a, i) => (
              <Reveal
                key={a.title}
                delay={i * 0.06}
                className={
                  "grid items-center gap-3 border-t border-sand py-6 md:grid-cols-[140px_1fr_220px] md:gap-7 " +
                  (i === achievements.length - 1 ? "border-b" : "")
                }
              >
                <span className="font-mono text-sm text-gold">{a.date}</span>
                <div className="flex flex-col gap-1.5">
                  <span className="font-heading text-[22px] font-semibold">{a.title}</span>
                  <span className="text-base text-ink-muted">{a.text}</span>
                </div>
                <span className="text-base text-ink-faint md:text-right">{a.figure}</span>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Témoignage */}
      <section className="grid border-t border-sand bg-cream lg:grid-cols-2">
        <div className="min-h-[280px] lg:min-h-[360px]">
          <Photo
            photo="seminaire-micro"
            alt="Un participant prend la parole lors du séminaire Gehmit"
            className="h-full"
          />
        </div>
        <Reveal className="flex flex-col justify-center gap-5 px-6 py-14 sm:px-11">
          <span className="mono-label">Témoignage</span>
          <p className="font-heading text-2xl leading-[1.45] font-medium text-navy sm:text-[26px]">
            « Lors d'une période difficile, j'ai eu la chance de bénéficier des
            conseils avisés de Gehmit, qui m'ont permis de mieux orienter mes
            études en informatique. »
          </p>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold">Michelle Gouet</span>
            <span className="text-[15px] text-ink-faint">Cameroun</span>
          </div>
        </Reveal>
      </section>

      <CtaBand
        title="Soutenez la prochaine promotion"
        text="Chaque don finance directement l'accompagnement d'un jeune."
        ctaLabel="Faire un don"
        ctaTo="/don"
        tone="navy"
      />
    </div>
  )
}
