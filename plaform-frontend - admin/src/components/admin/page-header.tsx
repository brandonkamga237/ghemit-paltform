import type { ReactNode } from "react"

/** En-tête d'écran du back office : titre éditorial, phrase d'aide, actions. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-sand-dark pb-6">
      <div className="flex max-w-[720px] flex-col gap-2">
        <h1 className="font-heading text-h2 font-semibold text-navy">
          {title}
        </h1>
        {description ? <p className="text-small text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </div>
  )
}
