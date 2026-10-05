import { usePageMeta } from "@/lib/seo"
import { useState } from "react"
import { motion } from "motion/react"
import { MessageCircleIcon } from "lucide-react"
import { contact, faq, whatsappUrl } from "@/data/content"
import { apiPost } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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

const sujets = [
  "Une question sur un programme",
  "Devenir mentor",
  "Devenir partenaire",
  "Presse / médias",
  "Autre demande",
]

export function ContactPage() {
  usePageMeta("Contact", "Écrivez à l'équipe Gehmit : question sur un programme, un partenariat ou une caravane.")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  const [sending, setSending] = useState(false)
  const [subject, setSubject] = useState(sujets[0])

  return (
    <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
      {/* Formulaire */}
      <motion.section
        className="flex flex-col gap-7 bg-cream px-6 py-16 sm:px-11"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="flex flex-col gap-3.5">
          <h1 className="font-heading text-4xl leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[44px]">
            Nous écrire
          </h1>
          <p className="text-lg leading-relaxed text-ink-muted">
            Réponse sous 48 heures ouvrées.
          </p>
        </div>

        {sent ? (
          <div className="flex max-w-[560px] flex-col gap-2 rounded-lg border border-gehmit bg-open-bg p-6">
            <span className="text-base font-semibold text-open-text">Message envoyé</span>
            <span className="text-[15px] leading-relaxed text-open-text">
              Nous revenons vers vous sous 48 heures ouvrées.
            </span>
          </div>
        ) : (
          <form
            className="flex max-w-[560px] flex-col gap-5"
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              setSending(true)
              setError(false)
              try {
                await apiPost("/api/public/contact", {
                  name: fd.get("name"),
                  email: fd.get("email"),
                  subject,
                  message: fd.get("message"),
                })
                setSent(true)
              } catch {
                setError(true)
              } finally {
                setSending(false)
              }
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-[15px] font-semibold">Nom complet</Label>
                <Input required name="name" placeholder="Votre nom" className={inputCls} />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[15px] font-semibold">Adresse e-mail</Label>
                <Input required name="email" type="email" placeholder="votre@email.com" className={inputCls} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[15px] font-semibold">Objet</Label>
              <Select value={subject} onValueChange={(v) => setSubject(v as string)}>
                <SelectTrigger className="h-12 w-full justify-between rounded-md border-sand-dark bg-white px-3.5 text-[15.5px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sujets.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[15px] font-semibold">Message</Label>
              <Textarea
                required
                name="message"
                placeholder="Votre message"
                className="min-h-[150px] rounded-md border-sand-dark bg-white p-3.5 text-[15.5px] placeholder:text-ink-faint focus-visible:border-focus focus-visible:ring-focus/20"
              />
            </div>
            {error && (
              <span className="text-[14px] text-soon-text">
                Envoi impossible pour le moment. Réessayez ou écrivez-nous à {contact.email}.
              </span>
            )}
            <Button
              type="submit"
              disabled={sending}
              className="h-12 self-start rounded-md bg-gehmit px-7 text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
            >
              {sending ? "Envoi…" : "Envoyer"}
            </Button>
          </form>
        )}
      </motion.section>

      {/* Panneau navy */}
      <motion.aside
        className="flex flex-col gap-9 bg-navy px-6 py-16 sm:px-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease }}
      >
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] tracking-[0.12em] text-gold uppercase">
            Coordonnées
          </span>
          <a href={`mailto:${contact.email}`} className="text-[17px] text-surface hover:underline">
            {contact.email}
          </a>
          <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-[17px] text-surface hover:underline">
            {contact.phone}
          </a>
          <span className="text-[17px] text-surface/75">{contact.city}</span>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] tracking-[0.12em] text-gold uppercase">
            Questions fréquentes
          </span>
          <Accordion>
            {faq.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-white/12">
                <AccordionTrigger className="py-3.5 text-base text-surface hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-surface/70">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg bg-white/8 px-4.5 py-4 transition-colors hover:bg-white/12"
        >
          <MessageCircleIcon className="size-5 shrink-0 text-gold" strokeWidth={1.8} />
          <span className="text-[15px] leading-normal text-surface/85">
            Une réponse rapide ? Écrivez-nous directement sur WhatsApp.
          </span>
        </a>
      </motion.aside>
    </div>
  )
}
