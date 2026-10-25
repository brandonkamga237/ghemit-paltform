import { Link } from "react-router"
import type { ReactNode } from "react"
import { ArrowRightIcon } from "lucide-react"
import { cn } from "@/lib/cn"

type Variant = "primary" | "gold" | "outline" | "inverse" | "outline-inverse"

const variants: Record<Variant, string> = {
  primary: "bg-gehmit text-surface hover:bg-gehmit-hover active:bg-gehmit-active",
  gold: "bg-gold text-navy hover:bg-gold-hover active:bg-gold-active",
  outline: "border border-navy/25 text-navy hover:border-navy hover:bg-navy hover:text-surface",
  inverse: "bg-surface text-navy hover:bg-cream",
  "outline-inverse": "border border-surface/30 text-surface hover:border-surface hover:bg-surface/10",
}

/** Bouton d'action (lien interne ou externe). Une seule action principale par écran. */
export function CtaLink({
  to,
  href,
  variant = "primary",
  arrow = false,
  className,
  children,
}: {
  to?: string
  href?: string
  variant?: Variant
  arrow?: boolean
  className?: string
  children: ReactNode
}) {
  const cls = cn(
    "group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-sm px-6 py-2.5 text-center text-small font-semibold text-balance transition-colors duration-150 [&>svg]:shrink-0",
    variants[variant],
    className
  )
  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </>
  )
  if (to?.startsWith("#")) {
    return (
      <a href={to} className={cls}>
        {content}
      </a>
    )
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </a>
    )
  }
  return (
    <Link to={to ?? "/"} className={cls}>
      {content}
    </Link>
  )
}

/** Lien de texte fléché, pour les actions secondaires. */
export function ArrowLink({
  to,
  className,
  children,
}: {
  to: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group inline-flex items-center gap-2 text-small font-semibold text-gehmit underline-offset-4 hover:underline",
        className
      )}
    >
      {children}
      <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  )
}
