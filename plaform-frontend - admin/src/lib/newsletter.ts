/** Newsletter : statuts de campagne et origines d'inscription des abonnés. */
import type { CampaignStatus } from "./types"

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"

/** Statut d'une campagne : libellé et variante de pastille (newsletter, tableau de bord). */
export const CAMPAIGN_STATUS: Record<CampaignStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  sending: { label: "Envoi en cours", variant: "outline" },
  sent: { label: "Envoyée", variant: "default" },
  failed: { label: "Échec", variant: "destructive" },
}

export const campaignStatus = (s: CampaignStatus) => CAMPAIGN_STATUS[s] ?? CAMPAIGN_STATUS.sent

/** Origine d'inscription lisible (« Candidature · paei », « Formulaire de contact »…). */
export function sourceLabel(src: string | null | undefined): string {
  const s = src || "newsletter"
  if (s.startsWith("candidature:")) return `Candidature · ${s.slice("candidature:".length)}`
  return ({ contact: "Formulaire de contact", newsletter: "Newsletter", site: "Site" } as Record<string, string>)[s] ?? s
}
