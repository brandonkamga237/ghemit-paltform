import { useState } from "react"
import { usePageMeta } from "@/lib/seo"
import { apiPost } from "@/lib/api"
import { Container } from "@/components/site/bands"
import { CtaLink } from "@/components/site/cta"
import { InfoRows, PageHero, StageLine } from "@/components/site/page-header"
import { NextStep } from "@/components/site/parcours"
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

const rows = [
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

const profiles = { jeune: "Je suis un·e jeune", entreprise: "Nous sommes une entreprise" } as const
type Profile = keyof typeof profiles

export function CaravanesPage() {
  usePageMeta("Caravanes", "Les caravanes Gehmit : un après-midi par mois dans une entreprise tech de Douala.")
  const [tab, setTab] = useState<Profile>("jeune")
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")
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
    if (!emailOk(form.email)) errs.email = "Indiquez une adresse e-mail valide."
    if (tab === "entreprise" && !form.organisation.trim()) errs.organisation = "Indiquez le nom de l'entreprise."
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setState("sending")
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
      setState("sent")
    } catch {
      setState("error")
    }
  }

  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "Programmes", to: "/programmes" }, { label: "Caravanes" }]}
        kicker={<StageLine offer="Caravanes" />}
        title={<>Un après-midi <span className="accent-word">dans une entreprise tech</span>.</>}
        lede="Chaque mois, un groupe de jeunes visite une entreprise de la sous-région : métiers, équipes, coulisses, et les premières rencontres qui comptent."
        actions={<CtaLink to="#inscription" arrow>Participer à la prochaine</CtaLink>}
      />

      <section className="bg-surface">
        <Container className="py-section">
          <InfoRows rows={rows} />
        </Container>
      </section>

      <FormSection
        id="inscription"
        title="Participer"
        text="Places limitées à chaque caravane. Nous confirmons par e-mail ou WhatsApp une semaine avant la visite."
        aside={
          <Recap
            eyebrow="Les caravanes"
            title="Un après-midi par mois"
            rows={[
              ["Groupe", "15 à 20 jeunes"],
              ["Lieu", "Douala"],
              ["Tarif", "Gratuit"],
            ]}
          >
            Les entreprises accueillantes choisissent la date avec l'équipe.
          </Recap>
        }
      >
        {state === "sent" ? (
          <FormSuccess title="Inscription enregistrée">
            {tab === "jeune"
              ? `Nous vous écrivons à ${form.email} dès que la prochaine caravane est programmée.`
              : `L'équipe vous écrit à ${form.email} pour préparer l'accueil du groupe.`}
          </FormSuccess>
        ) : (
          <FormPanel onSubmit={submit}>
            <Field label="Vous êtes" as="div">
              <ChoiceGroup
                options={Object.values(profiles)}
                value={profiles[tab]}
                onChange={(v) => setTab(v === profiles.jeune ? "jeune" : "entreprise")}
              />
            </Field>
            {tab === "entreprise" && (
              <Field label="Entreprise" error={errors.organisation}>
                <Input value={form.organisation} onChange={(e) => set("organisation", e.target.value)} autoComplete="organization" aria-invalid={!!errors.organisation} className={inputCls} />
              </Field>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={tab === "jeune" ? "Nom complet" : "Personne à contacter"} error={errors.nom}>
                <Input value={form.nom} onChange={(e) => set("nom", e.target.value)} autoComplete="name" aria-invalid={!!errors.nom} className={inputCls} />
              </Field>
              <Field label="Adresse e-mail" error={errors.email}>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" placeholder="votre@email.com" aria-invalid={!!errors.email} className={inputCls} />
              </Field>
            </div>
            <Field label="Téléphone / WhatsApp" optional>
              <Input type="tel" value={form.tel} onChange={(e) => set("tel", e.target.value)} autoComplete="tel" placeholder="+237 6 …" className={inputCls} />
            </Field>
            <FormFooter note="Gratuit, sur place à Douala" error={state === "error"}>
              <button type="submit" disabled={state === "sending"} className={submitCls}>
                {state === "sending" ? "Envoi…" : "S'inscrire"}
              </button>
            </FormFooter>
          </FormPanel>
        )}
      </FormSection>

      <NextStep offer="Caravanes" />
    </div>
  )
}
