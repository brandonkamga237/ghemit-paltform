import { usePageMeta } from "@/lib/seo"
import { Link } from "react-router"
import { motion } from "motion/react"
import { ArrowRightIcon } from "lucide-react"
import { techpathUrl } from "@/data/content"
import { Photo } from "@/components/site/photo"
import { Reveal } from "@/components/site/reveal"
import { Container } from "@/components/site/bands"
import { Button } from "@/components/ui/button"

const ease = [0.22, 1, 0.36, 1] as const

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
  usePageMeta("Nos solutions", "TechPath : les solutions numériques développées par Gehmit pour les organisations.")
  return (
    <div className="flex flex-col">
      {/* Héros navy — bannière compacte (page secondaire) */}
      <section className="grid bg-navy lg:grid-cols-2">
        <motion.div
          className="flex flex-col justify-center gap-4 px-6 py-10 sm:px-11"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease }}
        >
          <span className="font-mono text-xs tracking-[0.16em] text-gold uppercase">
            Solutions / TechPath
          </span>
          <motion.h1
            className="font-heading text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance text-surface sm:text-4xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
          >
            Un coach d'orientation, disponible à toute heure.
          </motion.h1>
          <motion.p
            className="max-w-[460px] text-lg leading-[1.65] text-surface/80"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease }}
          >
            Quelques questions sur votre profil, une recommandation de métier, d'école et de programme Gehmit.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease }}
          >
            <Button
              render={<a href={techpathUrl} target="_blank" rel="noopener noreferrer" />}
              className="h-12 self-start rounded-md bg-gehmit px-7 text-base font-semibold text-surface hover:bg-gehmit-hover"
            >
              Démarrer avec TechPath
            </Button>
          </motion.div>
        </motion.div>
        <div className="min-h-[200px] lg:min-h-[260px]">
          <Photo
            photo="seminaire-intervenant"
            alt="Intervenant présentant un outil numérique au séminaire Gehmit"
            dark
            className="h-full"
          />
        </div>
      </section>

      {/* Étapes */}
      <section className="bg-surface">
        <Container className="flex flex-col gap-8 py-16">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold">Comment ça marche</h2>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal
                key={s.title}
                delay={i * 0.09}
                className={
                  "flex flex-col gap-3 border-t-2 pt-5 " +
                  (i === 0 ? "border-gehmit" : "border-sand")
                }
              >
                <span className="font-mono text-sm text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-heading text-[22px] font-semibold">{s.title}</span>
                <p className="text-base leading-[1.65] text-ink-muted">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>

        <Container className="grid gap-6 pb-16 md:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col gap-3.5 rounded-lg border border-sand-dark bg-cream p-8">
              <span className="font-heading text-2xl font-semibold">Annuaire des écoles</span>
              <p className="text-base leading-[1.65] text-ink-muted">
                Établissements de la sous-région, filières, durées et coûts,
                consultables sans inscription.
              </p>
              <a
                href={techpathUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[15.5px] font-semibold text-gehmit hover:underline"
              >
                Consulter l'annuaire
                <ArrowRightIcon className="size-4" />
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col gap-3.5 rounded-lg border border-sand-dark bg-cream p-8">
              <span className="font-heading text-2xl font-semibold">
                Après la recommandation
              </span>
              <p className="text-base leading-[1.65] text-ink-muted">
                TechPath ne s'arrête pas au conseil : il ouvre la page du programme
                et le formulaire de candidature.
              </p>
              <Link
                to="/programmes"
                className="inline-flex items-center gap-1.5 text-[15.5px] font-semibold text-gehmit hover:underline"
              >
                Voir les programmes
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  )
}
