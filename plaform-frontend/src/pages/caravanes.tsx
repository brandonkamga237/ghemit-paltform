import { usePageMeta } from "@/lib/seo"
import { useState } from "react"
import { motion } from "motion/react"
import { CheckCircle2Icon, CircleAlertIcon } from "lucide-react"
import { cn } from "cn"
import { apiPost } from "@/lib/api"
import { Photo } from "@/components/site/photo"
import { Reveal } from "@/components/site/reveal"
import { Container } from "@/components/site/bands"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ease = [0.22, 1, 0.36, 1] as const
const inputCls =
  "h-12 rounded-md border-sand-dark bg-white px-3.5 text-[15.5px] placeholder:text-ink-faint focus-visible:border-focus focus-visible:ring-focus/20"

const apartes = [
  {
    title: "Pour les jeunes",
    text: "Une journée au cœur d'une entreprise tech de la sous-région : locaux, équipes, métiers, recrutement. Rien ne remplace le terrain.",
  },
  {
    title: "Pour les entreprises",
    text: "Faites découvrir vos métiers à un groupe de jeunes motivés et repérez vos futurs stagiaires ou recrues en amont.",
  },
  {
    title: "Le format",
    text: "Un après-midi par mois, quinze à vingt jeunes encadrés par Gehmit, présentation des métiers puis échanges informels.",
  },
]

