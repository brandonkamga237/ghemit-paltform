import { useRef, useState } from "react"
import { Link } from "react-router"
import { motion } from "motion/react"
import { CheckCircle2Icon } from "lucide-react"
import { cn } from "cn"
import { contact, partners } from "@/data/content"
import { apiPost } from "@/lib/api"
import { Photo } from "@/components/site/photo"
import { Reveal } from "@/components/site/reveal"
import { Container } from "@/components/site/bands"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const ease = [0.22, 1, 0.36, 1] as const
const inputCls =
  "h-12 rounded-md border-sand-dark bg-white px-3.5 text-[15.5px] placeholder:text-ink-faint focus-visible:border-focus focus-visible:ring-focus/20"

const ways = [
  {
    num: "01",
    title: "Accueillir un stagiaire",
    text: "Trois à six mois, sur un profil que nous avons préparé et que nous suivons pendant toute la durée.",
    note: "Le besoin le plus urgent : 40 profils prêts, 12 places disponibles.",
    highlight: true,
  },
  {
    num: "02",
    title: "Mécénat de compétences",
    text: "Vos experts animent une session de formation ou encadrent des mentorés, deux heures par semaine.",
    note: "Engagement minimum : un cycle de trois mois.",
  },
  {
    num: "03",
    title: "Don de matériel",
    text: "Ordinateurs reconditionnés, écrans, connexion. Nous prenons en charge la remise en état et la traçabilité.",
    note: "Reçu et inventaire fournis.",
  },
  {
    num: "04",
    title: "Accueillir un événement",
    text: "Une salle pour un séminaire d'orientation ou une table ronde GLab Sisters, une à deux fois par an.",
    note: "Capacité recherchée : 60 à 150 personnes.",
  },
]

const gains = [
  {
    title: "Une convention écrite",
    text: "Périmètre, durée, interlocuteur unique chez Gehmit.",
  },
  {
    title: "Un bilan chiffré",
    text: "Nombre de bénéficiaires touchés et suites données, en fin de cycle.",
  },
  {
    title: "Une visibilité mesurée",
    text: "Logo sur le site et les supports d'événement, mention dans le rapport annuel.",
  },
  {
    title: "Un accès aux profils",
    text: "Les candidats formés vous sont présentés en priorité.",
  },
]

const types = ["Stage", "Mécénat", "Matériel", "Événement"]

