import { useState } from "react"
import { Link, Navigate, useParams } from "react-router"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"
import { usePrograms } from "@/data/remote"
import { apiPost, uploadCv } from "@/lib/api"
import { usePageMeta } from "@/lib/seo"
import { Container } from "@/components/site/bands"
import { Breadcrumb } from "@/components/site/page-header"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ChoiceGroup,
  CvInput,
  Field,
  FormFooter,
  FormSuccess,
  Recap,
  inputCls,
  submitCls,
  textareaCls,
} from "@/components/site/form"
import { emailOk } from "@/lib/validation"

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
const situations = ["Étudiant·e", "Jeune diplômé·e", "En reconversion", "En poste", "Autre"]

export function CandidaturePage() {
  const { slug } = useParams()
  const programs = usePrograms()
  const program = programs.find((p) => p.slug === slug)
  const [step, setStep] = useState(0)
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")
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
      if (!emailOk(form.email)) e.email = "Indiquez une adresse e-mail valide, ex. prenom@exemple.com."
      if (!form.tel.trim()) e.tel = "Indiquez un numéro où vous joindre."
    }
    if (step === 1 && !form.domaine) e.domaine = "Choisissez un domaine pour continuer."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateStep()) return
    if (step < 2) {
      setStep(step + 1)
      return
    }
    setState("sending")
    try {
      let payload: Record<string, string> = { ...form }
      if (cvFile) {
        const cv = await uploadCv(cvFile)
        payload = { ...payload, cv: cv.filename, cvUrl: cv.url }
      }
      await apiPost("/api/public/candidatures", { program: program.slug, form: payload })
      setState("sent")
    } catch {
      setState("error")
    }
  }

  const facts = program.detail?.facts.slice(0, 3).map((f) => [f.label, f.value] as [string, string]) ?? []

  return (
    <div className="bg-cream">
      <Container className="grid items-start gap-10 py-10 lg:grid-cols-12 lg:gap-10 lg:py-14">
        <div className="flex flex-col gap-8 lg:col-span-7">
          <div className="flex flex-col gap-4">
            <Breadcrumb
              trail={[
                { label: "Programmes", to: "/programmes" },
                { label: program.name, to: `/programmes/${program.slug}` },
                { label: "Candidature" },
              ]}
            />
            <h1 className="font-heading text-[40px] leading-[1.05] font-semibold tracking-[-0.025em] text-navy sm:text-[52px]">
              Candidature <span className="accent-word">{program.name}</span>
            </h1>
            <p className="text-[18px] leading-relaxed text-navy/75">
              Dix minutes, trois étapes. Vous recevez un accusé de réception immédiat par e-mail.
            </p>
          </div>

          {state !== "sent" && (
            <ol className="grid grid-cols-3 gap-2" aria-label="Étapes de la candidature">
              {steps.map((s, i) => (
                <li key={s} aria-current={i === step ? "step" : undefined} className="flex flex-col gap-2">
                  <span className={cn("h-1 transition-colors duration-300", i <= step ? "bg-gehmit" : "bg-sand-dark")} />
                  <span className={cn("text-[14px]", i === step ? "font-semibold text-navy" : "text-ink-muted")}>
                    {i + 1}. {s}
                  </span>
                </li>
              ))}
            </ol>
          )}

          <AnimatePresence mode="wait">
            {state === "sent" ? (
              <FormSuccess key="sent" title="Candidature envoyée">
                Vous recevez un accusé de réception à {form.email}, puis une réponse sous dix jours
                ouvrés.{" "}
                <Link to="/programmes" className="font-semibold text-gehmit underline-offset-4 hover:underline">
                  Revenir au parcours
                </Link>
              </FormSuccess>
            ) : (
              <motion.form
                key={step}
                noValidate
                onSubmit={next}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25, ease }}
                className="flex flex-col gap-6 bg-surface p-6 shadow-[0_1px_0_var(--color-sand-dark)] sm:p-9"
              >
                {step === 0 && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Prénom" error={errors.prenom}>
                      <Input value={form.prenom} onChange={(e) => set("prenom", e.target.value)} autoComplete="given-name" aria-invalid={!!errors.prenom} className={inputCls} />
                    </Field>
                    <Field label="Nom" error={errors.nom}>
                      <Input value={form.nom} onChange={(e) => set("nom", e.target.value)} autoComplete="family-name" aria-invalid={!!errors.nom} className={inputCls} />
                    </Field>
                    <Field label="Adresse e-mail" error={errors.email}>
                      <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" placeholder="votre@email.com" aria-invalid={!!errors.email} className={inputCls} />
                    </Field>
                    <Field label="Téléphone" error={errors.tel}>
                      <Input type="tel" value={form.tel} onChange={(e) => set("tel", e.target.value)} autoComplete="tel" placeholder="+237 6 …" aria-invalid={!!errors.tel} className={inputCls} />
                    </Field>
                  </div>
                )}

                {step === 1 && (
                  <>
                    <Field label="Domaine visé" as="div" error={errors.domaine}>
                      <ChoiceGroup options={domaines} value={form.domaine} onChange={(v) => set("domaine", v)} />
                    </Field>
                    <Field label="Situation actuelle" as="div" optional>
                      <ChoiceGroup options={situations} value={form.situation} onChange={(v) => set("situation", v)} />
                    </Field>
                    <Field label="Pourquoi ce programme ?" optional hint={`Trois à cinq phrases suffisent. ${form.motivation.length} / 600`}>
                      <Textarea value={form.motivation} onChange={(e) => set("motivation", e.target.value.slice(0, 600))} className={textareaCls} />
                    </Field>
                  </>
                )}

                {step === 2 && (
                  <Field label="CV ou profil" as="div" optional error={errors.cv} hint="PDF, 2 Mo maximum.">
                    <CvInput
                      name={form.cv}
                      onChange={(f, err) => {
                        setErrors((p) => ({ ...p, cv: err ?? "" }))
                        if (err) return
                        setCvFile(f)
                        set("cv", f?.name ?? "")
                      }}
                    />
                  </Field>
                )}

                <FormFooter note={`Étape ${step + 1} sur 3`} error={state === "error"}>
                  <div className="flex gap-3">
                    {step > 0 && (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="inline-flex h-12 items-center rounded-sm border border-navy/25 px-6 text-[15.5px] font-semibold text-navy transition-colors hover:border-navy"
                      >
                        Retour
                      </button>
                    )}
                    <button type="submit" disabled={state === "sending"} className={submitCls}>
                      {step === 2 ? (state === "sending" ? "Envoi…" : "Envoyer ma candidature") : "Continuer"}
                    </button>
                  </div>
                </FormFooter>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <Recap eyebrow="Vous candidatez à" title={program.name} rows={[...facts, ["Réponse", "Sous 10 jours"]]}>
            Vos données servent uniquement à traiter cette candidature. Aucun compte n'est créé.
          </Recap>
        </div>
      </Container>
    </div>
  )
}
