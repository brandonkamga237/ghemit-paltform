import { useSearchParams } from "react-router"
import { Container } from "@/components/site/bands"
import { CtaLink } from "@/components/site/cta"
import { usePageMeta } from "@/lib/seo"

/** Destination du lien de désinscription présent dans chaque e-mail. */
export function DesinscriptionPage() {
  const [params] = useSearchParams()
  const ok = params.get("ok") === "1"
  usePageMeta("Désinscription")

  return (
    <section className="bg-cream">
      <Container className="flex flex-col items-start gap-group py-section">
        <h1 className="max-w-[720px] font-heading text-display font-semibold text-navy">
          {ok ? (
            <>Vous êtes <span className="accent-word">désinscrit</span>.</>
          ) : (
            <>Ce lien n'est <span className="accent-word">plus valide</span>.</>
          )}
        </h1>
        <p className="max-w-[520px] text-body text-navy/75">
          {ok
            ? "Vous ne recevrez plus la lettre de Gehmit. Vous pourrez vous réinscrire à tout moment depuis le bas de chaque page."
            : "Ce lien de désinscription est incomplet ou a expiré. Utilisez celui qui figure en bas de votre dernier e-mail."}
        </p>
        <CtaLink to="/" arrow>Retour à l'accueil</CtaLink>
      </Container>
    </section>
  )
}
