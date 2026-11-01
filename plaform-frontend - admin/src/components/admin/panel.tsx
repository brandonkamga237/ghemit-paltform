import type { ReactNode } from "react"
import { Link } from "react-router"
import { ArrowRightIcon } from "lucide-react"
import { cn } from "@gehmit/ui/cn"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@gehmit/ui/components/card"

/**
 * Carte de tableau de bord : titre, description, action à droite (lien,
 * sélecteur…) et contenu. Toutes les cartes du back office ont cette forme.
 */
export function Panel({
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}) {
  return (
    <Card className={className}>
      <CardHeader className={cn("pb-3", action && "flex-row flex-wrap items-center justify-between gap-3")}>
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-body">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  )
}

/** Lien discret « Gérer → » dans l'en-tête d'une carte. */
export function PanelLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="flex items-center gap-1 text-caption text-gehmit hover:underline">
      {children}
      <ArrowRightIcon className="size-3.5" />
    </Link>
  )
}
