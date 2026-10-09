import type { ReactNode } from "react"
import { cn } from "cn"

/** Colonne centrale du site : 1240 px maximum, gouttières 20 / 40 px. */
export function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1240px] px-5 sm:px-10", className)}>
      {children}
    </div>
  )
}