export function PartnerPage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)
  const [email, setEmail] = useState("")

  const toggle = (t: string) =>
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))

  return (
    <div className="flex flex-col">
      {/* Héros navy */}
      <section className="grid bg-navy lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          className="flex flex-col justify-center gap-5 px-6 py-16 sm:px-11"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease }}
        >
          <span className="font-mono text-xs tracking-[0.16em] text-gold uppercase">
            À propos / Devenir partenaire
          </span>
          <motion.h1
            className="font-heading text-4xl leading-[1.08] font-semibold tracking-[-0.02em] text-balance text-surface sm:text-[46px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
          >
            Les jeunes que nous formons ont besoin de vous, pas seulement de nous.
          </motion.h1>
          <motion.p
            className="max-w-[480px] text-lg leading-[1.65] text-surface/80"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease }}
          >
            Un stage, une expertise, du matériel ou une salle : chaque contribution
            ouvre une place de plus.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease }}
          >
            <Button
              onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="h-12 self-start rounded-md bg-gehmit px-7 text-base font-semibold text-surface hover:bg-gehmit-hover"
            >
              Proposer un partenariat
            </Button>
          </motion.div>
        </motion.div>
        <div className="min-h-[280px] lg:min-h-[400px]">
          <Photo
            label="Photo — signature de convention ou visite d'entreprise"
            dark
            className="h-full"
          />
        </div>
      </section>

      {/* Quatre façons */}
      <section className="bg-surface">
        <Container className="flex flex-col gap-8 py-16">
          <Reveal className="flex flex-col gap-3">
            <h2 className="font-heading text-3xl font-semibold">
              Quatre façons de contribuer
            </h2>
            <p className="max-w-[680px] text-[17px] leading-relaxed text-ink-muted">
              Aucune n'exige un budget. La plus recherchée est la première.
            </p>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {ways.map((w, i) => (
              <Reveal key={w.num} delay={i * 0.06}>
                <div
                  className={cn(
                    "flex h-full flex-col gap-3 rounded-lg border border-sand-dark bg-cream p-7",
                    w.highlight && "border-l-[3px] border-l-gehmit"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[13px] text-gold">{w.num}</span>
                    <span className="font-heading text-[23px] font-semibold">{w.title}</span>
                  </div>
                  <p className="text-base leading-[1.65] text-ink-muted">{w.text}</p>
                  <span className="text-[14.5px] text-ink-faint">{w.note}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Ce que vous recevez */}
      <section className="border-t border-sand bg-cream">
        <Container className="grid gap-10 py-14 lg:grid-cols-[300px_1fr] lg:gap-14">
          <Reveal className="flex flex-col gap-2.5">
            <h2 className="font-heading text-[28px] font-semibold">Ce que vous recevez</h2>
            <span className="h-0.5 w-12 bg-gold" />
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {gains.map((g, i) => (
              <Reveal key={g.title} delay={i * 0.05} className="flex flex-col gap-1.5">
                <span className="text-[17px] font-semibold">{g.title}</span>
                <span className="text-base leading-relaxed text-ink-muted">{g.text}</span>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Partenaires actuels */}
      <section className="border-t border-sand bg-surface">
        <Container className="flex flex-col gap-6 py-12">
          <span className="mono-label">Ils nous accompagnent déjà</span>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {partners.map((p) => (
              <div
                key={p}
                className="flex h-[72px] items-center justify-center rounded-lg border border-sand bg-cream"
              >
                <span className="font-mono text-[11px] text-ink-faint">{p}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Formulaire */}
      <section ref={formRef} className="border-t border-sand bg-cream">
        <Container className="grid items-start gap-12 py-16 lg:grid-cols-[1fr_380px] lg:gap-14">
          <div className="flex max-w-[680px] flex-col gap-6">
            <Reveal className="flex flex-col gap-3">
              <h2 className="font-heading text-3xl font-semibold">Proposer un partenariat</h2>
              <p className="text-[17px] leading-relaxed text-ink-muted">
                Nous revenons vers vous sous 48 heures ouvrées, avec une proposition écrite.
              </p>
            </Reveal>

            {sent ? (
              <div className="flex gap-4 rounded-lg border border-gehmit bg-open-bg p-7">
                <CheckCircle2Icon className="mt-0.5 size-6 shrink-0 text-gehmit" />
                <div className="flex flex-col gap-2">
                  <span className="font-heading text-2xl font-semibold text-open-text">
                    Proposition reçue
                  </span>
                  <span className="text-[16.5px] leading-[1.65] text-open-text">
                    Un membre de l'équipe vous écrit à {email} sous 48 heures ouvrées.
                  </span>
                </div>
              </div>
            ) : (
              <form
                className="flex flex-col gap-5 rounded-lg border border-sand-dark bg-surface p-6 sm:p-8"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  setSending(true)
                  setError(false)
                  try {
                    await apiPost("/api/public/contact", {
                      name: `${fd.get("interlocuteur")} — ${fd.get("organisation")}`,
                      email,
                      subject: `Partenariat${picked.length ? ` (${picked.join(", ")})` : ""}`,
                      message: [
                        `Organisation : ${fd.get("organisation")}`,
                        `Secteur : ${fd.get("secteur") || "—"}`,
                        `Types : ${picked.join(", ") || "—"}`,
                        "",
                        fd.get("proposition"),
                      ].join("\n"),
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
                    <Label className="text-[15px] font-semibold">Organisation</Label>
                    <Input required name="organisation" placeholder="Nom de l'organisation" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-[15px] font-semibold">Secteur</Label>
                    <Input name="secteur" placeholder="Ex. services numériques" className={inputCls} />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label className="text-[15px] font-semibold">Interlocuteur</Label>
                    <Input required name="interlocuteur" placeholder="Nom et fonction" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-[15px] font-semibold">Adresse e-mail</Label>
                    <Input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@organisation.com"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <Label className="text-[15px] font-semibold">Type de partenariat</Label>
                  <div className="flex flex-wrap gap-2.5">
                    {types.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggle(t)}
                        className={cn(
                          "h-11 rounded-md border px-4.5 text-[14.5px] transition-colors",
                          picked.includes(t)
                            ? "border-gehmit bg-open-bg font-semibold text-open-text"
                            : "border-sand-dark bg-white hover:border-gehmit"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-[15px] font-semibold">
                    Ce que vous pouvez proposer
                  </Label>
                  <Textarea
                    name="proposition"
                    placeholder="Quelques lignes suffisent."
                    className="min-h-[120px] rounded-md border-sand-dark bg-white p-3.5 text-[15.5px] leading-relaxed placeholder:text-ink-faint focus-visible:border-focus focus-visible:ring-focus/20"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-sand pt-4">
                  <span className="text-[15px] text-ink-faint">
                    Réponse sous 48 heures ouvrées
                  </span>
                  {error && (
                    <span className="text-[14px] text-soon-text">
                      Envoi impossible. Écrivez-nous à {contact.email}.
                    </span>
                  )}
                  <Button
                    type="submit"
                    disabled={sending}
                    className="h-12 rounded-md bg-gehmit px-7 text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
                  >
                    {sending ? "Envoi…" : "Envoyer la proposition"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="flex flex-col gap-5 lg:sticky lg:top-28">
            <Reveal className="flex flex-col gap-3.5 rounded-lg border border-sand-dark bg-surface p-6">
              <span className="font-mono text-[11px] tracking-[0.12em] text-ink-faint uppercase">
                Contact direct
              </span>
              <span className="font-heading text-xl leading-[1.35] font-semibold">
                Vous préférez en parler de vive voix ?
              </span>
              <a href={`mailto:${contact.email}`} className="text-base text-ink-muted hover:text-gehmit">
                {contact.email}
              </a>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-base text-ink-muted hover:text-gehmit">
                {contact.phone}
              </a>
              <Button
                variant="outline"
                render={<Link to="/contact" />}
                className="h-12 rounded-md border-navy text-[15px] font-semibold text-navy hover:bg-navy hover:text-surface"
              >
                Discuter maintenant
              </Button>
            </Reveal>
            <Reveal delay={0.08} className="flex flex-col gap-3 rounded-lg border border-gold bg-gold-tint p-6">
              <span className="font-heading text-xl leading-[1.35] font-semibold">
                Soutien financier
              </span>
              <p className="text-[15px] leading-relaxed text-ink-muted">
                Un don finance directement l'accompagnement d'un jeune.
              </p>
              <Link to="/don" className="text-[15px] font-semibold text-gehmit hover:underline">
                Faire un don →
              </Link>
            </Reveal>
          </div>
        </Container>
      </section>
    </div>
  )
}