export function CaravanesPage() {
  usePageMeta("Caravanes numériques", "Les caravanes Gehmit vont à la rencontre des jeunes dans les établissements et les quartiers.")
  const [tab, setTab] = useState<"jeune" | "entreprise">("jeune")
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ nom: "", email: "", tel: "", organisation: "" })

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.nom.trim()) errs.nom = "Indiquez votre nom."
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Indiquez une adresse e-mail valide."
    if (tab === "entreprise" && !form.organisation.trim())
      errs.organisation = "Indiquez le nom de l'entreprise."
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSending(true)
    setSubmitError(false)
    try {
      await apiPost("/api/public/candidatures", {
        program: tab === "jeune" ? "caravanes-jeune" : "caravanes-entreprise",
        form: {
          prenom: form.nom,
          email: form.email,
          tel: form.tel,
          ...(tab === "entreprise" ? { organisation: form.organisation } : {}),
        },
      })
      setSent(true)
    } catch {
      setSubmitError(true)
    } finally {
      setSending(false)
    }
  }

  const reset = () => {
    setSent(false)
    setForm({ nom: "", email: "", tel: "", organisation: "" })
  }

  return (
    <div className="flex flex-col">
      {/* Héros navy — bannière compacte (page secondaire) */}
      <section className="grid bg-navy lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          className="flex flex-col justify-center gap-4 px-6 py-10 sm:px-11"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease }}
        >
          <span className="font-mono text-xs tracking-[0.16em] text-gold uppercase">
            Programmes / Caravanes
          </span>
          <motion.h1
            className="font-heading text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance text-surface sm:text-4xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
          >
            Les caravanes : un après-midi dans une entreprise tech.
          </motion.h1>
          <motion.p
            className="max-w-[480px] text-lg leading-[1.65] text-surface/80"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease }}
          >
            Chaque mois, un groupe de jeunes visite une entreprise de la sous-région : métiers, équipes, coulisses — et les premières rencontres qui comptent.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease }}
          >
            <Button
              render={<a href="#inscription" />}
              className="h-12 self-start rounded-md bg-gehmit px-7 text-base font-semibold text-surface hover:bg-gehmit-hover"
            >
              Participer à la prochaine
            </Button>
          </motion.div>
        </motion.div>
        <div className="min-h-[200px] lg:min-h-[260px]">
          <Photo
            photo="paei-2024-groupe"
            alt="Groupe de jeunes de la promotion PAEI 2024"
            dark
            className="h-full"
          />
        </div>
      </section>

      {/* À part */}
      <section className="bg-surface">
        <Container className="grid gap-8 py-14 md:grid-cols-3">
          {apartes.map((a, i) => (
            <Reveal
              key={a.title}
              delay={i * 0.08}
              className={
                "flex flex-col gap-3 border-t-2 pt-5 " +
                (i === 0 ? "border-gehmit" : "border-sand")
              }
            >
              <span className="font-heading text-[21px] font-semibold">{a.title}</span>
              <p className="text-[15.5px] leading-[1.65] text-ink-muted">{a.text}</p>
            </Reveal>
          ))}
        </Container>
      </section>

      {/* Inscription */}
      <section id="inscription" className="scroll-mt-24 border-t border-sand bg-cream">
        <Container className="flex max-w-[760px] flex-col gap-7 py-14">
          <Reveal className="flex flex-col gap-3">
            <h2 className="font-heading text-3xl font-semibold">Participer</h2>
            <p className="text-[16.5px] leading-relaxed text-ink-muted">
              Places limitées à chaque caravane. Nous confirmons par e-mail ou
              WhatsApp une semaine avant la visite.
            </p>
          </Reveal>

          <div className="flex gap-2">
            <button
              onClick={() => { setTab("jeune"); reset() }}
              className={cn(
                "h-11 flex-1 rounded-md border text-[15px] font-semibold transition-colors sm:flex-none sm:px-6",
                tab === "jeune"
                  ? "border-gehmit bg-gehmit text-surface"
                  : "border-sand-dark bg-surface text-ink-muted hover:border-gehmit"
              )}
            >
              Je suis un·e jeune
            </button>
            <button
              onClick={() => { setTab("entreprise"); reset() }}
              className={cn(
                "h-11 flex-1 rounded-md border text-[15px] font-semibold transition-colors sm:flex-none sm:px-6",
                tab === "entreprise"
                  ? "border-gehmit bg-gehmit text-surface"
                  : "border-sand-dark bg-surface text-ink-muted hover:border-gehmit"
              )}
            >
              Nous sommes une entreprise
            </button>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className="flex gap-4 rounded-lg border border-gehmit bg-open-bg p-6"
            >
              <CheckCircle2Icon className="mt-0.5 size-6 shrink-0 text-gehmit" />
              <div className="flex flex-col gap-2">
                <span className="font-heading text-2xl font-semibold text-open-text">
                  Inscription enregistrée
                </span>
                <span className="text-[16.5px] leading-[1.65] text-open-text">
                  {tab === "jeune"
                    ? "Nous vous contactons dès que la prochaine caravane est programmée."
                    : "L'équipe vous contacte pour préparer l'accueil du groupe."}
                </span>
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={submit}
              className="flex flex-col gap-5 rounded-lg border border-sand-dark bg-surface p-6 sm:p-8"
            >
              {tab === "entreprise" && (
                <div className="flex flex-col gap-2">
                  <Label className="text-[15px] font-semibold">Entreprise</Label>
                  <Input
                    value={form.organisation}
                    onChange={(e) => set("organisation", e.target.value)}
                    placeholder="Nom de l'entreprise"
                    aria-invalid={!!errors.organisation}
                    className={inputCls}
                  />
                  {errors.organisation && (
                    <span className="flex items-center gap-1.5 text-[13.5px] text-soon-text">
                      <CircleAlertIcon className="size-3.5" />
                      {errors.organisation}
                    </span>
                  )}
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-[15px] font-semibold">
                    {tab === "jeune" ? "Nom complet" : "Personne à contacter"}
                  </Label>
                  <Input
                    value={form.nom}
                    onChange={(e) => set("nom", e.target.value)}
                    placeholder="Prénom Nom"
                    aria-invalid={!!errors.nom}
                    className={inputCls}
                  />
                  {errors.nom && (
                    <span className="flex items-center gap-1.5 text-[13.5px] text-soon-text">
                      <CircleAlertIcon className="size-3.5" />
                      {errors.nom}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-[15px] font-semibold">Adresse e-mail</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="votre@email.com"
                    aria-invalid={!!errors.email}
                    className={inputCls}
                  />
                  {errors.email && (
                    <span className="flex items-center gap-1.5 text-[13.5px] text-soon-text">
                      <CircleAlertIcon className="size-3.5" />
                      {errors.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[15px] font-semibold">Téléphone / WhatsApp</Label>
                <Input
                  type="tel"
                  value={form.tel}
                  onChange={(e) => set("tel", e.target.value)}
                  placeholder="+237 6 71 13 02 66"
                  className={inputCls}
                />
              </div>
              <div className="flex items-center justify-between border-t border-sand pt-4">
                <span className="text-[15px] font-semibold text-ink-muted">
                  Gratuit, sur place à Douala
                </span>
                <Button
                  type="submit"
                  disabled={sending}
                  className="h-12 rounded-md bg-gehmit px-7 text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
                >
                  {sending ? "Envoi…" : "S'inscrire"}
                </Button>
              </div>
              {submitError && (
                <span className="flex items-center gap-1.5 text-[14px] text-soon-text">
                  <CircleAlertIcon className="size-4" />
                  Envoi impossible pour le moment. Vérifiez votre connexion et réessayez.
                </span>
              )}
            </form>
          )}
        </Container>
      </section>
    </div>
  )
}
