import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@gehmit/ui/cn"
import { useTone, type Tone } from "./tone"

/**
 * Le seul style de bouton du site : liens d'action (`CtaLink`), boutons de
 * formulaire (`CtaButton`), ou tout autre élément via `ctaVariants(...)` / `useCtaClass(...)`.
 */
export const ctaVariants = cva(
  "group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-sm px-6 py-2.5 text-center text-small font-semibold text-balance transition-colors duration-150 disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-gehmit text-surface hover:bg-gehmit-hover active:bg-gehmit-active",
        /** Réservé au don : seul usage de l'or sur le site. */
        donate: "bg-gold text-ink hover:bg-gold-hover active:bg-gold-active",
        outline: "border border-ink/25 text-ink hover:border-ink hover:bg-inverse hover:text-surface",
        inverse: "bg-surface text-ink hover:bg-surface-alt",
        "outline-inverse": "border border-surface/30 text-surface hover:border-surface hover:bg-surface/10",
      },
    },
    defaultVariants: { variant: "primary" },
  }
)

export type CtaVariant = NonNullable<VariantProps<typeof ctaVariants>["variant"]>

/** Sur fond sombre, le contour clair remplace le contour foncé. */
function resolve(variant: CtaVariant, tone: Tone): CtaVariant {
  return tone === "inverse" && variant === "outline" ? "outline-inverse" : variant
}

export function useCtaClass(variant: CtaVariant = "primary", className?: string) {
  const tone = useTone()
  return cn(ctaVariants({ variant: resolve(variant, tone) }), className)
}
