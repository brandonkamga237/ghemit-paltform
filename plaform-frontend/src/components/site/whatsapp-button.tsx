import { MessageCircleIcon } from "lucide-react"
import { whatsappUrl } from "@/data/content"

/** Bouton flottant : message WhatsApp direct, présent sur toutes les pages. */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter avec nous sur WhatsApp"
      title="Discuter avec nous sur WhatsApp"
      className="fixed right-5 bottom-5 z-50 flex size-13 items-center justify-center rounded-full bg-gehmit text-surface shadow-lg transition-transform hover:scale-105 hover:bg-gehmit-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:right-6 sm:bottom-6"
    >
      <MessageCircleIcon className="size-6" strokeWidth={1.8} />
    </a>
  )
}
