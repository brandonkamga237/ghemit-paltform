import { useState } from "react"
import { Link } from "react-router"
import { motion } from "motion/react"
import { cn } from "cn"
import { formations } from "@/data/content"
import { PageHeader } from "@/components/site/page-header"
import { Container } from "@/components/site/bands"
import { Reveal } from "@/components/site/reveal"
import { StatusPill } from "@/components/site/status-pill"
import { Button } from "@/components/ui/button"

const filters = ["Toutes", "Data", "Développement", "IA", "En ligne", "Douala"]

export function FormationsPage() {
  const [filter, setFilter] = useState("Toutes")

  const rows = formations.filter((f) => {
    if (filter === "Toutes") return true
    if (filter === "En ligne" || filter === "Douala") return f.format === filter
    return f.category === filter
  })

  return (
    <div className="flex flex-col">
      <Container>
        <PageHeader
          trail={[
            { label: "Programmes", to: "/programmes" },
            { label: "Formations" },
          ]}
          title="Catalogue des formations"
          lede="Durées, tarifs et dates réelles, mis à jour par l'équipe."
        />
      </Container>

      {/* Filtres */}
      <Container className="flex flex-wrap items-center gap-2.5 pb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "h-11 rounded-full px-4.5 text-[14.5px] transition-colors duration-150",
              filter === f
                ? "bg-navy font-semibold text-surface"
                : "border border-sand-dark bg-surface hover:border-navy"
            )}
          >
            {f}
          </button>
        ))}
      </Container>

      {/* Tableau */}
      <Container className="pb-12">
        <Reveal className="overflow-hidden rounded-lg border border-sand-dark bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-sand-dark bg-cream">
                  {["Formation", "Prochaine session", "Durée", "Format", "Tarif"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 font-mono text-[11px] font-medium tracking-[0.1em] text-ink-faint uppercase"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-right font-mono text-[11px] font-medium tracking-[0.1em] text-ink-faint uppercase">
                    État
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((f, i) => {
                  const done = f.status === "closed"
                  return (
                    <motion.tr
                      key={f.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className={cn(
                        "border-b border-sand last:border-0",
                        i % 2 === 1 && "bg-cream/60"
                      )}
                    >
                      <td className={cn("px-5 py-5 text-[17px] font-semibold", done && "text-ink-faint")}>
                        {f.name}
                      </td>
                      <td className={cn("tnum px-3 py-5 text-[15.5px]", done ? "text-ink-faint" : "text-ink-muted")}>
                        {f.session}
                      </td>
                      <td className={cn("px-3 py-5 text-[15.5px]", done ? "text-ink-faint" : "text-ink-muted")}>
                        {f.duration}
                      </td>
                      <td className={cn("px-3 py-5 text-[15.5px]", done ? "text-ink-faint" : "text-ink-muted")}>
                        {f.format}
                      </td>
                      <td className={cn("px-3 py-5 text-[15.5px]", done ? "text-ink-faint" : "text-ink-muted")}>
                        {f.price}
                      </td>
                      <td className="px-5 py-5 text-right">
                        {f.status === "open" ? (
                          <Button
                            render={<Link to="/contact" />}
                            className="h-10 rounded-md bg-gehmit px-4.5 text-[14.5px] font-semibold text-surface hover:bg-gehmit-hover"
                          >
                            S'inscrire
                          </Button>
                        ) : (
                          <StatusPill status={f.status} label={f.statusLabel} />
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
        {rows.length === 0 && (
          <p className="py-10 text-center text-[15.5px] text-ink-muted">
            Aucune session programmée pour le moment.
          </p>
        )}
      </Container>
    </div>
  )
}
