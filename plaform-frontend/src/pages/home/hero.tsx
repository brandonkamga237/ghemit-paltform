import { Link } from "react-router"
import type { Program } from "@/data/content"
import { parcours, programStatus } from "@/data/parcours"
import { Photo } from "@/components/site/photo"
import { StatusDot } from "@/components/site/status-pill"
import { ArrowLink, CtaLink } from "@/components/site/cta"
import { Container, ToneProvider } from "@/components/site/section"
import { Heading } from "@/components/site/heading"

/** Héros plein cadre : qui nous sommes, la preuve en image, et le parcours à portée de main. */
export function HomeHero({ programs }: { programs: Program[] }) {
  return (
    <ToneProvider tone="inverse">
      <section className="relative isolate overflow-hidden bg-inverse-deep text-surface">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Photo
            photo="seminaire-public"
            alt=""
            priority
            sizes="100vw"
            className="hero-settle [object-position:50%_38%]"
          />
          {/* Voile : lisibilité du texte à gauche, photo visible à droite */}
          <div className="absolute inset-0 bg-linear-to-r from-inverse-deep/92 via-inverse-deep/78 via-42% to-inverse-deep/35" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-inverse-deep/95 to-transparent" />
        </div>

        <Container className="flex min-h-[min(78svh,700px)] flex-col justify-end gap-group pt-section pb-block">
          <Heading as="h1" className="max-w-[16ch]">
            Former, inspirer, <span className="font-normal text-gehmit-light italic">connecter</span> les talents du numérique.
          </Heading>
          <p className="max-w-xl text-lead text-surface/85">
            Gehmit oriente, forme et accompagne les jeunes jusqu'à leur premier emploi dans le
            numérique, et les met en relation avec les entreprises qui recrutent. La plupart de nos
            programmes sont gratuits.
          </p>
          <div className="flex flex-wrap items-center gap-x-group gap-y-item pt-1">
            <CtaLink to="/programmes" arrow>
              Trouver mon programme
            </CtaLink>
            <ArrowLink to="/louer-developpeur">Je recrute un talent</ArrowLink>
          </div>
          <p className="pt-group text-caption text-surface/55 lg:self-end">
            Séminaire « De la recherche à l'innovation », Douala, septembre 2025 · 120 participants
          </p>
        </Container>

        <ParcoursBar programs={programs} />
      </section>
    </ToneProvider>
  )
}

/** Barre du parcours : quatre étapes, leurs offres et leur statut. */
function ParcoursBar({ programs }: { programs: Program[] }) {
  return (
    <nav aria-label="Le parcours Gehmit" className="border-t border-white/15 bg-inverse-deep/70 backdrop-blur-sm">
      <Container>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
          {parcours.map((stage, i) => (
            <li
              key={stage.id}
              className="flex flex-col gap-2 border-white/15 py-5 max-sm:[&:not(:first-child)]:border-t sm:max-lg:[&:nth-child(n+3)]:border-t sm:max-lg:[&:nth-child(even)]:border-l sm:max-lg:[&:nth-child(even)]:pl-5 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:pl-5 lg:pr-4"
            >
              <Link to={`/programmes#${stage.id}`} className="flex items-baseline gap-2.5 hover:text-gehmit-light">
                <span className="tnum text-caption font-semibold text-gehmit-light">{i + 1}</span>
                <span className="font-heading text-h3 italic">{stage.verb}</span>
              </Link>
              <ul className="flex flex-wrap gap-x-4 gap-y-1">
                {stage.offers.map((o) => {
                  const st = programStatus(programs, o.programSlug)
                  return (
                    <li key={o.name}>
                      <Link
                        to={o.to}
                        className="inline-flex items-center gap-1.5 text-small text-surface/75 underline-offset-4 transition-colors hover:text-surface hover:underline"
                      >
                        {o.name}
                        {st?.status === "open" && <StatusDot status="open" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ol>
      </Container>
    </nav>
  )
}
