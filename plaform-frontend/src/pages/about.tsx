import { Link } from "react-router"
import { ArrowRightIcon } from "lucide-react"
import { contact } from "@/data/content"
import { Figure } from "@/components/site/photo"
import { Container } from "@/components/site/bands"
import { CtaLink } from "@/components/site/cta"
import { PageHero } from "@/components/site/page-header"
import { usePageMeta } from "@/lib/seo"

/** Les trois verbes de Gehmit, tels qu'ils figurent sur ses supports. */
const missions = [
  {
    verb: "Former",
    text: "Des sessions courtes et pratiques, animées par des professionnels en exercice : data, développement web, IA appliquée.",
  },
  {
    verb: "Inspirer",
    text: "Rendre lisibles les métiers, les formations et les débouchés réels, en faisant entrer les jeunes dans les entreprises.",
  },
  {
    verb: "Connecter",
    text: "Mentorat, stages et mise en relation directe avec les entreprises partenaires, jusqu'au premier emploi.",
  },
]

export function AboutPage() {
  usePageMeta("À propos", "Qui est Gehmit : mission, méthode et programmes au service des carrières numériques au Cameroun.")
  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "Accueil", to: "/" }, { label: "À propos" }]}
        title={<>Réduire la part de <span className="accent-word">hasard</span> dans une carrière tech.</>}
        lede="Gehmit est une organisation à but non lucratif basée à Douala. Nous informons, formons et orientons les jeunes et les professionnels qui veulent construire une carrière dans le numérique, et nous facilitons leur insertion."
        aside={
          <Figure
            photo="seminaire-salle"
            alt="Salle comble pendant le séminaire Gehmit de septembre 2025"
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            frameClassName="aspect-[4/3] lg:aspect-auto lg:h-[460px]"
          />
        }
      />

      {/* Pourquoi */}
      <section className="bg-surface">
        <Container className="grid gap-block py-section lg:grid-cols-12">
          <h2 className="font-heading text-h2 font-semibold text-navy lg:col-span-4">
            Pourquoi Gehmit existe
          </h2>
          <div className="flex max-w-[680px] flex-col gap-group lg:col-span-8">
            <p className="font-heading text-h2 text-navy">
              Le numérique crée des emplois plus vite qu'il ne crée de repères.
            </p>
            <p className="text-body text-navy/75">
              En Afrique centrale, un étudiant qui s'y intéresse découvre rarement l'étendue réelle
              des métiers, et ceux qui ont un objectif précis avancent souvent seuls.
            </p>
            <p className="text-body text-navy/75">
              Nous mettons en face de ces personnes des professionnels expérimentés, un cadre de
              formation et un réseau d'entreprises. Le reste dépend d'elles.
            </p>
          </div>
        </Container>
      </section>

      {/* Former. Inspirer. Connecter. */}
      <section className="bg-navy text-surface">
        <Container className="grid gap-block py-section md:grid-cols-3">
          {missions.map((m, i) => (
            <div key={m.verb} className="flex flex-col gap-4 border-t border-white/15 pt-6">
              <span className="tnum text-small font-semibold text-gold">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-heading text-display leading-none font-normal italic">
                {m.verb}.
              </span>
              <p className="max-w-[340px] text-body text-surface/70">{m.text}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Suite logique */}
      <section className="bg-cream">
        <Container>
          <div className="grid gap-px bg-sand-dark md:grid-cols-2">
          <div className="flex flex-col gap-5 bg-cream py-section md:pr-10">
            <h2 className="font-heading text-h2 font-semibold text-navy">
              Vous cherchez votre voie ?
            </h2>
            <p className="max-w-[440px] text-body text-ink-muted">
              Le parcours Gehmit commence où vous en êtes : orientation, formation, accompagnement
              ou insertion.
            </p>
            <CtaLink to="/programmes" arrow className="self-start">
              Voir le parcours
            </CtaLink>
          </div>
          <div className="flex flex-col gap-5 bg-cream py-section md:pl-10">
            <h2 className="font-heading text-h2 font-semibold text-navy">
              Entreprises et institutions
            </h2>
            <p className="max-w-[440px] text-body text-ink-muted">
              Stages, mécénat de compétences, matériel ou salles : quatre façons de contribuer,
              aucune n'exige un budget.
            </p>
            <Link
              to="/partenaire"
              className="group inline-flex items-center gap-2 text-small font-semibold text-gehmit underline-offset-4 hover:underline"
            >
              Devenir partenaire
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="pt-2 text-small text-ink-muted">
              Ou écrivez-nous :{" "}
              <a href={`mailto:${contact.email}`} className="font-semibold text-navy hover:text-gehmit">
                {contact.email}
              </a>
            </p>
          </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
