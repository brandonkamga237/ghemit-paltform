import { usePageMeta } from "@/lib/seo"
import { useState } from "react"
import { Link } from "react-router"
import { motion } from "motion/react"
import { cn } from "cn"
import { Container } from "@/components/site/bands"
import { Photo } from "@/components/site/photo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ease = [0.22, 1, 0.36, 1] as const

const amounts = [5_000, 10_000, 50_000]
const equivalences = [
  { amount: "10 000 F", text: "Une séance de mentorat" },
  { amount: "50 000 F", text: "Une place en formation" },
  { amount: "200 000 F", text: "Un séminaire d'orientation" },
]
const methods = [
  { id: "momo", label: "Mobile Money", detail: "MTN · Orange" },
  { id: "card", label: "Carte bancaire", detail: "" },
  { id: "transfer", label: "Virement bancaire", detail: "" },
]

const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/\u202f/g, " ")

export function DonatePage() {
  usePageMeta("Faire un don", "Soutenez la prochaine promotion Gehmit.")
  const [amount, setAmount] = useState<number | "other">(10_000)
  const [custom, setCustom] = useState("")
  const [monthly, setMonthly] = useState(false)
  const [method, setMethod] = useState("momo")
  const [done, setDone] = useState(false)

  const total = amount === "other" ? Number(custom.replace(/\D/g, "")) || 0 : amount

  return (
    <div className="flex flex-col">
      <div className="grid lg:grid-cols-2">
        {/* Panneau impact — photo de fond sous voile doré */}
        <motion.section
          className="relative flex flex-col justify-center gap-6 overflow-hidden bg-gold-tint px-6 py-16 sm:px-11"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease }}
        >
          <Photo
            photo="paei-2024-promotion"
            alt=""
            className="absolute inset-0 h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gold-tint via-gold-tint/95 to-gold-tint/60" />
          <span className="relative font-mono text-xs tracking-[0.16em] text-soon-text uppercase">
            Soutenir Gehmit
          </span>
          <h1 className="relative font-heading text-4xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance sm:text-[44px]">
            Un don finance un accompagnement.
          </h1>
          <div className="relative flex flex-col gap-3.5 pt-1.5">
            {equivalences.map((e) => (
              <div key={e.amount} className="flex items-baseline gap-3.5">
                <span className="tnum min-w-[120px] font-heading text-[26px] font-semibold text-navy">
                  {e.amount}
                </span>
                <span className="text-[16.5px] text-ink-muted">{e.text}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Formulaire de don */}
        <motion.section
          className="flex flex-col gap-6 bg-surface px-6 py-14 sm:px-11"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease }}
        >
          {done ? (
            <div className="flex flex-col gap-2 rounded-lg border border-gehmit bg-open-bg p-6">
              <span className="font-heading text-2xl font-semibold text-open-text">
                Don confirmé
              </span>
              <span className="text-[16.5px] leading-[1.65] text-open-text">
                Merci. Un reçu vous sera envoyé par e-mail.
              </span>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <Label className="text-[15px] font-semibold">Montant</Label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {amounts.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmount(a)}
                      className={cn(
                        "tnum flex h-[52px] items-center justify-center rounded-md text-[15.5px] font-semibold transition-colors",
                        amount === a
                          ? "border-2 border-gold bg-gold-tint"
                          : "border border-sand-dark bg-white hover:border-gold"
                      )}
                    >
                      {fmt(a)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount("other")}
                    className={cn(
                      "flex h-[52px] items-center justify-center rounded-md text-[15.5px] font-semibold transition-colors",
                      amount === "other"
                        ? "border-2 border-gold bg-gold-tint"
                        : "border border-sand-dark bg-white text-ink-faint hover:border-gold"
                    )}
                  >
                    Autre
                  </button>
                </div>
                {amount === "other" && (
                  <Input
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="Montant en FCFA"
                    inputMode="numeric"
                    className="tnum h-12 rounded-md border-sand-dark bg-white px-3.5 text-[15.5px] focus-visible:border-focus focus-visible:ring-focus/20"
                  />
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label className="text-[15px] font-semibold">Fréquence</Label>
                <div className="flex overflow-hidden rounded-md border border-sand-dark bg-white">
                  {["Une fois", "Chaque mois"].map((f, i) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setMonthly(i === 1)}
                      className={cn(
                        "h-12 flex-1 text-[15px] transition-colors",
                        monthly === (i === 1)
                          ? "bg-navy font-semibold text-surface"
                          : "hover:bg-cream"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label className="text-[15px] font-semibold">Moyen de paiement</Label>
                <div className="flex flex-col gap-2.5">
                  {methods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "flex h-14 items-center gap-3 rounded-md border px-4 text-left transition-colors",
                        method === m.id
                          ? "border-2 border-gehmit bg-open-bg"
                          : "border-sand-dark bg-white hover:border-gehmit"
                      )}
                    >
                      <span
                        className={cn(
                          "size-[18px] rounded-full",
                          method === m.id
                            ? "border-[5px] border-gehmit bg-surface"
                            : "border border-sand-dark"
                        )}
                      />
                      <span className="text-base font-semibold">{m.label}</span>
                      {m.detail ? (
                        <span className="ml-auto text-[14.5px] text-ink-muted">{m.detail}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              {method === "momo" && (
                <div className="flex flex-col gap-2">
                  <Label className="text-[15px] font-semibold">Numéro Mobile Money</Label>
                  <Input
                    type="tel"
                    placeholder="+237 6 ..."
                    className="h-12 rounded-md border-sand-dark bg-white px-3.5 text-[15.5px] placeholder:text-ink-faint focus-visible:border-focus focus-visible:ring-focus/20"
                  />
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-sand pt-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-base text-ink-muted">
                    Total{monthly ? " / mois" : ""}
                  </span>
                  <span className="tnum font-heading text-3xl font-semibold">
                    {fmt(total)} FCFA
                  </span>
                </div>
                <Button
                  onClick={() => setDone(true)}
                  disabled={total <= 0}
                  className="h-[52px] rounded-md bg-gold text-base font-semibold text-navy hover:bg-gold-hover active:bg-gold-active"
                >
                  Confirmer le don
                </Button>
                <span className="text-center text-sm leading-normal text-ink-faint">
                  Paiement sécurisé. Reçu envoyé par e-mail.
                </span>
              </div>
            </>
          )}
        </motion.section>
      </div>

      {/* Don en nature */}
      <section className="bg-navy">
        <Container className="flex flex-wrap items-center justify-between gap-8 py-10">
          <div className="flex flex-col gap-1.5">
            <span className="font-heading text-2xl font-semibold text-surface">
              Don en nature ou partenariat
            </span>
            <span className="text-base text-surface/75">
              Matériel informatique, mise à disposition de locaux, mécénat de
              compétences.
            </span>
          </div>
          <Button
            variant="outline"
            render={<Link to="/partenaire" />}
            className="h-12 rounded-md border-surface/40 bg-transparent px-7 text-base font-semibold whitespace-nowrap text-surface hover:bg-surface/10"
          >
            Nous contacter
          </Button>
        </Container>
      </section>
    </div>
  )
}
