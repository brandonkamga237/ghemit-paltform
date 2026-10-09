import { useState } from "react"
import { cn } from "@/lib/cn"
import { useFormations } from "@/data/remote"
import { usePageMeta } from "@/lib/seo"
import { Container } from "@/components/site/bands"
import { CtaLink } from "@/components/site/cta"
import { PageHero, StageLine } from "@/components/site/page-header"
import { StatusDot } from "@/components/site/status-pill"

const filters = ["Toutes", "Data", "Développement", "IA", "En ligne", "Douala"]

/** Lien d'inscription : formulaire de contact prérempli avec la session. */
function inscriptionLink(name: string, session: string) {
  const q = new URLSearchParams({
    objet: "Une question sur un programme",
    message: `Bonjour, je souhaite m'inscrire à la formation « ${name} » (session du ${session}).`,
  })
  return `/contact?${q}`
}

export function FormationsPage() {
  const [filter, setFilter] = useState("Toutes")
  const formations = useFormations()
  usePageMeta("Formations", "Le catalogue des formations Gehmit : data, développement web et IA appliquée, en ligne ou à Douala.")

  const rows = (formations ?? []).filter((f) => {
    if (filter === "Toutes") return true
    if (filter === "En ligne" || filter === "Douala") return f.format === filter
    return f.category === filter
  })

  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "Programmes", to: "/programmes" }, { label: "Formations" }]}
        kicker={<StageLine offer="formations" />}
        title={<>Des sessions courtes, <span className="accent-word">des dates réelles</span>.</>}
        lede="Data, développement web et IA appliquée. Durées, tarifs et calendrier mis à jour par l'équipe ; jamais plus de 25 000 FCFA."
      />

      <section className="bg-surface">
        <Container className="flex flex-col gap-group py-section">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les formations">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "h-11 rounded-sm border px-4 text-small transition-colors",
                  filter === f
                    ? "border-navy bg-navy font-semibold text-surface"
                    : "border-sand-dark bg-white text-navy hover:border-navy"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {formations === null ? (
            <div className="flex flex-col gap-px" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse bg-cream" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-start gap-3 border-t border-sand-dark py-block">
              <p className="font-heading text-h3 text-navy">Aucune session programmée pour ce filtre.</p>
              <p className="text-body text-ink-muted">
                Les prochaines dates sont annoncées dans la lettre mensuelle (en bas de page).
              </p>
            </div>
          ) : (
            <ul className="flex flex-col border-t border-sand-dark">
              {/* En-têtes de colonnes (grand écran) */}
              <li
                aria-hidden
                className="hidden grid-cols-[minmax(0,2.2fr)_1.2fr_1fr_1fr_1fr_170px] gap-group border-b border-sand-dark py-3 text-caption text-ink-muted lg:grid"
              >
                <span>Formation</span>
                <span>Prochaine session</span>
                <span>Durée</span>
                <span>Format</span>
                <span>Tarif</span>
                <span className="text-right">Inscription</span>
              </li>
              {rows.map((f) => {
                const done = f.status === "closed"
                return (
                  <li
                    key={f.name}
                    className={cn(
                      "grid gap-x-6 gap-y-3 border-b border-sand py-6 lg:grid-cols-[minmax(0,2.2fr)_1.2fr_1fr_1fr_1fr_170px] lg:items-center",
                      done && "text-ink-muted"
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className={cn("font-heading text-h3 font-semibold", done ? "text-ink-muted" : "text-navy")}>
                        {f.name}
                      </span>
                      <span className="text-small text-ink-muted">{f.category}</span>
                    </div>
                    <dl className="contents text-body">
                      <Cell label="Prochaine session" value={f.session} />
                      <Cell label="Durée" value={f.duration} />
                      <Cell label="Format" value={f.format} />
                      <Cell label="Tarif" value={f.price} />
                    </dl>
                    <div className="lg:text-right">
                      {f.status === "open" ? (
                        <CtaLink to={inscriptionLink(f.name, f.session)} className="h-11 px-5 text-small">
                          S'inscrire
                        </CtaLink>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-small font-semibold">
                          <StatusDot status={f.status} />
                          {f.statusLabel}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
      </section>
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 lg:block">
      <dt className="text-small text-ink-muted lg:sr-only">{label}</dt>
      <dd className="tnum">{value}</dd>
    </div>
  )
}
