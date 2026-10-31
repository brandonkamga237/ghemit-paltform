import { cn } from "@gehmit/ui/cn"
import type { Testimonial as TestimonialData } from "@/data/content"
import { useTone } from "./tone"

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")

/** Témoignage : citation en italique éditoriale, initiales et provenance. S'adapte au fond. */
export function Testimonial({ testimonial, className }: { testimonial: TestimonialData; className?: string }) {
  const dark = useTone() === "inverse"
  return (
    <figure className={cn("mx-auto flex max-w-4xl flex-col gap-group", className)}>
      <span aria-hidden className={cn("font-heading text-display leading-none", dark ? "text-gehmit-light" : "text-gehmit")}>
        “
      </span>
      <blockquote className={cn("font-heading text-h2 italic", dark ? "text-surface" : "text-ink")}>
        {testimonial.quote}
      </blockquote>
      <figcaption className="flex items-center gap-4">
        <span
          aria-hidden
          className={cn(
            "flex size-11 items-center justify-center rounded-full text-small font-semibold",
            dark ? "bg-gehmit-light text-inverse-deep" : "bg-gehmit text-surface"
          )}
        >
          {initials(testimonial.name)}
        </span>
        <span className="flex flex-col">
          <span className={cn("text-body font-semibold", dark ? "text-surface" : "text-ink")}>{testimonial.name}</span>
          <span className={cn("text-small", dark ? "text-surface/65" : "text-ink-muted")}>{testimonial.place}</span>
        </span>
      </figcaption>
    </figure>
  )
}
