import { Link } from "react-router"
import { motion } from "motion/react"
import { cn } from "cn"

export function Breadcrumb({ trail }: { trail: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 font-mono text-xs tracking-[0.16em] uppercase">
      {trail.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-faint">/</span>}
          {item.to ? (
            <Link to={item.to} className="text-ink-faint transition-colors hover:text-gehmit">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-faint">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

/** En-tête de page niveau 2 : fil d'Ariane, titre Lora, chapô. */
export function PageHeader({
  trail,
  title,
  lede,
  className,
}: {
  trail: { label: string; to?: string }[]
  title: string
  lede?: string
  className?: string
}) {
  return (
    <motion.div
      className={cn("flex flex-col gap-4 px-5 pt-14 pb-10 sm:px-10", className)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Breadcrumb trail={trail} />
      <h1 className="font-heading text-4xl leading-[1.08] font-semibold tracking-[-0.02em] text-balance sm:text-5xl">
        {title}
      </h1>
      {lede ? (
        <p className="max-w-[680px] text-lg leading-relaxed text-ink-muted">{lede}</p>
      ) : null}
    </motion.div>
  )
}
