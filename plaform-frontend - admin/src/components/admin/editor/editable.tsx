import { useLayoutEffect, useRef, type ClipboardEvent, type FocusEvent, type FormEvent, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

/**
 * Zone contentEditable non contrôlée : le HTML n'est injecté qu'au montage et
 * quand `rev` change. Entre-temps, le DOM appartient à l'utilisateur et l'état
 * est mis à jour à chaque saisie, sans réécrire le contenu (le curseur reste
 * en place).
 */
export function Editable({
  nodeKey,
  blockId,
  html,
  rev,
  rich = true,
  solo = false,
  placeholder,
  className,
  register,
  onInput,
  onKeyDown,
  onPaste,
  onFocus,
}: {
  nodeKey: string
  blockId: string
  html: string
  rev: number
  rich?: boolean
  /** Seule zone du document : son repère reste visible même sans focus. */
  solo?: boolean
  placeholder?: string
  className?: string
  register: (key: string, el: HTMLElement | null) => void
  onInput: (e: FormEvent<HTMLDivElement>) => void
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void
  onPaste?: (e: ClipboardEvent<HTMLDivElement>) => void
  onFocus?: (e: FocusEvent<HTMLDivElement>) => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (ref.current) ref.current.innerHTML = html
    // Réinjection volontairement limitée à `rev` : voir le commentaire du composant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rev, nodeKey])

  return (
    <div
      ref={(el) => {
        ref.current = el
        register(nodeKey, el)
      }}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-label={placeholder}
      data-placeholder={placeholder}
      data-block-id={blockId}
      data-rich={rich ? "true" : undefined}
      data-solo={solo ? "true" : undefined}
      spellCheck
      className={cn("editable outline-none", className)}
      onInput={(e) => {
        const el = e.currentTarget
        // Une zone vidée garde parfois un <br> : on la vide pour afficher le repère.
        if ((el.textContent ?? "") === "" && el.innerHTML !== "") el.innerHTML = ""
        onInput(e)
      }}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onFocus={onFocus}
    />
  )
}
