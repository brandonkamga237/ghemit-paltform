import { useState } from "react"
import { usePageMeta } from "@/lib/seo"
import { apiPost, uploadCv } from "@/lib/api"
import { Container } from "@/components/site/bands"
import { ArrowLink, CtaLink } from "@/components/site/cta"
import { InfoRows, PageHero, StageLine } from "@/components/site/page-header"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FormFooter,
  FormPanel,
  FormSection,
  FormSuccess,
  CvInput,
  Recap,
  SelectField,
  inputCls,
  submitCls,
  textareaCls,
} from "@/components/site/form"
import { emailOk } from "@/lib/validation"

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
const dispos = ["Immédiate", "Dans le mois", "Temps partiel uniquement", "Soirs et week-ends"]

const rows = [
  {
    title: "Ce qu'est Junior Builders",
    text: "Un vivier de jeunes talents du numérique que Gehmit présente aux entreprises pour des missions ponctuelles, des projets ou des embauches.",
  },
  {
    title: "Ce que nous regardons",
    text: "Vos réalisations (code, maquettes, projets), pas vos diplômes. Un lien GitHub ou portfolio vaut mieux qu'un long CV.",
  },
  {
    title: "Ce qui se passe ensuite",
    text: "Votre profil est étudié sous dix jours ouvrés. S'il est retenu, vous entrez dans le vivier et êtes présenté·e aux entreprises qui cherchent votre profil.",
  },
]

export function JuniorBuildersPage() {
  usePageMeta("Junior Builders", "Le vivier de jeunes talents du numérique que Gehmit présente aux entreprises.")
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [cvFile, setCvFile] = useState<File | null>(null)
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
    if (!emailOk(form.email)) errs.email = "Indiquez une adresse e-mail valide."
    if (!form.tel.trim()) errs.tel = "Indiquez un numéro où vous joindre."
    if (!form.stack) errs.stack = "Choisissez votre spécialité."
    if (!form.niveau) errs.niveau = "Choisissez votre niveau."
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setState("sending")
    try {
      let payload: Record<string, string> = { ...form }
      if (cvFile) {
        const cv = await uploadCv(cvFile)
        payload = { ...payload, cv: cv.filename, cvUrl: cv.url }
      }
      await apiPost("/api/public/candidatures", { program: "junior-builders", form: payload })
      setState("sent")
    } catch {
      setState("error")
    }
  }

  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "Programmes", to: "/programmes" }, { label: "Junior Builders" }]}
        kicker={<StageLine offer="Junior Builders" />}
        title={<>Votre code parle. <span className="accent-word">Nous vous présentons.</span></>}
        lede="Rejoignez le vivier de jeunes talents du numérique : missions, projets et embauches auprès des entreprises partenaires de Gehmit."
        actions={
          <>
            <CtaLink to="#rejoindre" arrow>Rejoindre le vivier</CtaLink>
            <ArrowLink to="/louer-developpeur">Vous recrutez ?</ArrowLink>
          </>
        }
      />

      <section className="bg-surface">
        <Container className="py-section">
          <InfoRows rows={rows} />
        </Container>
      </section>

      <FormSection
        id="rejoindre"
        title="Rejoindre le vivier"
        text="Dix minutes. Votre portfolio compte autant que votre CV."
        aside={
          <Recap
            eyebrow="Junior Builders"
            title="Inscription en continu"
            rows={[
              ["Tarif", "Gratuit"],
              ["Réponse", "Sous 10 jours"],
              ["Compte", "Aucun à créer"],
            ]}
          >
            Vos données servent uniquement à étudier votre profil et à vous présenter aux
            entreprises.
          </Recap>
        }
      >
        {state === "sent" ? (
          <FormSuccess title="Profil envoyé">
            Nous étudions votre profil et revenons vers vous à {form.email} sous dix jours ouvrés.
          </FormSuccess>
        ) : (
          <FormPanel onSubmit={submit}>
            <Group title="Vous">
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
            </Group>

            <Group title="Votre profil">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Spécialité" as="div" error={errors.stack}>
                  <SelectField value={form.stack} onChange={(v) => set("stack", v)} options={stacks} invalid={!!errors.stack} />
                </Field>
                <Field label="Niveau d'expérience" as="div" error={errors.niveau}>
                  <SelectField value={form.niveau} onChange={(v) => set("niveau", v)} options={niveaux} invalid={!!errors.niveau} />
                </Field>
              </div>
              <Field label="Disponibilité" as="div" optional>
                <SelectField value={form.disponibilite} onChange={(v) => set("disponibilite", v)} options={dispos} />
              </Field>
            </Group>

            <Group title="Vos réalisations">
              <Field label="Portfolio, GitHub ou Behance" optional hint="Un lien public vers vos réalisations. Fortement recommandé.">
                <Input type="url" value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="https://github.com/vous" className={inputCls} />
              </Field>
              <Field label="Projets réalisés" optional hint={`Deux ou trois projets : rôle, technologies, résultat. ${form.projets.length} / 800`}>
                <Textarea value={form.projets} onChange={(e) => set("projets", e.target.value.slice(0, 800))} placeholder="Ex. application de suivi scolaire (React + Node), 300 utilisateurs…" className={textareaCls} />
              </Field>
              <Field label="Ce que vous cherchez" optional hint={`${form.motivation.length} / 600`}>
                <Textarea value={form.motivation} onChange={(e) => set("motivation", e.target.value.slice(0, 600))} placeholder="Mission ponctuelle, projet long terme, premier emploi…" className={textareaCls} />
              </Field>
              <Field label="CV" as="div" optional error={errors.cv} hint="PDF, 2 Mo maximum. Facultatif si votre portfolio est fourni.">
                <CvInput
                  name={cvFile?.name}
                  onChange={(f, err) => {
                    setErrors((p) => ({ ...p, cv: err ?? "" }))
                    if (!err) setCvFile(f)
                  }}
                />
              </Field>
            </Group>

            <FormFooter note="Réponse sous 10 jours" error={state === "error"}>
              <button type="submit" disabled={state === "sending"} className={submitCls}>
                {state === "sending" ? "Envoi…" : "Envoyer mon profil"}
              </button>
            </FormFooter>
          </FormPanel>
        )}
      </FormSection>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="mb-5 font-heading text-h3 font-semibold text-navy italic">{title}</legend>
      {children}
    </fieldset>
  )
}
