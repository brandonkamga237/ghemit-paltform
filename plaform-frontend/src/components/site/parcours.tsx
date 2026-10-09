import { Link } from "react-router"
import { ArrowRightIcon } from "lucide-react"
import { cn } from "cn"
import { usePrograms } from "@/data/remote"
import { parcours, programStatus } from "@/data/parcours"
import { StatusDot } from "./status-pill"

/**
 * Frise du parcours Gehmit : quatre étapes reliées, chacune avec ses offres.
 * Horizontale sur grand écran, verticale sur mobile. `current` met en
 * évidence l'offre (et son étape) de la page en cours.
 */
export function Parcours({ current, className }: { current?: string; className?: string }) {
  const programs = usePrograms()
  return (
    <ol className={cn("grid gap-y-10 lg:grid-cols-4 lg:gap-x-8", className)}>
      {parcours.map((stage, i) => {
        const here = !!current && stage.offers.some((o) => o.name === current || o.programSlug === current)
        const last = i === parcours.length - 1
        return (
          <li key={stage.id} className="relative pl-12 lg:pt-14 lg:pl-0">
            {/* Trait de liaison */}
            {!last && (
              <span
                aria-hidden
                className="absolute top-8 bottom-[-40px] left-[13px] w-px bg-sand-dark lg:top-[13px] lg:right-[-32px] lg:bottom-auto lg:left-7 lg:h-px lg:w-auto"
              />
            )}
            <span
              aria-hidden
              className={cn(
                "tnum absolute top-0 left-0 flex size-7 items-center justify-center rounded-full border text-[13px] font-semibold",
                here ? "border-gehmit bg-gehmit text-surface" : "border-sand-dark bg-surface text-navy"
              )}
            >
              {i + 1}
            </span>

            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-[26px] leading-tight font-normal text-navy italic sm:text-[28px]">
                {stage.verb}
              </h3>
              <p className="max-w-[300px] text-[15.5px] leading-relaxed text-ink-muted">{stage.text}</p>
            </div>

            <ul className="mt-5 flex flex-col border-t border-sand">
              {stage.offers.map((o) => {
                const st = programStatus(programs, o.programSlug)
                const isCurrent = !!current && (o.name === current || o.programSlug === current)
                return (
                  <li key={o.name} className="border-b border-sand">
                    <Link
                      to={o.to}
                      aria-current={isCurrent ? "page" : undefined}
                      className={cn(
                        "group flex items-start justify-between gap-3 py-3.5 transition-colors",
                        isCurrent && "-mx-3 bg-open-bg px-3"
                      )}
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-2 text-[16.5px] font-semibold text-navy transition-colors group-hover:text-gehmit">
                          {o.name}
                          {st && st.status !== "archived" && <StatusDot status={st.status} />}
                        </span>
                        <span className="text-[14px] leading-snug text-ink-muted">
                          {isCurrent ? "Vous êtes ici" : o.line}
                        </span>
                      </span>
                      <ArrowRightIcon className="mt-1 size-4 shrink-0 text-ink-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-gehmit" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        )
      })}
    </ol>
  )
}

/** « Étape suivante » : relie une offre à l'étape qui la suit dans le parcours. */
export function NextStep({ offer }: { offer: string }) {
  const i = parcours.findIndex((s) => s.offers.some((o) => o.name === offer || o.programSlug === offer))
  const next = i >= 0 ? parcours[i + 1] : undefined
  if (!next) return null
  return (
    <section className="border-t border-sand bg-surface">
      <div className="mx-auto grid w-full max-w-[1240px] gap-6 px-5 py-14 sm:px-10 lg:grid-cols-12 lg:items-center lg:gap-10">
        <p className="flex flex-col gap-1 lg:col-span-5">
          <span className="text-[14.5px] text-ink-muted">Étape suivante du parcours</span>
          <span className="font-heading text-[32px] leading-tight text-navy italic">{next.verb}</span>
        </p>
        <ul className="flex flex-col border-t border-sand-dark lg:col-span-7">
          {next.offers.map((o) => (
            <li key={o.name} className="border-b border-sand">
              <Link to={o.to} className="group flex items-center justify-between gap-4 py-4">
                <span className="flex flex-col gap-0.5">
                  <span className="text-[17px] font-semibold text-navy group-hover:text-gehmit">{o.name}</span>
                  <span className="text-[14.5px] text-ink-muted">{o.line}</span>
                </span>
                <ArrowRightIcon className="size-4 shrink-0 text-ink-faint transition-all group-hover:translate-x-0.5 group-hover:text-gehmit" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
