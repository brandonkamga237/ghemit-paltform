import { useState } from "react"
import { Link } from "react-router"
import { contact } from "@/data/content"
import { apiPost } from "@/lib/api"
import { usePageMeta } from "@/lib/seo"
import { Container } from "@/components/site/bands"
import { ArrowLink, CtaLink } from "@/components/site/cta"
import { PageHero } from "@/components/site/page-header"
import { Figure } from "@/components/site/photo"
import { PartnerLogos } from "@/components/site/partner-logos"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ChoiceGroup,
  Field,
  FormFooter,
  FormPanel,
  FormSection,
  FormSuccess,
  inputCls,
  submitCls,
  textareaCls,
} from "@/components/site/form"
import { emailOk } from "@/lib/validation"

const ways = [
  {
    title: "Accueillir un stagiaire",
    text: "Trois à six mois, sur un profil que nous avons préparé et que nous suivons pendant toute la durée.",
    note: "Le besoin le plus urgent : 40 profils prêts, 12 places disponibles.",
    urgent: true,
  },
  {
    title: "Mécénat de compétences",
    text: "Vos experts animent une session de formation ou encadrent des mentorés, deux heures par semaine.",
    note: "Engagement minimum : un cycle de trois mois.",
  },
  {
    title: "Don de matériel",
    text: "Ordinateurs reconditionnés, écrans, connexion. Nous prenons en charge la remise en état et la traçabilité.",
    note: "Reçu et inventaire fournis.",
  },
  {
    title: "Accueillir un événement",
    text: "Une salle pour un séminaire d'orientation ou une table ronde GLab Sisters, une à deux fois par an.",
    note: "Capacité recherchée : 60 à 150 personnes.",
  },
]

const gains = [
  { title: "Une convention écrite", text: "Périmètre, durée, interlocuteur unique chez Gehmit." },
  { title: "Un bilan chiffré", text: "Nombre de bénéficiaires touchés et suites données, en fin de cycle." },
  { title: "Une visibilité mesurée", text: "Logo sur le site et les supports d'événement, mention dans le rapport annuel." },
  { title: "Un accès aux profils", text: "Les candidats formés vous sont présentés en priorité." },
]

const types = ["Stage", "Mécénat", "Matériel", "Événement"]

