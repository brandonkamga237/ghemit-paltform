import { useState } from "react"
import { Navigate, useParams } from "react-router"
import { AnimatePresence, motion } from "motion/react"
import { CheckCircle2Icon, CircleAlertIcon, FileTextIcon } from "lucide-react"
import { cn } from "cn"
import { usePrograms } from "@/data/remote"
import { apiPost, uploadCv } from "@/lib/api"
import { Container } from "@/components/site/bands"
import { Breadcrumb } from "@/components/site/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePageMeta } from "@/lib/seo"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ease = [0.22, 1, 0.36, 1] as const
const steps = ["Vous", "Votre projet", "Pièces"]

const domaines = [
  "Développement web",
  "Data / analyse",
  "Intelligence artificielle",
  "Cybersécurité",
  "Design numérique",
  "Je ne sais pas encore",
]
const situations = [
  "Étudiant·e",
  "Jeune diplômé·e",
  "En reconversion",
  "En poste",
  "Autre",
]

const inputCls =
  "h-12 rounded-md border-sand-dark bg-white px-3.5 text-[15.5px] placeholder:text-ink-faint focus-visible:border-focus focus-visible:ring-focus/20"

export function CandidaturePage() {
  const { slug } = useParams()
  const programs = usePrograms()
  const program = programs.find((p) => p.slug === slug)
  const [step, setStep] = useState(0)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    tel: "",
    domaine: "",
    situation: "",
    motivation: "",
    cv: "",
  })
  const [cvFile, setCvFile] = useState<File | null>(null)
  usePageMeta(program ? `Candidature — ${program.name}` : "Candidature")

  if (!program || program.status === "closed") {
    return <Navigate to="/programmes" replace />
  }

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const validateStep = () => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!form.prenom.trim()) e.prenom = "Indiquez votre prénom."
      if (!form.nom.trim()) e.nom = "Indiquez votre nom."
      if (!/^\S+@\S+\.\S+$/.test(form.email))
        e.email = "Indiquez une adresse e-mail valide, ex. prenom@exemple.com."
      if (!form.tel.trim()) e.tel = "Indiquez un numéro où vous joindre."
    }
    if (step === 1 && !form.domaine) e.domaine = "Choisissez un domaine pour continuer."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = async () => {
    if (!validateStep()) return
    if (step < 2) {
      setStep(step + 1)
      return
    }
    setSending(true)
    setSubmitError(false)
    try {
      let payload: Record<string, string> = { ...form }
      if (cvFile) {
        const cv = await uploadCv(cvFile)
        payload = { ...payload, cv: cv.filename, cvUrl: cv.url }
      }
      await apiPost("/api/public/candidatures", { program: program.slug, form: payload })
      setSent(true)
    } catch {
      setSubmitError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-cream">
      <Container className="grid items-start gap-12 py-12 lg:grid-cols-[1fr_320px] lg:gap-14">
        <div className="flex max-w-[680px] flex-col gap-8">
          <div className="flex flex-col gap-3.5">
            <Breadcrumb
              trail={[
                { label: "Programmes", to: "/programmes" },
                { label: program.name, to: `/programmes/${program.slug}` },
                { label: "Candidature" },
              ]}
            />
            <h1 className="font-heading text-4xl leading-[1.12] font-semibold">
              Candidater — {program.name}
            </h1>
            <p className="text-[17px] leading-relaxed text-ink-muted">
              Dix minutes. Vous recevrez un accusé de réception immédiat par e-mail.
            </p>
          </div>

          {/* Étapes */}
          {!sent && (
            <div className="flex items-center gap-3">
              {steps.map((s, i) => (
                <div key={s} className="flex flex-1 items-center gap-3 last:flex-none">
                  <span
                    className={cn(
                      "flex items-center gap-2.5 text-[14.5px]",
                      i === step
                        ? "font-semibold text-gehmit"
                        : i < step
                          ? "font-medium text-gehmit"
                          : "text-ink-faint"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-[12.5px]",
                        i <= step
                          ? "bg-gehmit text-surface"
                          : "border border-sand-dark"
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="hidden sm:inline">{s}</span>
                  </span>
                  {i < steps.length - 1 && <span className="h-px flex-1 bg-sand-dark" />}
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }}
                className="flex gap-4 rounded-lg border border-gehmit bg-open-bg p-6"
              >
                <CheckCircle2Icon className="mt-0.5 size-6 shrink-0 text-gehmit" />
                <div className="flex flex-col gap-2">
                  <span className="font-heading text-2xl font-semibold text-open-text">
                    Candidature envoyée
                  </span>
                  <span className="text-[16.5px] leading-[1.65] text-open-text">
                    Vous recevrez un accusé de réception à {form.email}, puis une
                    réponse sous dix jours ouvrés.
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.3, ease }}
                className="flex flex-col gap-6 rounded-lg border border-sand-dark bg-surface p-6 sm:p-8"
              >
                {step === 0 && (
                  <>
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
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Domaine visé" error={errors.domaine}>
                        <Select value={form.domaine} onValueChange={(v) => set("domaine", v as string)}>
                          <SelectTrigger aria-invalid={!!errors.domaine} className={cn(inputCls, "w-full justify-between")}>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {domaines.map((d) => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Situation actuelle">
                        <Select value={form.situation} onValueChange={(v) => set("situation", v as string)}>
                          <SelectTrigger className={cn(inputCls, "w-full justify-between")}>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {situations.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <Field label="Pourquoi ce programme ?">
                      <Textarea
                        value={form.motivation}
                        onChange={(e) => set("motivation", e.target.value.slice(0, 600))}
                        placeholder="Trois à cinq phrases suffisent."
                        className="min-h-[120px] rounded-md border-sand-dark bg-white p-3.5 text-[15.5px] leading-relaxed placeholder:text-ink-faint focus-visible:border-focus focus-visible:ring-focus/20"
                      />
                      <div className="flex justify-between text-[13.5px] text-ink-faint">
                        <span>Facultatif</span>
                        <span className="font-mono">{form.motivation.length} / 600</span>
                      </div>
                    </Field>
                  </>
                )}

                {step === 2 && (
                  <Field label="CV ou profil" error={errors.cv} hint="PDF, 2 Mo maximum. Facultatif.">
                    <label className="flex h-12 cursor-pointer items-center justify-between rounded-md border border-dashed border-sand-dark bg-white px-3.5 text-[15.5px] transition-colors hover:border-gehmit">
                      <span className={form.cv ? "text-navy" : "text-ink-muted"}>
                        {form.cv || "Choisir un fichier"}
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
                          set("cv", f?.name ?? "")
                        }}
                      />
                    </label>
                  </Field>
                )}

                <div className="flex items-center justify-between border-t border-sand pt-4">
                  <span className="text-[15px] font-semibold text-ink-muted">
                    Étape {step + 1} sur 3
                  </span>
                  <div className="flex gap-3">
                    {step > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        className="h-12 rounded-md border-navy px-6 text-[15px] font-semibold text-navy hover:bg-navy hover:text-surface"
                      >
                        Retour
                      </Button>
                    )}
                    <Button
                      onClick={next}
                      disabled={sending}
                      className="h-12 rounded-md bg-gehmit px-7 text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
                    >
                      {step === 2 ? (sending ? "Envoi…" : "Envoyer ma candidature") : "Continuer"}
                    </Button>
                  </div>
                </div>
                {submitError && (
                  <span className="flex items-center gap-1.5 text-[14px] text-soon-text">
                    <CircleAlertIcon className="size-4" />
                    Envoi impossible pour le moment. Vérifiez votre connexion et réessayez.
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Récapitulatif */}
        <aside className="flex flex-col gap-4 rounded-lg border border-sand-dark bg-surface p-6 lg:sticky lg:top-28">
          <span className="font-mono text-[11px] tracking-[0.12em] text-ink-faint uppercase">
            Vous candidatez à
          </span>
          <span className="font-heading text-[22px] font-semibold">{program.name}</span>
          <div className="flex flex-col gap-2.5 border-y border-sand py-3.5">
            {program.detail?.facts.slice(0, 3).map((f) => (
              <div key={f.label} className="flex justify-between text-[15px]">
                <span className="text-ink-faint">{f.label}</span>
                <span className="font-medium">{f.value}</span>
              </div>
            ))}
            <div className="flex justify-between text-[15px]">
              <span className="text-ink-faint">Réponse</span>
              <span className="font-medium">Sous 10 jours</span>
            </div>
          </div>
          <p className="text-[14.5px] leading-relaxed text-ink-muted">
            Vos données servent uniquement à traiter cette candidature. Aucun compte
            n'est créé.
          </p>
        </aside>
      </Container>
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
