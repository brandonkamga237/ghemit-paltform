import { Link } from "react-router"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { ArrowRightIcon } from "lucide-react"
import { cn } from "@gehmit/ui/cn"
import { useCtaClass, type CtaVariant as Variant } from "./cta-variants"
import { useTone } from "./tone"

function Arrow() {
  return <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
}

/** Lien d'action : route interne (`to`), ancre (`to="#…"`) ou site externe (`href`). */
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
  const cls = useCtaClass(variant, className)
  const content = (
    <>
      {children}
      {arrow && <Arrow />}
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

/** Bouton de formulaire, même apparence que `CtaLink`. */
export function CtaButton({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const cls = useCtaClass(variant, className)
  return <button type={type} className={cls} {...props} />
}

/** Lien de texte fléché, pour les actions secondaires. Vert sur fond clair, blanc sur fond sombre. */
export function ArrowLink({
  to,
  href,
  className,
  children,
}: {
  to?: string
  href?: string
  className?: string
  children: ReactNode
}) {
  const tone = useTone()
  const cls = cn(
    "group inline-flex items-center gap-2 text-small font-semibold underline-offset-4 hover:underline",
    tone === "inverse" ? "text-surface" : "text-gehmit",
    className
  )
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
        <Arrow />
      </a>
    )
  }
  return (
    <Link to={to ?? "/"} className={cls}>
      {children}
      <Arrow />
    </Link>
  )
}
