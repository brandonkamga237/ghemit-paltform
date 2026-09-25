import { useState } from "react"
import { motion } from "motion/react"
import { CheckCircle2Icon, CircleAlertIcon, FileTextIcon } from "lucide-react"
import { cn } from "cn"
import { pg } from "@/data/content"
import { apiPost, uploadCv } from "@/lib/api"
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

const stacks = [
  "Front-end (React, Vue…)",
  "Back-end (Java, Node, PHP…)",
  "Mobile (Flutter, Kotlin…)",
  "Full-stack",
  "Data / IA",
  "Design UI/UX",
  "Autre",
]

const niveaux = ["Débutant (< 1 an)", "Intermédiaire (1–2 ans)", "Confirmé (2 ans et +)"]

const dispos = [
  "Immédiate",
  "Dans le mois",
  "Temps partiel uniquement",
  "Soirs et week-ends",
]

const infos = [
  {
    title: "Ce qu'est Junior Builders",
    text: "Un vivier de jeunes talents du numérique que Gehmit présente aux entreprises pour des missions ponctuelles, des projets ou des embauches.",
  },
  {
    title: "Ce que nous vérifions",
    text: "Vos réalisations (code, maquettes, projets), pas vos diplômes. Un lien GitHub ou portfolio vaut mieux qu'un long CV.",
  },
  {
    title: "Ce qui se passe ensuite",
    text: "Votre profil est étudié sous dix jours ouvrés. S'il est retenu, vous entrez dans le vivier et êtes présenté·e aux entreprises qui cherchent votre profil.",
  },
]

