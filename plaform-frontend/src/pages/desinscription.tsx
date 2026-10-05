import { Link, useSearchParams } from "react-router"
import { CheckCircle2Icon, CircleAlertIcon } from "lucide-react"
import { Container } from "@/components/site/bands"
import { Button } from "@/components/ui/button"

/** Destination du lien de désinscription présent dans chaque e-mail. */
export function DesinscriptionPage() {
  const [params] = useSearchParams()
  const ok = params.get("ok") === "1"

  return (
    <div className="flex flex-col">
      <Container className="flex flex-col items-center gap-5 py-24 text-center">
        {ok ? (
          <>
            <CheckCircle2Icon className="size-12 text-gehmit" />
            <h1 className="font-heading text-3xl font-semibold">Vous êtes désinscrit</h1>
            <p className="max-w-[420px] text-[16px] leading-relaxed text-ink-muted">
              Vous ne recevrez plus la newsletter Gehmit. Vous pourrez vous
              réinscrire à tout moment depuis le pied de page du site.
            </p>
          </>
        ) : (
          <>
            <CircleAlertIcon className="size-12 text-ink-faint" />
            <h1 className="font-heading text-3xl font-semibold">Lien invalide</h1>
            <p className="max-w-[420px] text-[16px] leading-relaxed text-ink-muted">
              Ce lien de désinscription est incomplet ou a expiré. Utilisez le
              lien présent en bas de votre dernier e-mail.
            </p>
          </>
        )}
        <Button
          render={<Link to="/" />}
          className="mt-2 h-11 rounded-md bg-gehmit px-6 text-[15px] font-semibold text-surface hover:bg-gehmit-hover"
        >
          Retour à l'accueil
        </Button>
      </Container>
    </div>
  )
}
