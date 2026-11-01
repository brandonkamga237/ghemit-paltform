import { createContext, useContext } from "react"

/**
 * Ton du fond courant : les composants posés dessus (titres, liens fléchés,
 * boutons, registres de chiffres) choisissent leur couleur en conséquence.
 * On ne recopie donc jamais `text-surface` à la main sur un fond sombre.
 */
export type Tone = "light" | "inverse"

export const ToneContext = createContext<Tone>("light")

export const useTone = () => useContext(ToneContext)
