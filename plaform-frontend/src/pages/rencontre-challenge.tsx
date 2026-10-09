import { useState } from "react"
import { usePageMeta } from "@/lib/seo"
import { apiPost } from "@/lib/api"
import { Container } from "@/components/site/bands"
import { CtaLink } from "@/components/site/cta"
import { PageHero, StageLine } from "@/components/site/page-header"
import { Input } from "@/components/ui/input"
import {
  ChoiceGroup,
  Field,
  FormFooter,
  FormPanel,
  FormSection,
  FormSuccess,
  Recap,
  inputCls,
  submitCls,
} from "@/components/site/form"
import { emailOk } from "@/lib/validation"

const profils = ["Étudiant·e", "Jeune diplômé·e", "Autodidacte", "Jeune pro", "Autre"]

/** Le déroulé d'une journée, dans l'ordre. */
const day = [
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
    text: "Stages, missions et mentorats pour les profils remarqués ; les meilleures idées rejoignent parfois le stage Gehmit.",
  },
]

export function RencontreChallengePage() {
  usePageMeta("Rencontre Challenge", "Une journée, un défi réel posé par une entreprise et un jury de recruteurs, à Douala.")
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")
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
    if (!emailOk(form.email)) errs.email = "Indiquez une adresse e-mail valide."
    if (!form.profil) errs.profil = "Choisissez votre profil."
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setState("sending")
    try {
      await apiPost("/api/public/candidatures", {
        program: "rencontre-challenge",
        form: { prenom: form.nom, email: form.email, tel: form.tel, situation: form.profil },
      })
      setState("sent")
    } catch {
      setState("error")
    }
  }

  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "Programmes", to: "/programmes" }, { label: "Rencontre Challenge" }]}
        kicker={<StageLine offer="Rencontre Challenge" />}
        title={<>Résolvez, présentez, <span className="accent-word">rencontrez</span>.</>}
        lede="Une journée, un défi réel posé par une entreprise et un jury de professionnels : de quoi se faire repérer autrement que sur CV."
        actions={<CtaLink to="#inscription" arrow>S'inscrire à la prochaine édition</CtaLink>}
      />

      {/* La journée, en trois temps */}
      <section className="bg-navy text-surface">
        <Container className="flex flex-col gap-10 py-16 lg:py-24">
          <h2 className="font-heading text-[30px] leading-[1.1] font-semibold sm:text-[40px]">
            Une journée, <span className="font-normal text-gold italic">trois temps</span>.
          </h2>
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {day.map((d, i) => (
              <li key={d.title} className="flex flex-col gap-3 border-t border-white/15 pt-6">
                <span className="tnum text-[14px] font-semibold text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-heading text-[30px] leading-tight italic">{d.title}</span>
                <p className="text-[16.5px] leading-relaxed text-surface/70">{d.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <FormSection
        id="inscription"
        title="S'inscrire"
        text="Ouvert à tous les profils, débutants compris. Les équipes sont constituées sur place. Places limitées, confirmation par e-mail."
        aside={
          <Recap
            eyebrow="Rencontre Challenge"
            title="Une journée à Douala"
            rows={[
              ["Équipes", "Formées sur place"],
              ["Jury", "Professionnels"],
              ["Tarif", "Gratuit"],
            ]}
          />
        }
      >
        {state === "sent" ? (
          <FormSuccess title="Inscription enregistrée">
            Nous vous envoyons le programme détaillé à {form.email} dès l'annonce de la prochaine
            édition.
          </FormSuccess>
        ) : (
          <FormPanel onSubmit={submit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nom complet" error={errors.nom}>
                <Input value={form.nom} onChange={(e) => set("nom", e.target.value)} autoComplete="name" aria-invalid={!!errors.nom} className={inputCls} />
              </Field>
              <Field label="Adresse e-mail" error={errors.email}>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" placeholder="votre@email.com" aria-invalid={!!errors.email} className={inputCls} />
              </Field>
            </div>
            <Field label="Téléphone / WhatsApp" optional>
              <Input type="tel" value={form.tel} onChange={(e) => set("tel", e.target.value)} autoComplete="tel" placeholder="+237 6 …" className={inputCls} />
            </Field>
            <Field label="Votre profil" as="div" error={errors.profil}>
              <ChoiceGroup options={profils} value={form.profil} onChange={(v) => set("profil", v)} />
            </Field>
            <FormFooter note="Gratuit, une journée à Douala" error={state === "error"}>
              <button type="submit" disabled={state === "sending"} className={submitCls}>
                {state === "sending" ? "Envoi…" : "S'inscrire"}
              </button>
            </FormFooter>
          </FormPanel>
        )}
      </FormSection>
    </div>
  )
}
