/**
 * Dates de l'API (`AAAA-MM-JJ…`) lues sans `Date` : pas de décalage de fuseau,
 * un événement du 3 mars reste le 3 mars quel que soit le navigateur.
 */

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
]

const MONTHS_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
]

export interface DateParts {
  day: string
  month: string
  monthShort: string
  year: string
}

/** Jour, mois (long et abrégé) et année d'une date ISO ; null si illisible. */
export function dateParts(iso: string | null | undefined): DateParts | null {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  const i = Number(m[2]) - 1
  return { day: String(Number(m[3])), month: MONTHS[i], monthShort: MONTHS_SHORT[i], year: m[1] }
}

/** « 3 mars 2026 » (mois abrégé) ; chaîne vide si la date est illisible. */
export function shortDate(iso: string | null | undefined): string {
  const d = dateParts(iso)
  return d ? `${d.day} ${d.monthShort} ${d.year}` : ""
}
