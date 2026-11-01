import type { ReactNode } from "react"
import { cn } from "@gehmit/ui/cn"
import { ToneContext, type Tone } from "./tone"

/** Déclare le ton d'une zone dont le fond n'est pas une `Section` (héros photo, pied de page…). */
export function ToneProvider({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <ToneContext value={tone}>{children}</ToneContext>
}

/** Colonne centrale du site : 1200 px maximum, gouttières fluides. */
export function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-page px-gutter", className)}>
      {children}
    </div>
  )
}

const backgrounds = {
  surface: "bg-surface",
  alt: "bg-surface-alt",
  tint: "bg-surface-tint",
  inverse: "bg-inverse text-surface",
} as const

export type SectionBackground = keyof typeof backgrounds

/**
 * Bande de page : fond, rythme vertical (`py-section`, ou `py-block` si
 * `compact`) et colonne centrale. `className` s'applique à la colonne
 * (grille, écarts…), pas à la bande.
 */
export function Section({
  bg = "surface",
  compact = false,
  id,
  className,
  children,
  "aria-label": ariaLabel,
}: {
  bg?: SectionBackground
  compact?: boolean
  id?: string
  className?: string
  children: ReactNode
  "aria-label"?: string
}) {
  return (
    <ToneProvider tone={bg === "inverse" ? "inverse" : "light"}>
      <section id={id} aria-label={ariaLabel} className={cn(backgrounds[bg], id && "scroll-mt-20")}>
        <Container className={cn(compact ? "py-block" : "py-section", className)}>{children}</Container>
      </section>
    </ToneProvider>
  )
}
