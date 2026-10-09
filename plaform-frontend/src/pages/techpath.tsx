import { usePageMeta } from "@/lib/seo"
import { techpathUrl } from "@/data/content"
import { Container } from "@/components/site/bands"
import { ArrowLink, CtaLink } from "@/components/site/cta"
import { InfoRows, PageHero, StageLine } from "@/components/site/page-header"
import { NextStep } from "@/components/site/parcours"

const steps = [
  {
    title: "Vous décrivez votre situation",
    text: "Niveau d'études, centres d'intérêt, contraintes de temps et de lieu.",
  },
  {
    title: "Le coach propose des pistes",
    text: "Métiers accessibles, compétences à acquérir, écoles de l'annuaire.",
  },
  {
    title: "Vous êtes orienté vers un programme",
    text: "La recommandation renvoie directement vers le programme Gehmit correspondant.",
  },
]

export function TechPathPage() {
  usePageMeta("TechPath", "TechPath, le coach d'orientation de Gehmit : un métier, une école et un programme recommandés en quelques questions.")
  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "Accueil", to: "/" }, { label: "Solutions" }]}
        kicker={<StageLine offer="TechPath" />}
        title={<>Un coach d'orientation, <span className="accent-word">à toute heure</span>.</>}
        lede="Quelques questions sur votre profil, puis une recommandation de métier, d'école et de programme Gehmit. Gratuit, sans inscription."
        actions={
          <CtaLink href={techpathUrl} arrow>
            Démarrer avec TechPath
          </CtaLink>
        }
        below={
          <Container>
            <ol className="grid border-t border-sand-dark md:grid-cols-3">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className="flex flex-col gap-2 border-sand-dark py-7 max-md:border-b max-md:last:border-b-0 md:pr-8 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-8"
                >
                  <span className="tnum text-[14px] font-semibold text-gold">{i + 1}</span>
                  <span className="font-heading text-[22px] leading-snug font-semibold text-navy">{s.title}</span>
                  <span className="text-[16px] leading-relaxed text-ink-muted">{s.text}</span>
                </li>
              ))}
            </ol>
          </Container>
        }
      />

      <section className="bg-surface">
        <Container className="flex flex-col gap-10 py-16 lg:py-24">
          <h2 className="font-heading text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] text-navy sm:text-[40px]">
            Ce que TechPath vous apporte
          </h2>
          <InfoRows
            rows={[
              {
                title: "L'annuaire des écoles",
                text: (
                  <span className="flex flex-col items-start gap-3">
                    Établissements de la sous-région, filières, durées et coûts, consultables sans
                    inscription.
                    <a
                      href={techpathUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gehmit underline-offset-4 hover:underline"
                    >
                      Consulter l'annuaire →
                    </a>
                  </span>
                ),
              },
              {
                title: "Une suite concrète",
                text: (
                  <span className="flex flex-col items-start gap-3">
                    TechPath ne s'arrête pas au conseil : il ouvre la page du programme recommandé et
                    son formulaire de candidature.
                    <ArrowLink to="/programmes">Voir les programmes</ArrowLink>
                  </span>
                ),
              },
            ]}
          />
        </Container>
      </section>

      <NextStep offer="TechPath" />
    </div>
  )
}
