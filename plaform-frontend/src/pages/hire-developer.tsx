import { useState } from "react"
import { motion } from "motion/react"
import { CheckCircle2Icon, CircleAlertIcon } from "lucide-react"
import { cn } from "cn"
import { pg } from "@/data/content"
import { apiPost } from "@/lib/api"
import { Photo } from "@/components/site/photo"
import { Reveal } from "@/components/site/reveal"
import { Container } from "@/components/site/bands"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ease = [0.22, 1, 0.36, 1] as const
const inputCls =
  "h-12 rounded-md border-sand-dark bg-white px-3.5 text-[15.5px] placeholder:text-ink-faint focus-visible:border-focus focus-visible:ring-focus/20"

const besoins = [
  "Mission ponctuelle",
  "Projet (1 à 6 mois)",
  "Recrutement CDI / CDD",
  "Stage",
]

const profils = [
  "Développeur·se front-end",
  "Développeur·se back-end",
  "Développeur·se full-stack",
  "Développeur·se mobile",
  "Data / IA",
  "Designer UI/UX",
]

const steps = [
  {
    title: "Décrivez le besoin",
    text: "Profil, mission, durée et budget indicatif — le formulaire prend cinq minutes.",
  },
  {
    title: "Nous présélectionnons",
    text: "Trois à cinq profils du vivier Junior Builders, vérifiés par l'équipe, sous dix jours ouvrés.",
  },
  {
    title: "Vous rencontrez",
    text: "Entretiens directs avec les profils retenus. La contractualisation se fait entre vous — Gehmit ne prend aucune commission.",
  },
]

