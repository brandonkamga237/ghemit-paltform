import { useState } from "react"
import { usePageMeta } from "@/lib/seo"
import { apiPost } from "@/lib/api"
import { Container } from "@/components/site/bands"
import { ArrowLink, CtaLink } from "@/components/site/cta"
import { PageHero } from "@/components/site/page-header"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  textareaCls,
} from "@/components/site/form"
import { emailOk } from "@/lib/validation"

const besoins = ["Mission ponctuelle", "Projet (1 à 6 mois)", "Recrutement CDI / CDD", "Stage"]
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
    text: "Profil, mission, durée et budget indicatif : le formulaire prend cinq minutes.",
  },
  {
    title: "Nous présélectionnons",
    text: "Trois à cinq profils du vivier Junior Builders, vérifiés par l'équipe, sous dix jours ouvrés.",
  },
  {
    title: "Vous rencontrez",
    text: "Entretiens directs avec les profils retenus. La contractualisation se fait entre vous ; Gehmit ne prend aucune commission.",
  },
]

export function HireDeveloperPage() {
  usePageMeta("Recruter un développeur", "Recrutez un développeur junior formé et vérifié par Gehmit, sans commission.")
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")
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
    if (!emailOk(form.email)) errs.email = "Indiquez une adresse e-mail valide."
    if (!form.profil) errs.profil = "Choisissez le profil recherché."
    if (!form.besoin) errs.besoin = "Choisissez le type de besoin."
    if (!form.mission.trim()) errs.mission = "Décrivez la mission en quelques lignes."
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setState("sending")
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
      setState("sent")
    } catch {
      setState("error")
    }
  }

  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "Entreprises", to: "/partenaire" }, { label: "Recruter un développeur" }]}
        kicker={<p className="text-small text-ink-muted">Pour les entreprises · Sans commission</p>}
        title={<>Un développeur qualifié, <span className="accent-word">sans cabinet de recrutement</span>.</>}
        lede="Décrivez votre besoin : nous vous présentons des jeunes talents du vivier Junior Builders, vérifiés sur leurs réalisations réelles."
        actions={
          <>
            <CtaLink to="#besoin" arrow>Décrire mon besoin</CtaLink>
            <ArrowLink to="/partenaire">Autres façons de s'engager</ArrowLink>
          </>
        }
        below={
          <Container>
            <ol className="grid border-t border-sand-dark md:grid-cols-3">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className="flex flex-col gap-2 border-sand-dark py-7 max-md:border-b max-md:last:border-b-0 md:pr-8 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-8"
                >
                  <span className="tnum text-small font-semibold text-gold">{i + 1}</span>
                  <span className="font-heading text-h3 font-semibold text-navy">{s.title}</span>
                  <span className="text-body text-ink-muted">{s.text}</span>
                </li>
              ))}
            </ol>
          </Container>
        }
      />

      <FormSection
        id="besoin"
        title="Décrire mon besoin"
        text="Réponse sous 48 heures ouvrées, présélection sous dix jours."
        aside={
          <Recap
            eyebrow="Le service"
            title="Mise en relation"
            rows={[
              ["Commission", "0 %"],
              ["Présélection", "Sous 10 jours"],
              ["Réponse", "Sous 48 h"],
            ]}
          >
            Les profils sont vérifiés par l'équipe sur la base de leurs réalisations réelles
            (code, projets, portfolio).
          </Recap>
        }
      >
        {state === "sent" ? (
          <FormSuccess title="Besoin enregistré">
            Nous revenons vers {form.interlocuteur} à {form.email} sous 48 heures ouvrées pour
            affiner le profil.
          </FormSuccess>
        ) : (
          <FormPanel onSubmit={submit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Organisation" error={errors.organisation}>
                <Input value={form.organisation} onChange={(e) => set("organisation", e.target.value)} autoComplete="organization" aria-invalid={!!errors.organisation} className={inputCls} />
              </Field>
              <Field label="Personne à contacter" error={errors.interlocuteur}>
                <Input value={form.interlocuteur} onChange={(e) => set("interlocuteur", e.target.value)} autoComplete="name" aria-invalid={!!errors.interlocuteur} className={inputCls} />
              </Field>
              <Field label="Adresse e-mail" error={errors.email}>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" placeholder="contact@entreprise.com" aria-invalid={!!errors.email} className={inputCls} />
              </Field>
              <Field label="Téléphone" optional>
                <Input type="tel" value={form.tel} onChange={(e) => set("tel", e.target.value)} autoComplete="tel" placeholder="+237 6 …" className={inputCls} />
              </Field>
            </div>
            <Field label="Profil recherché" as="div" error={errors.profil}>
              <ChoiceGroup options={profils} value={form.profil} onChange={(v) => set("profil", v)} />
            </Field>
            <Field label="Type de besoin" as="div" error={errors.besoin}>
              <ChoiceGroup options={besoins} value={form.besoin} onChange={(v) => set("besoin", v)} />
            </Field>
            <Field label="La mission" error={errors.mission} hint={`Contexte, objectifs, technologies, lieu (Douala, à distance…). ${form.mission.length} / 800`}>
              <Textarea value={form.mission} onChange={(e) => set("mission", e.target.value.slice(0, 800))} placeholder="Ex. refonte d'un site e-commerce en React, 3 mois, à distance…" aria-invalid={!!errors.mission} className={textareaCls} />
            </Field>
            <Field label="Budget indicatif" optional hint="Une fourchette suffit.">
              <Input value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="Ex. 150 000 – 300 000 FCFA / mois" className={inputCls} />
            </Field>
            <FormFooter note="Sans commission" error={state === "error"}>
              <button type="submit" disabled={state === "sending"} className={submitCls}>
                {state === "sending" ? "Envoi…" : "Envoyer le besoin"}
              </button>
            </FormFooter>
          </FormPanel>
        )}
      </FormSection>
    </div>
  )
}
