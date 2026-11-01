import type { ReactNode } from "react"
import { cn } from "@gehmit/ui/cn"
import { useTone } from "./tone"

const sizes = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
} as const

/**
 * Titre éditorial (Lora, demi-gras). La couleur suit le fond : encre sur fond
 * clair, blanc sur fond sombre. `size` découple l'apparence du niveau (`as`).
 */
export function Heading({
  as: Tag = "h2",
  size,
  id,
  className,
  children,
}: {
  as?: "h1" | "h2" | "h3" | "h4"
  size?: keyof typeof sizes
  id?: string
  className?: string
  children: ReactNode
}) {
  const tone = useTone()
  const s = size ?? (Tag === "h1" ? "display" : Tag === "h2" ? "h2" : "h3")
  return (
    <Tag
      id={id}
      className={cn(
        "font-heading font-semibold",
        sizes[s],
        tone === "inverse" ? "text-surface" : "text-ink",
        className
      )}
    >
      {children}
    </Tag>
  )
}

/**
 * En-tête de section : titre, puis soit une phrase d'accompagnement (`text`,
 * alignée à droite sur grand écran), soit une action (`action`, lien fléché).
 */
export function SectionHeader({
  title,
  text,
  action,
  className,
}: {
  title: ReactNode
  text?: ReactNode
  action?: ReactNode
  className?: string
}) {
  const tone = useTone()
  if (text) {
    return (
      <div className={cn("grid gap-4 lg:grid-cols-12 lg:items-end", className)}>
        <Heading className="lg:col-span-7">{title}</Heading>
        <p
          className={cn(
            "max-w-md text-body lg:col-span-5 lg:justify-self-end",
            tone === "inverse" ? "text-surface/70" : "text-ink-muted"
          )}
        >
          {text}
        </p>
      </div>
    )
  }
  return (
    <div className={cn("flex flex-wrap items-baseline justify-between gap-x-group gap-y-2", className)}>
      <Heading className="max-w-2xl">{title}</Heading>
      {action}
    </div>
  )
}
