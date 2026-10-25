import { useState } from "react"
import { Link } from "react-router"
import { contact } from "@/data/content"
import { forCompanies, parcours } from "@/data/parcours"
import { apiPost } from "@/lib/api"
import logoWhiteUrl from "@/assets/logo-gehmit-blanc.webp"

const orgLinks = [
  { label: "À propos", to: "/a-propos" },
  { label: "Notre impact", to: "/notre-impact" },
  { label: "Événements", to: "/evenements" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
  { label: "Faire un don", to: "/don" },
]

export function Footer() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")

  return (
    <footer className="bg-gehmit text-surface">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-page gap-block px-gutter py-block lg:grid-cols-2 lg:items-end">
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-h2 font-semibold">
              Ne manquez plus un appel à candidature.
            </h2>
            <p className="text-body text-surface/65">
              Les sessions, les dates limites et les événements. Une lettre par mois.
            </p>
          </div>
          {state === "sent" ? (
            <p className="text-body text-surface/85">Inscription confirmée. À très bientôt.</p>
          ) : (
            <form
              className="flex flex-col gap-2"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!email.trim()) return
                setState("sending")
                try {
                  await apiPost("/api/public/newsletter/subscribe", { email, source: "newsletter" })
                  setState("sent")
                } catch {
                  setState("error")
                }
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Adresse e-mail
              </label>
              <div className="flex border-b border-surface/40 focus-within:border-surface">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="h-14 min-w-0 flex-1 bg-transparent text-body text-surface outline-none placeholder:text-surface/40"
                />
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="shrink-0 px-1 text-small font-semibold text-surface underline-offset-4 hover:underline disabled:opacity-60"
                >
                  {state === "sending" ? "Envoi…" : "S'inscrire →"}
                </button>
              </div>
              {state === "error" && (
                <span className="text-small text-surface">
                  Inscription impossible pour le moment. Réessayez plus tard.
                </span>
              )}
            </form>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-page flex-col gap-block px-gutter pt-block pb-24 sm:pb-block">
        <div className="grid grid-cols-2 gap-block lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="col-span-2 flex flex-col gap-5 lg:col-span-1">
            <Link to="/" aria-label="Gehmit — accueil">
              <img src={logoWhiteUrl} alt="Gehmit" width={472} height={192} className="h-12 w-auto" />
            </Link>
            <div className="flex flex-col gap-1.5 text-small text-surface/70">
              <a href={`mailto:${contact.email}`} className="hover:text-surface">
                {contact.email}
              </a>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-surface">
                {contact.phone}
              </a>
              <span>{contact.city}</span>
            </div>
          </div>

          <FooterCol title="Le parcours">
            {parcours.flatMap((s) => s.offers).map((o) => (
              <FooterLink key={o.name} to={o.to}>
                {o.name}
              </FooterLink>
            ))}
          </FooterCol>
          <FooterCol title="Entreprises">
            {forCompanies.map((o) => (
              <FooterLink key={o.name} to={o.to}>
                {o.name}
              </FooterLink>
            ))}
          </FooterCol>
          <FooterCol title="Gehmit">
            {orgLinks.map((o) => (
              <FooterLink key={o.to} to={o.to}>
                {o.label}
              </FooterLink>
            ))}
          </FooterCol>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-small text-surface/45">
          <span>© 2026 Gehmit · Ensemble vers l'excellence numérique</span>
          <span>Mentions légales · Politique de confidentialité</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="pb-1 font-heading text-small font-semibold text-surface italic">{title}</span>
      {children}
    </div>
  )
}

function FooterLink({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className="text-small text-surface/75 transition-colors hover:text-surface">
      {children}
    </Link>
  )
}