export function PartnerPage() {
  usePageMeta("Devenir partenaire", "Entreprises et institutions : stage, mécénat de compétences, matériel ou salle aux côtés de Gehmit.")
  const [picked, setPicked] = useState<string[]>([])
  const [form, setForm] = useState({ organisation: "", secteur: "", interlocuteur: "", email: "", proposition: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }
  const toggle = (t: string) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.organisation.trim()) errs.organisation = "Indiquez le nom de l'organisation."
    if (!form.interlocuteur.trim()) errs.interlocuteur = "Indiquez la personne à contacter."
    if (!emailOk(form.email)) errs.email = "Indiquez une adresse e-mail valide."
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setState("sending")
    try {
      await apiPost("/api/public/contact", {
        name: `${form.interlocuteur} — ${form.organisation}`,
        email: form.email,
        subject: `Partenariat${picked.length ? ` (${picked.join(", ")})` : ""}`,
        message: [
          `Organisation : ${form.organisation}`,
          `Secteur : ${form.secteur || "—"}`,
          `Types : ${picked.join(", ") || "—"}`,
          "",
          form.proposition,
        ].join("\n"),
      })
      setState("sent")
    } catch {
      setState("error")
    }
  }

  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "À propos", to: "/a-propos" }, { label: "Devenir partenaire" }]}
        kicker={<p className="text-small text-ink-muted">Pour les entreprises et institutions</p>}
        title={<>Les jeunes que nous formons ont besoin de vous, <span className="accent-word">pas seulement de nous</span>.</>}
        lede="Un stage, une expertise, du matériel ou une salle : chaque contribution ouvre une place de plus. Aucune n'exige un budget."
        actions={
          <>
            <CtaLink to="#proposer" arrow>Proposer un partenariat</CtaLink>
            <ArrowLink to="/louer-developpeur">Recruter un développeur</ArrowLink>
          </>
        }
        aside={
          <Figure
            photo="seminaire-remise"
            alt="Remise de distinction à un partenaire de Gehmit"
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            frameClassName="aspect-[4/3] lg:aspect-auto lg:h-[500px]"
            position="50% 30%"
          />
        }
      />

      {/* Quatre façons de contribuer */}
      <section className="bg-surface">
        <Container className="flex flex-col gap-block py-section">
          <h2 className="font-heading text-h2 font-semibold text-navy">
            Quatre façons de contribuer
          </h2>
          <ol className="grid gap-px bg-sand-dark md:grid-cols-2">
            {ways.map((w, i) => (
              <li key={w.title} className="flex flex-col gap-3 bg-surface py-8 md:p-8 md:[&:nth-child(odd)]:pl-0">
                <span className="flex items-baseline gap-3">
                  <span className="tnum text-small font-semibold text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-heading text-h3 font-semibold text-navy">{w.title}</span>
                </span>
                <p className="max-w-[480px] text-body text-navy/75">{w.text}</p>
                <p className={w.urgent ? "text-small font-semibold text-gehmit" : "text-small text-ink-muted"}>
                  {w.note}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Ce que vous recevez */}
      <section className="bg-navy text-surface">
        <Container className="grid gap-block py-section lg:grid-cols-12">
          <h2 className="font-heading text-h2 font-semibold lg:col-span-4">
            Ce que vous <span className="font-normal text-gold italic">recevez</span>
          </h2>
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-8">
            {gains.map((g) => (
              <div key={g.title} className="flex flex-col gap-2 border-t border-white/15 pt-5">
                <dt className="text-body font-semibold">{g.title}</dt>
                <dd className="text-body text-surface/70">{g.text}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <PartnerLogos title="Ils nous accompagnent déjà" />

      <FormSection
        id="proposer"
        title="Proposer un partenariat"
        text="Nous revenons vers vous sous 48 heures ouvrées, avec une proposition écrite."
        aside={
          <aside className="flex flex-col gap-4 bg-navy p-7 text-surface lg:sticky lg:top-24">
            <span className="text-small text-surface/60">Contact direct</span>
            <span className="font-heading text-h3 font-semibold">Vous préférez en parler de vive voix ?</span>
            <div className="flex flex-col gap-1 border-y border-white/10 py-4 text-body">
              <a href={`mailto:${contact.email}`} className="hover:text-gold">{contact.email}</a>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-gold">{contact.phone}</a>
            </div>
            <p className="text-small text-surface/65">
              Un soutien financier ?{" "}
              <Link to="/don" className="font-semibold text-gold underline-offset-4 hover:underline">
                Faire un don
              </Link>
            </p>
          </aside>
        }
      >
        {state === "sent" ? (
          <FormSuccess title="Proposition reçue">
            Un membre de l'équipe vous écrit à {form.email} sous 48 heures ouvrées.
          </FormSuccess>
        ) : (
          <FormPanel onSubmit={submit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Organisation" error={errors.organisation}>
                <Input value={form.organisation} onChange={(e) => set("organisation", e.target.value)} autoComplete="organization" aria-invalid={!!errors.organisation} className={inputCls} />
              </Field>
              <Field label="Secteur" optional>
                <Input value={form.secteur} onChange={(e) => set("secteur", e.target.value)} placeholder="Ex. services numériques" className={inputCls} />
              </Field>
              <Field label="Interlocuteur" error={errors.interlocuteur}>
                <Input value={form.interlocuteur} onChange={(e) => set("interlocuteur", e.target.value)} autoComplete="name" placeholder="Nom et fonction" aria-invalid={!!errors.interlocuteur} className={inputCls} />
              </Field>
              <Field label="Adresse e-mail" error={errors.email}>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" placeholder="contact@organisation.com" aria-invalid={!!errors.email} className={inputCls} />
              </Field>
            </div>
            <Field label="Type de partenariat" as="div" hint="Plusieurs choix possibles.">
              <ChoiceGroup options={types} value={picked} onChange={toggle} multiple />
            </Field>
            <Field label="Ce que vous pouvez proposer" optional>
              <Textarea value={form.proposition} onChange={(e) => set("proposition", e.target.value)} placeholder="Quelques lignes suffisent." className={textareaCls} />
            </Field>
            <FormFooter note="Réponse sous 48 heures ouvrées" error={state === "error"}>
              <button type="submit" disabled={state === "sending"} className={submitCls}>
                {state === "sending" ? "Envoi…" : "Envoyer la proposition"}
              </button>
            </FormFooter>
          </FormPanel>
        )}
      </FormSection>
    </div>
  )
}
