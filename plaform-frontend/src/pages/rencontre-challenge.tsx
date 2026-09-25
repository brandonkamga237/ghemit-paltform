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

const profils = ["Étudiant·e", "Jeune diplômé·e", "Autodidacte", "Jeune pro", "Autre"]

const formats = [
  {
    title: "Le défi",
    text: "Un problème concret posé par une entreprise partenaire, à résoudre en équipe en quelques heures.",
  },
  {
    title: "La rencontre",
    text: "Recruteurs, mentors et professionnels sur place : chaque équipe présente sa solution devant le jury.",
  },
  {
    title: "Les suites",
    text: "Stages, missions et mentorats pour les profils remarqués — les meilleures idées rejoignent parfois le stage Gehmit.",
  },
]

export function RencontreChallengePage() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ nom: "", email: "", tel: "", profil: "" })

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.nom.trim()) errs.nom = "Indiquez votre nom."
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Indiquez une adresse e-mail valide."
    if (!form.profil) errs.profil = "Choisissez votre profil."
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSending(true)
    setSubmitError(false)
    try {
      await apiPost("/api/public/candidatures", {
        program: "rencontre-challenge",
        form: {
          prenom: form.nom,
          email: form.email,
          tel: form.tel,
          situation: form.profil,
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
            Programmes / Rencontre Challenge
          </span>
          <motion.h1
            className="font-heading text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance text-surface sm:text-4xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
          >
            {pg("challenge.hero.title")}
          </motion.h1>
          <motion.p
            className="max-w-[480px] text-lg leading-[1.65] text-surface/80"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease }}
          >
            {pg("challenge.hero.lede")}
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
              S'inscrire à la prochaine édition
            </Button>
          </motion.div>
        </motion.div>
        <div className="min-h-[200px] lg:min-h-[260px]">
          <Photo label="Photo — équipe présentant sa solution au jury" dark className="h-full" />
        </div>
      </section>

      {/* Formats */}
      <section className="bg-surface">
        <Container className="grid gap-8 py-14 md:grid-cols-3">
          {formats.map((f, i) => (
            <Reveal
              key={f.title}
              delay={i * 0.08}
              className={
                "flex flex-col gap-3 border-t-2 pt-5 " +
                (i === 0 ? "border-gehmit" : "border-sand")
              }
            >
              <span className="font-heading text-[21px] font-semibold">{f.title}</span>
              <p className="text-[15.5px] leading-[1.65] text-ink-muted">{f.text}</p>
            </Reveal>
          ))}
        </Container>
      </section>

      {/* Inscription */}
      <section id="inscription" className="scroll-mt-24 border-t border-sand bg-cream">
        <Container className="flex max-w-[760px] flex-col gap-7 py-14">
          <Reveal className="flex flex-col gap-3">
            <h2 className="font-heading text-3xl font-semibold">S'inscrire</h2>
            <p className="text-[16.5px] leading-relaxed text-ink-muted">
              Ouvert à tous les profils, débutants compris. Les équipes sont
              constituées sur place. Places limitées, confirmation par e-mail.
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
                  Inscription enregistrée
                </span>
                <span className="text-[16.5px] leading-[1.65] text-open-text">
                  Nous vous envoyons le programme détaillé à {form.email} dès
                  l'annonce de la prochaine édition.
                </span>
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={submit}
              className="flex flex-col gap-5 rounded-lg border border-sand-dark bg-surface p-6 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-[15px] font-semibold">Nom complet</Label>
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
              <div className="grid gap-5 sm:grid-cols-2">
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
                <div className="flex flex-col gap-2">
                  <Label className="text-[15px] font-semibold">Votre profil</Label>
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
                  {errors.profil && (
                    <span className="flex items-center gap-1.5 text-[13.5px] text-soon-text">
                      <CircleAlertIcon className="size-3.5" />
                      {errors.profil}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-sand pt-4">
                <span className="text-[15px] font-semibold text-ink-muted">
                  Gratuit, une journée à Douala
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