export function HireDeveloperPage() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    organisation: "",
    interlocuteur: "",
    email: "",
    tel: "",
    profil: "",
    besoin: "",
    mission: "",
    budget: "",
  })

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.organisation.trim()) errs.organisation = "Indiquez le nom de l'organisation."
    if (!form.interlocuteur.trim()) errs.interlocuteur = "Indiquez la personne à contacter."
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Indiquez une adresse e-mail valide."
    if (!form.profil) errs.profil = "Choisissez le profil recherché."
    if (!form.besoin) errs.besoin = "Choisissez le type de besoin."
    if (!form.mission.trim()) errs.mission = "Décrivez la mission en quelques lignes."
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSending(true)
    setSubmitError(false)
    try {
      await apiPost("/api/public/candidatures", {
        program: "louer-developpeur",
        form: {
          prenom: form.interlocuteur,
          organisation: form.organisation,
          email: form.email,
          tel: form.tel,
          profilRecherche: form.profil,
          typeBesoin: form.besoin,
          mission: form.mission,
          budget: form.budget,
        },
      })
      setSent(true)
    } catch {
      setSubmitError(true)
    } finally {
      setSending(false)
    }
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
            Solutions / Louer un développeur
          </span>
          <motion.h1
            className="font-heading text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance text-surface sm:text-4xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
          >
            {pg("hiredeveloper.hero.title")}
          </motion.h1>
          <motion.p
            className="max-w-[480px] text-lg leading-[1.65] text-surface/80"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease }}
          >
            {pg("hiredeveloper.hero.lede")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease }}
          >
            <Button
              render={<a href="#besoin" />}
              className="h-12 self-start rounded-md bg-gehmit px-7 text-base font-semibold text-surface hover:bg-gehmit-hover"
            >
              Décrire mon besoin
            </Button>
          </motion.div>
        </motion.div>
        <div className="min-h-[200px] lg:min-h-[260px]">
          <Photo label="Photo — entretien entreprise / jeune développeur" dark className="h-full" />
        </div>
      </section>

      {/* Étapes */}
      <section className="bg-surface">
        <Container className="flex flex-col gap-8 py-14">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold">Comment ça marche</h2>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal
                key={s.title}
                delay={i * 0.09}
                className={
                  "flex flex-col gap-3 border-t-2 pt-5 " +
                  (i === 0 ? "border-gehmit" : "border-sand")
                }
              >
                <span className="font-mono text-sm text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-heading text-[22px] font-semibold">{s.title}</span>
                <p className="text-base leading-[1.65] text-ink-muted">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Formulaire */}
      <section id="besoin" className="scroll-mt-24 border-t border-sand bg-cream">
        <Container className="grid items-start gap-12 py-14 lg:grid-cols-[1fr_320px] lg:gap-14">
          <div className="flex max-w-[720px] flex-col gap-7">
            <Reveal className="flex flex-col gap-3">
              <h2 className="font-heading text-3xl font-semibold">Décrire mon besoin</h2>
              <p className="text-[16.5px] leading-relaxed text-ink-muted">
                Réponse sous 48 heures ouvrées, présélection sous dix jours.
              </p>
            </Reveal>

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
                    Besoin enregistré
                  </span>
                  <span className="text-[16.5px] leading-[1.65] text-open-text">
                    Nous revenons vers {form.interlocuteur} à {form.email} sous 48
                    heures ouvrées pour affiner le profil.
                  </span>
                </div>
              </motion.div>
            ) : (
              <form
                onSubmit={submit}
                className="flex flex-col gap-6 rounded-lg border border-sand-dark bg-surface p-6 sm:p-8"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Organisation" error={errors.organisation}>
                    <Input value={form.organisation} onChange={(e) => set("organisation", e.target.value)} placeholder="Nom de l'entreprise" aria-invalid={!!errors.organisation} className={inputCls} />
                  </Field>
                  <Field label="Personne à contacter" error={errors.interlocuteur}>
                    <Input value={form.interlocuteur} onChange={(e) => set("interlocuteur", e.target.value)} placeholder="Prénom Nom" aria-invalid={!!errors.interlocuteur} className={inputCls} />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Adresse e-mail" error={errors.email}>
                    <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@entreprise.com" aria-invalid={!!errors.email} className={inputCls} />
                  </Field>
                  <Field label="Téléphone">
                    <Input type="tel" value={form.tel} onChange={(e) => set("tel", e.target.value)} placeholder="+237 6 71 13 02 66" className={inputCls} />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Profil recherché" error={errors.profil}>
                    <Select value={form.profil} onValueChange={(v) => set("profil", v as string)}>
                      <SelectTrigger aria-invalid={!!errors.profil} className={cn(inputCls, "w-full justify-between")}>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {profils.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Type de besoin" error={errors.besoin}>
                    <Select value={form.besoin} onValueChange={(v) => set("besoin", v as string)}>
                      <SelectTrigger aria-invalid={!!errors.besoin} className={cn(inputCls, "w-full justify-between")}>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {besoins.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="La mission" error={errors.mission} hint="Contexte, objectifs, technologies, lieu (Douala, à distance…).">
                  <Textarea
                    value={form.mission}
                    onChange={(e) => set("mission", e.target.value.slice(0, 800))}
                    placeholder="Ex. refonte d'un site e-commerce en React, 3 mois, à distance…"
                    aria-invalid={!!errors.mission}
                    className="min-h-[120px] rounded-md border-sand-dark bg-white p-3.5 text-[15.5px] leading-relaxed placeholder:text-ink-faint focus-visible:border-focus focus-visible:ring-focus/20"
                  />
                  <div className="flex justify-end text-[13.5px] text-ink-faint">
                    <span className="font-mono">{form.mission.length} / 800</span>
                  </div>
                </Field>
                <Field label="Budget indicatif" hint="Facultatif. Une fourchette suffit.">
                  <Input value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="Ex. 150 000 – 300 000 FCFA / mois" className={inputCls} />
                </Field>

                <div className="flex items-center justify-between border-t border-sand pt-4">
                  <span className="text-[15px] font-semibold text-ink-muted">
                    Sans commission
                  </span>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="h-12 rounded-md bg-gehmit px-7 text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
                  >
                    {sending ? "Envoi…" : "Envoyer le besoin"}
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
          </div>

          {/* Récapitulatif */}
          <aside className="flex flex-col gap-4 rounded-lg border border-sand-dark bg-surface p-6 lg:sticky lg:top-28">
            <span className="font-mono text-[11px] tracking-[0.12em] text-ink-faint uppercase">
              Le service
            </span>
            <span className="font-heading text-[22px] font-semibold">Mise en relation</span>
            <div className="flex flex-col gap-2.5 border-y border-sand py-3.5">
              <div className="flex justify-between text-[15px]">
                <span className="text-ink-faint">Commission</span>
                <span className="font-medium">0&nbsp;%</span>
              </div>
              <div className="flex justify-between text-[15px]">
                <span className="text-ink-faint">Présélection</span>
                <span className="font-medium">Sous 10 jours</span>
              </div>
              <div className="flex justify-between text-[15px]">
                <span className="text-ink-faint">Réponse</span>
                <span className="font-medium">Sous 48 h</span>
              </div>
            </div>
            <p className="text-[14.5px] leading-relaxed text-ink-muted">
              Les profils sont vérifiés par l'équipe Gehmit sur la base de leurs
              réalisations réelles (code, projets, portfolio).
            </p>
          </aside>
        </Container>
      </section>
    </div>
  )
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[15px] font-semibold text-navy">{label}</Label>
      {children}
      {error ? (
        <span className="flex items-center gap-1.5 text-[13.5px] text-soon-text">
          <CircleAlertIcon className="size-3.5" />
          {error}
        </span>
      ) : hint ? (
        <span className="text-[13.5px] text-ink-faint">{hint}</span>
      ) : null}
    </div>
  )
}
