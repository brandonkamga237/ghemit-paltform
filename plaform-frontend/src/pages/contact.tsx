import { useState } from "react"
import { useSearchParams } from "react-router"
import { MessageCircleIcon } from "lucide-react"
import { contact, faq, whatsappUrl } from "@/data/content"
import { apiPost } from "@/lib/api"
import { usePageMeta } from "@/lib/seo"
import { Container } from "@/components/site/bands"
import { PageHero } from "@/components/site/page-header"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ChoiceGroup,
  Field,
  FormFooter,
  FormPanel,
  FormSuccess,
  inputCls,
  submitCls,
  textareaCls,
} from "@/components/site/form"
import { emailOk } from "@/lib/validation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const sujets = [
  "Une question sur un programme",
  "Devenir mentor",
  "Devenir partenaire",
  "Presse / médias",
  "Autre demande",
]

export function ContactPage() {
  usePageMeta("Contact", "Écrivez à l'équipe Gehmit : question sur un programme, mentorat, partenariat ou presse.")
  const [params] = useSearchParams()
  const initialSubject = params.get("objet")
  const [subject, setSubject] = useState(
    initialSubject && sujets.includes(initialSubject) ? initialSubject : sujets[0]
  )
  const [form, setForm] = useState({ name: "", email: "", message: params.get("message") ?? "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: "" }))
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Indiquez votre nom."
    if (!emailOk(form.email)) errs.email = "Indiquez une adresse e-mail valide, ex. prenom@exemple.com."
    if (!form.message.trim()) errs.message = "Écrivez votre message."
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setState("sending")
    try {
      await apiPost("/api/public/contact", { name: form.name, email: form.email, subject, message: form.message })
      setState("sent")
    } catch {
      setState("error")
    }
  }

  return (
    <div className="flex flex-col">
      <PageHero
        trail={[{ label: "Accueil", to: "/" }, { label: "Contact" }]}
        title={<>Écrivez-<span className="accent-word">nous</span>.</>}
        lede="Une personne de l'équipe vous répond sous 48 heures ouvrées. Pour une réponse rapide, WhatsApp reste le plus direct."
      />

      <section className="bg-surface">
        <Container className="grid items-start gap-block py-section lg:grid-cols-12">
          <div className="lg:col-span-7">
            {state === "sent" ? (
              <FormSuccess title="Message envoyé">
                Merci {form.name.split(" ")[0]}. Nous vous répondons à {form.email} sous 48 heures ouvrées.
              </FormSuccess>
            ) : (
              <FormPanel onSubmit={submit}>
                <Field label="Objet" as="div">
                  <ChoiceGroup options={sujets} value={subject} onChange={setSubject} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nom complet" error={errors.name}>
                    <Input value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={!!errors.name} className={inputCls} />
                  </Field>
                  <Field label="Adresse e-mail" error={errors.email}>
                    <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" placeholder="votre@email.com" aria-invalid={!!errors.email} className={inputCls} />
                  </Field>
                </div>
                <Field label="Message" error={errors.message}>
                  <Textarea value={form.message} onChange={(e) => set("message", e.target.value)} aria-invalid={!!errors.message} className={textareaCls} />
                </Field>
                <FormFooter note="Réponse sous 48 heures ouvrées" error={state === "error"}>
                  <button type="submit" disabled={state === "sending"} className={submitCls}>
                    {state === "sending" ? "Envoi…" : "Envoyer le message"}
                  </button>
                </FormFooter>
              </FormPanel>
            )}
          </div>

          <aside className="flex flex-col gap-block lg:sticky lg:top-24 lg:col-span-5">
            <div className="flex flex-col gap-4">
              <h2 className="font-heading text-h3 font-semibold text-navy">Directement</h2>
              <dl className="flex flex-col border-t border-sand-dark">
                <Row label="E-mail">
                  <a href={`mailto:${contact.email}`} className="hover:text-gehmit">{contact.email}</a>
                </Row>
                <Row label="Téléphone">
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-gehmit">{contact.phone}</a>
                </Row>
                <Row label="Adresse">{contact.city}</Row>
              </dl>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center gap-2.5 rounded-sm bg-navy text-small font-semibold text-surface transition-colors hover:bg-navy-light"
              >
                <MessageCircleIcon className="size-5 text-gold" strokeWidth={1.8} />
                Écrire sur WhatsApp
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-h3 font-semibold text-navy">Questions fréquentes</h2>
              <Accordion>
                {faq.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-sand-dark">
                    <AccordionTrigger className="py-4 text-left text-body font-semibold text-navy hover:no-underline">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-body text-ink-muted">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </aside>
        </Container>
      </section>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-sand py-3.5">
      <dt className="text-small text-ink-muted">{label}</dt>
      <dd className="text-right text-body font-semibold text-navy">{children}</dd>
    </div>
  )
}
