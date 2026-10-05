import { Link } from "react-router"
import { motion } from "motion/react"
import { Photo } from "@/components/site/photo"
import { Reveal } from "@/components/site/reveal"
import { Container, CtaBand } from "@/components/site/bands"
import { Breadcrumb } from "@/components/site/page-header"
import { Button } from "@/components/ui/button"

const missions = [
  {
    title: "Informer",
    text: "Rendre lisibles les métiers, les formations et les débouchés réels du secteur.",
  },
  {
    title: "Former",
    text: "Des sessions courtes et pratiques, animées par des professionnels en exercice.",
  },
  {
    title: "Insérer",
    text: "Mentorat, stages et mise en relation avec les entreprises partenaires.",
  },
]

export function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* En-tête éditorial */}
      <section className="bg-cream">
        <Container className="grid items-end gap-8 pt-10 pb-8 lg:grid-cols-2 lg:gap-12">
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Breadcrumb
              trail={[{ label: "Accueil", to: "/" }, { label: "À propos" }]}
            />
            <h1 className="font-heading text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
              Réduire la part de hasard dans une carrière tech.
            </h1>
          </motion.div>
          <motion.p
            className="border-l-2 border-gold pl-6 text-lg leading-[1.7] text-ink-muted"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Gehmit est une organisation à but non lucratif. Nous informons, formons et orientons les jeunes et les professionnels qui veulent construire une carrière dans le numérique, et nous facilitons leur insertion.
          </motion.p>
        </Container>
      </section>

      {/* Photo panoramique */}
      <Photo
        photo="seminaire-salle"
        sizes="100vw"
        alt="Salle comble pendant le séminaire Gehmit de septembre 2025"
        className="h-[180px] sm:h-[260px]"
      />

      {/* Pourquoi */}
      <section className="bg-surface">
        <Container className="grid gap-10 py-16 lg:grid-cols-[280px_1fr] lg:gap-14">
          <Reveal className="flex flex-col gap-2.5">
            <h2 className="font-heading text-[28px] font-semibold">Pourquoi</h2>
            <span className="h-0.5 w-12 bg-gold" />
          </Reveal>
          <Reveal delay={0.1} className="flex max-w-[680px] flex-col gap-5">
            <p className="text-[17px] leading-[1.75] text-ink-muted">
              Le numérique crée des emplois plus vite qu'il ne crée de repères. En
              Afrique centrale, un étudiant qui s'y intéresse découvre rarement
              l'étendue réelle des métiers, et ceux qui ont un objectif précis
              avancent souvent seuls.
            </p>
            <p className="text-[17px] leading-[1.75] text-ink-muted">
              Nous mettons en face de ces personnes des professionnels
              expérimentés, un cadre de formation et un réseau d'entreprises. Le
              reste dépend d'elles.
            </p>
          </Reveal>
        </Container>

        {/* Missions */}
        <Container className="grid gap-6 pb-16 sm:grid-cols-3">
          {missions.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.08}>
              <div className="flex h-full flex-col gap-2.5 rounded-lg border border-sand bg-cream p-7">
                <span className="font-heading text-[22px] font-semibold">{m.title}</span>
                <p className="text-[15.5px] leading-relaxed text-ink-muted">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </Container>
      </section>

      <CtaBand
        title="Une question sur nos programmes ?"
        ctaLabel="Nous écrire"
        ctaTo="/contact"
        tone="gehmit"
      />

      {/* Lien partenaires */}
      <section className="bg-cream">
        <Container className="flex flex-wrap items-center justify-between gap-6 py-12">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-semibold">
              Entreprises et institutions
            </h2>
            <p className="max-w-[520px] text-base leading-relaxed text-ink-muted">
              Stages, mécénat de compétences, matériel ou salles : quatre façons de
              contribuer, aucune n'exige un budget.
            </p>
          </div>
          <Button
            variant="outline"
            render={<Link to="/partenaire" />}
            className="h-12 rounded-md border-navy px-7 text-base font-semibold text-navy hover:bg-navy hover:text-surface"
          >
            Devenir partenaire
          </Button>
        </Container>
      </section>
    </div>
  )
}