export function JuniorBuildersPage() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvName, setCvName] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    tel: "",
    stack: "",
    niveau: "",
    disponibilite: "",
    portfolio: "",
    projets: "",
    motivation: "",
  })

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.prenom.trim()) errs.prenom = "Indiquez votre prénom."
    if (!form.nom.trim()) errs.nom = "Indiquez votre nom."
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Indiquez une adresse e-mail valide."
    if (!form.tel.trim()) errs.tel = "Indiquez un numéro où vous joindre."
    if (!form.stack) errs.stack = "Choisissez votre spécialité."
    if (!form.niveau) errs.niveau = "Choisissez votre niveau."
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSending(true)
    setSubmitError(false)
    try {
      let payload: Record<string, string> = { ...form }
      if (cvFile) {
        const cv = await uploadCv(cvFile)
        payload = { ...payload, cv: cv.filename, cvUrl: cv.url }
      }
      if (cvName) payload = { ...payload, cv: payload.cv ?? cvName }
      await apiPost("/api/public/candidatures", { program: "junior-builders", form: payload })
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
            Programmes / Junior Builders
          </span>
          <motion.h1
            className="font-heading text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance text-surface sm:text-4xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
          >
            {pg("juniorbuilders.hero.title")}
          </motion.h1>
          <motion.p
            className="max-w-[480px] text-lg leading-[1.65] text-surface/80"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease }}
          >
            {pg("juniorbuilders.hero.lede")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease }}
          >
            <Button
              render={<a href="#rejoindre" />}
              className="h-12 self-start rounded-md bg-gehmit px-7 text-base font-semibold text-surface hover:bg-gehmit-hover"
            >
              Rejoindre le vivier
            </Button>
          </motion.div>
        </motion.div>
        <div className="min-h-[200px] lg:min-h-[260px]">
          <Photo label="Photo — jeunes développeurs en session de travail" dark className="h-full" />
        </div>
      </section>

      {/* Infos clés */}
      <section className="bg-surface">
        <Container className="grid gap-8 py-14 md:grid-cols-3">
          {infos.map((i, n) => (
            <Reveal
              key={i.title}
              delay={n * 0.08}
              className={
                "flex flex-col gap-3 border-t-2 pt-5 " +
                (n === 0 ? "border-gehmit" : "border-sand")
              }
            >
              <span className="font-heading text-[21px] font-semibold">{i.title}</span>
              <p className="text-[15.5px] leading-[1.65] text-ink-muted">{i.text}</p>
            </Reveal>
          ))}
        </Container>
      </section>

      {/* Formulaire dédié */}
      <section id="rejoindre" className="scroll-mt-24 border-t border-sand bg-cream">
        <Container className="grid items-start gap-12 py-14 lg:grid-cols-[1fr_320px] lg:gap-14">
          <div className="flex max-w-[720px] flex-col gap-7">
            <Reveal className="flex flex-col gap-3">
              <h2 className="font-heading text-3xl font-semibold">Rejoindre le vivier</h2>
              <p className="text-[16.5px] leading-relaxed text-ink-muted">
                Dix minutes. Votre portfolio compte autant que votre CV.
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
                    Profil envoyé
                  </span>
                  <span className="text-[16.5px] leading-[1.65] text-open-text">
                    Nous étudions votre profil et revenons vers vous à {form.email}{" "}
                    sous dix jours ouvrés.
                  </span>
                </div>
              </motion.div>
            ) : (
              <form
                onSubmit={submit}
                className="flex flex-col gap-6 rounded-lg border border-sand-dark bg-surface p-6 sm:p-8"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Prénom" error={errors.prenom}>
                    <Input value={form.prenom} onChange={(e) => set("prenom", e.target.value)} placeholder="Amina" aria-invalid={!!errors.prenom} className={inputCls} />
                  </Field>
                  <Field label="Nom" error={errors.nom}>
                    <Input value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Nkoulou" aria-invalid={!!errors.nom} className={inputCls} />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Adresse e-mail" error={errors.email}>
                    <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="amina.nkoulou@example.com" aria-invalid={!!errors.email} className={inputCls} />
                  </Field>
                  <Field label="Téléphone" error={errors.tel}>
                    <Input type="tel" value={form.tel} onChange={(e) => set("tel", e.target.value)} placeholder="+237 6 71 13 02 66" aria-invalid={!!errors.tel} className={inputCls} />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Spécialité" error={errors.stack}>
                    <Select value={form.stack} onValueChange={(v) => set("stack", v as string)}>
                      <SelectTrigger aria-invalid={!!errors.stack} className={cn(inputCls, "w-full justify-between")}>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {stacks.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Niveau d'expérience" error={errors.niveau}>
                    <Select value={form.niveau} onValueChange={(v) => set("niveau", v as string)}>
                      <SelectTrigger aria-invalid={!!errors.niveau} className={cn(inputCls, "w-full justify-between")}>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {niveaux.map((n) => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Disponibilité">
                  <Select value={form.disponibilite} onValueChange={(v) => set("disponibilite", v as string)}>
                    <SelectTrigger className={cn(inputCls, "w-full justify-between")}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {dispos.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Portfolio / GitHub / Behance" hint="Lien public vers vos réalisations. Fortement recommandé.">
                  <Input value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="https://github.com/vous" className={inputCls} />
                </Field>
                <Field label="Projets réalisés" hint="Deux ou trois projets dont vous êtes fier·e : rôle, technologies, résultat.">
                  <Textarea
                    value={form.projets}
                    onChange={(e) => set("projets", e.target.value.slice(0, 800))}
                    placeholder="Ex. application de suivi scolaire (React + Node), 300 utilisateurs…"
                    className="min-h-[110px] rounded-md border-sand-dark bg-white p-3.5 text-[15.5px] leading-relaxed placeholder:text-ink-faint focus-visible:border-focus focus-visible:ring-focus/20"
                  />
                  <div className="flex justify-end text-[13.5px] text-ink-faint">
                    <span className="font-mono">{form.projets.length} / 800</span>
                  </div>
                </Field>
                <Field label="Ce que vous cherchez">
                  <Textarea
                    value={form.motivation}
                    onChange={(e) => set("motivation", e.target.value.slice(0, 600))}
                    placeholder="Mission ponctuelle, projet long terme, premier emploi…"
                    className="min-h-[100px] rounded-md border-sand-dark bg-white p-3.5 text-[15.5px] leading-relaxed placeholder:text-ink-faint focus-visible:border-focus focus-visible:ring-focus/20"
                  />
                  <div className="flex justify-end text-[13.5px] text-ink-faint">
                    <span className="font-mono">{form.motivation.length} / 600</span>
                  </div>
                </Field>
                <Field label="CV" error={errors.cv} hint="PDF, 2 Mo maximum. Facultatif si votre portfolio est fourni.">
                  <label className="flex h-12 cursor-pointer items-center justify-between rounded-md border border-dashed border-sand-dark bg-white px-3.5 text-[15.5px] transition-colors hover:border-gehmit">
                    <span className={cvName ? "text-navy" : "text-ink-muted"}>
                      {cvName || "Choisir un fichier"}
                    </span>
                    <FileTextIcon className="size-4 text-ink-faint" />
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null
                        if (f && f.size > 2 * 1024 * 1024) {
                          setErrors((prev) => ({ ...prev, cv: "Le fichier dépasse 2 Mo." }))
                          return
                        }
                        setCvFile(f)
                        setCvName(f?.name ?? "")
                        setErrors((prev) => ({ ...prev, cv: "" }))
                      }}
                    />
                  </label>
                </Field>

                <div className="flex items-center justify-between border-t border-sand pt-4">
                  <span className="text-[15px] font-semibold text-ink-muted">
                    Réponse sous 10 jours
                  </span>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="h-12 rounded-md bg-gehmit px-7 text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
                  >
                    {sending ? "Envoi…" : "Envoyer mon profil"}
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
              Le programme
            </span>
            <span className="font-heading text-[22px] font-semibold">Junior Builders</span>
            <div className="flex flex-col gap-2.5 border-y border-sand py-3.5">
              <div className="flex justify-between text-[15px]">
                <span className="text-ink-faint">Inscription</span>
                <span className="font-medium">En continu</span>
              </div>
              <div className="flex justify-between text-[15px]">
                <span className="text-ink-faint">Tarif</span>
                <span className="font-medium">Gratuit</span>
              </div>
              <div className="flex justify-between text-[15px]">
                <span className="text-ink-faint">Réponse</span>
                <span className="font-medium">Sous 10 jours</span>
              </div>
            </div>
            <p className="text-[14.5px] leading-relaxed text-ink-muted">
              Vos données servent uniquement à étudier votre profil et à vous
              présenter aux entreprises. Aucun compte n'est créé.
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
