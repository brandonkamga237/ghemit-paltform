import { useState } from "react"
import { Link } from "react-router"
import { contact, programs } from "@/data/content"
import { apiPost } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import logoWhiteUrl from "@/assets/logo-gehmit-blanc.webp"

export function Footer() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)

  return (
    <footer className="bg-navy">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-11 px-5 pt-14 pb-8 sm:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Link to="/" aria-label="Gehmit — accueil">
              <img
                src={logoWhiteUrl}
                alt="Gehmit"
                width={472}
                height={192}
                className="h-12 w-auto"
              />
            </Link>
            <p className="max-w-[300px] text-[15.5px] leading-relaxed text-surface/70">
              Recevez les sessions et appels à candidature, une fois par mois.
            </p>
            {sent ? (
              <p className="text-[15px] text-surface/85">
                Inscription confirmée. Merci.
              </p>
            ) : (
              <form
                className="flex flex-col gap-2"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!email.trim()) return
                  try {
                    await apiPost("/api/public/newsletter/subscribe", {
                      name: name.trim() || undefined,
                      email,
                      source: "newsletter",
                    })
                    setSent(true)
                  } catch {
                    setError(true)
                  }
                }}
              >
                <div className="flex gap-2.5">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nom"
                  aria-label="Nom"
                  className="h-[46px] flex-1 rounded-md border-0 bg-white px-3.5 text-[15px] text-navy placeholder:text-ink-faint"
                />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="h-[46px] flex-1 rounded-md border-0 bg-white px-3.5 text-[15px] text-navy placeholder:text-ink-faint"
                />
                <Button
                  type="submit"
                  className="h-[46px] rounded-md bg-gehmit px-5 text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
                >
                  S'inscrire
                </Button>
                </div>
                {error && (
                  <span className="text-[13.5px] text-soon-text">
                    Inscription impossible pour le moment. Réessayez plus tard.
                  </span>
                )}
              </form>
            )}
          </div>

          <FooterCol
            title="Programmes"
            links={programs.map((p) => ({
              label: p.name,
              to: p.slug === "formations" ? "/formations" : `/programmes/${p.slug}`,
            }))}
          />
          <FooterCol
            title="Organisation"
            links={[
              { label: "À propos", to: "/a-propos" },
              { label: "Notre impact", to: "/notre-impact" },
              { label: "Blog", to: "/blog" },
              { label: "Contact", to: "/contact" },
              { label: "Devenir partenaire", to: "/partenaire" },
            ]}
          />
          <FooterCol
            title="Communauté"
            links={[
              { label: "Junior Builders", to: "/junior-builders" },
              { label: "Louer un développeur", to: "/louer-developpeur" },
              { label: "Caravanes", to: "/caravanes" },
              { label: "Rencontre Challenge", to: "/rencontre-challenge" },
            ]}
          />
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] tracking-[0.12em] text-gold uppercase">
              Contact
            </span>
            <FooterLink href={`mailto:${contact.email}`}>{contact.email}</FooterLink>
            <FooterLink href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</FooterLink>
            <span className="text-[15px] text-surface/75">{contact.city}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/12 pt-6">
          <span className="text-sm text-surface/50">© 2026 Gehmit</span>
          <div className="flex gap-5 text-sm text-surface/50">
            <span className="cursor-pointer transition-colors hover:text-surface/80">
              Mentions légales
            </span>
            <span className="cursor-pointer transition-colors hover:text-surface/80">
              Politique de confidentialité
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: { label: string; to: string }[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[11px] tracking-[0.12em] text-gold uppercase">
        {title}
      </span>
      {links.map((l) => (
        <FooterLink key={l.to} to={l.to}>
          {l.label}
        </FooterLink>
      ))}
    </div>
  )
}

function FooterLink({
  to,
  href,
  children,
}: {
  to?: string
  href?: string
  children: string
}) {
  const cls = "text-[15px] text-surface/75 transition-colors hover:text-surface"
  return to ? (
    <Link to={to} className={cls}>
      {children}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {children}
    </a>
  )
}
