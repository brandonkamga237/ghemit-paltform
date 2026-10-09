import { useState } from "react"
import { Link } from "react-router"
import { ArrowRightIcon, MailIcon, MessageCircleIcon } from "lucide-react"
import { cn } from "@/lib/cn"
import { contact, donationEquivalences, whatsappUrl } from "@/data/content"
import { usePageMeta } from "@/lib/seo"
import { Container } from "@/components/site/bands"
import { Breadcrumb } from "@/components/site/page-header"
import { Figure } from "@/components/site/photo"
import { Input } from "@/components/ui/input"
import { ChoiceGroup, Field, inputCls } from "@/components/site/form"

const amounts = [5_000, 10_000, 50_000]
const methods = ["Mobile Money", "Carte bancaire", "Virement bancaire"]
const frequencies = ["Une fois", "Chaque mois"]

const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/\u202f/g, " ")

/**
 * Le paiement en ligne n'est pas encore branché : la page recueille l'intention
 * (montant, fréquence, moyen) et la transmet à l'équipe par WhatsApp ou e-mail,
 * qui renvoie les coordonnées de paiement et le reçu. Rien n'est présenté comme
 * encaissé.
 */
export function DonatePage() {
  usePageMeta("Faire un don", "Soutenez la prochaine promotion Gehmit : Mobile Money, carte ou virement.")
  const [amount, setAmount] = useState<number | "other">(10_000)
  const [custom, setCustom] = useState("")
  const [frequency, setFrequency] = useState(frequencies[0])
  const [method, setMethod] = useState(methods[0])

  const total = amount === "other" ? Number(custom.replace(/\D/g, "")) || 0 : amount
  const message = `Bonjour, je souhaite faire un don de ${fmt(total)} FCFA${
    frequency === "Chaque mois" ? " par mois" : ""
  } par ${method}. Pouvez-vous m'indiquer les coordonnées de paiement ?`
  const waLink = `${whatsappUrl}?text=${encodeURIComponent(message)}`
  const mailLink = `mailto:${contact.email}?subject=${encodeURIComponent("Don à Gehmit")}&body=${encodeURIComponent(message)}`

  return (
    <div className="flex flex-col">
      <section className="bg-cream">
        <Container className="grid items-start gap-block pt-block pb-section lg:grid-cols-12">
          {/* Ce que finance un don */}
          <div className="flex flex-col gap-group lg:col-span-6">
            <Breadcrumb trail={[{ label: "Accueil", to: "/" }, { label: "Faire un don" }]} />
            <h1 className="font-heading text-display font-semibold text-navy">
              Un don finance <span className="accent-word">un accompagnement</span>.
            </h1>
            <dl className="flex flex-col border-t border-sand-dark">
              {donationEquivalences.map((e) => (
                <div key={e.amount} className="flex items-baseline justify-between gap-4 border-b border-sand py-4">
                  <dt className="text-body text-navy/80">{e.text}</dt>
                  <dd className="tnum font-heading text-h3 font-semibold text-navy">{e.amount}</dd>
                </div>
              ))}
            </dl>
            <Figure
              photo="paei-2024-groupe"
              alt="Une promotion du programme PAEI"
              sizes="(min-width: 1024px) 40vw, 100vw"
              frameClassName="aspect-[16/10]"
            />
          </div>

          {/* Intention de don */}
          <div className="flex flex-col gap-group bg-surface p-6 shadow-[0_1px_0_var(--color-sand-dark)] sm:p-9 lg:sticky lg:top-24 lg:col-span-5 lg:col-start-8">
            <p className="bg-gold-tint px-4 py-3 text-small text-navy/80">
              Le paiement en ligne arrive bientôt. En attendant, choisissez votre don : l'équipe vous
              envoie les coordonnées de paiement et votre reçu.
            </p>

            <Field label="Montant (FCFA)" as="div">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {amounts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={amount === a}
                    onClick={() => setAmount(a)}
                    className={cn(
                      "tnum h-[52px] rounded-sm border text-body font-semibold transition-colors",
                      amount === a ? "border-navy bg-navy text-surface" : "border-sand-dark bg-white text-navy hover:border-navy"
                    )}
                  >
                    {fmt(a)}
                  </button>
                ))}
                <button
                  type="button"
                  aria-pressed={amount === "other"}
                  onClick={() => setAmount("other")}
                  className={cn(
                    "h-[52px] rounded-sm border text-body font-semibold transition-colors",
                    amount === "other" ? "border-navy bg-navy text-surface" : "border-sand-dark bg-white text-navy hover:border-navy"
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
                  aria-label="Montant libre en FCFA"
                  className={cn(inputCls, "tnum")}
                />
              )}
            </Field>

            <Field label="Fréquence" as="div">
              <ChoiceGroup options={frequencies} value={frequency} onChange={setFrequency} />
            </Field>

            <Field label="Moyen de paiement" as="div" hint={method === "Mobile Money" ? "MTN et Orange." : undefined}>
              <ChoiceGroup options={methods} value={method} onChange={setMethod} />
            </Field>

            <div className="flex flex-col gap-4 border-t border-sand pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-body text-ink-muted">Votre don{frequency === "Chaque mois" ? " / mois" : ""}</span>
                <span className="tnum font-heading text-h2 font-semibold text-navy">{fmt(total)} FCFA</span>
              </div>
              <a
                href={total > 0 ? waLink : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={total <= 0}
                className={cn(
                  "flex h-[52px] items-center justify-center gap-2.5 rounded-sm bg-gold text-body font-semibold text-navy transition-colors hover:bg-gold-hover",
                  total <= 0 && "pointer-events-none opacity-50"
                )}
              >
                <MessageCircleIcon className="size-5" strokeWidth={1.8} />
                Finaliser sur WhatsApp
              </a>
              <a
                href={total > 0 ? mailLink : undefined}
                aria-disabled={total <= 0}
                className={cn(
                  "flex h-12 items-center justify-center gap-2.5 rounded-sm border border-navy/25 text-small font-semibold text-navy transition-colors hover:border-navy",
                  total <= 0 && "pointer-events-none opacity-50"
                )}
              >
                <MailIcon className="size-4" />
                Ou par e-mail
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Don en nature */}
      <section className="bg-navy text-surface">
        <Container className="flex flex-wrap items-center justify-between gap-group py-block">
          <div className="flex flex-col gap-1.5">
            <span className="font-heading text-h3 font-semibold">Don en nature ou partenariat</span>
            <span className="text-body text-surface/70">
              Matériel informatique, mise à disposition de locaux, mécénat de compétences.
            </span>
          </div>
          <Link
            to="/partenaire"
            className="group inline-flex items-center gap-2 text-body font-semibold text-gold underline-offset-4 hover:underline"
          >
            Devenir partenaire
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Container>
      </section>
    </div>
  )
}
