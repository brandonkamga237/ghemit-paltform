/**
 * Texte enrichi des blocs d'article.
 *
 * Le stockage (et le site public) utilise un markdown léger, sans
 * imbrication : **gras**, *italique*, [libellé](url). L'éditeur travaille en
 * HTML dans des zones contentEditable ; ces fonctions font l'aller-retour.
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Markdown léger → HTML pour l'édition. */
export function mdToHtml(md: string): string {
  return md
    .split(INLINE)
    .map((part) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) return `<strong>${escapeHtml(part.slice(2, -2))}</strong>`
      if (/^\*[^*]+\*$/.test(part)) return `<em>${escapeHtml(part.slice(1, -1))}</em>`
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (link) return `<a href="${escapeHtml(link[2])}">${escapeHtml(link[1])}</a>`
      return escapeHtml(part)
    })
    .join("")
}

/** Entoure un fragment de marqueurs en laissant les espaces de bord à l'extérieur. */
function wrap(marker: string, inner: string): string {
  const core = inner.trim()
  if (!core) return inner
  const lead = inner.slice(0, inner.length - inner.trimStart().length)
  const trail = inner.slice(inner.trimEnd().length)
  return `${lead}${marker}${core}${marker}${trail}`
}

/** HTML d'une zone éditable → markdown léger. */
export function htmlToMd(root: Node): string {
  let out = ""
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? ""
      return
    }
    if (!(node instanceof HTMLElement)) return
    const tag = node.tagName
    if (tag === "BR") {
      out += " "
      return
    }
    const inner = htmlToMd(node)
    const weight = node.style.fontWeight
    if (tag === "B" || tag === "STRONG" || weight === "bold" || Number(weight) >= 600) {
      out += wrap("**", inner)
    } else if (tag === "I" || tag === "EM" || node.style.fontStyle === "italic") {
      out += wrap("*", inner)
    } else if (tag === "A") {
      const href = node.getAttribute("href") ?? ""
      out += inner.trim() && href ? `[${inner.trim()}](${href})` : inner
    } else if (tag === "DIV" || tag === "P") {
      out += (out && !out.endsWith(" ") ? " " : "") + inner
    } else {
      out += inner
    }
  })
  return out.replace(/\u00a0/g, " ")
}

/** Texte brut (sans marqueurs), pour compter les mots. */
export function plainText(md: string): string {
  return md.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
}

// ─── Curseur dans une zone contentEditable ───────────────────────────────────

/** Nombre de caractères entre le début de `el` et le curseur. */
export function caretOffset(el: HTMLElement): number {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return 0
  const range = sel.getRangeAt(0)
  if (!el.contains(range.startContainer)) return 0
  const pre = range.cloneRange()
  pre.selectNodeContents(el)
  pre.setEnd(range.startContainer, range.startOffset)
  return pre.toString().length
}

export function selectionCollapsed(): boolean {
  const sel = window.getSelection()
  return !sel || sel.isCollapsed
}

export const caretAtStart = (el: HTMLElement) => selectionCollapsed() && caretOffset(el) === 0
export const caretAtEnd = (el: HTMLElement) =>
  selectionCollapsed() && caretOffset(el) >= (el.textContent ?? "").length

/** Place le curseur à `offset` caractères (ou à la fin si `offset` vaut "end"). */
export function setCaret(el: HTMLElement, offset: number | "start" | "end") {
  el.focus()
  const sel = window.getSelection()
  if (!sel) return
  const range = document.createRange()
  const total = (el.textContent ?? "").length
  let target = offset === "start" ? 0 : offset === "end" ? total : Math.min(offset, total)
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const len = node.textContent?.length ?? 0
    if (target <= len) {
      range.setStart(node, target)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
      return
    }
    target -= len
    node = walker.nextNode()
  }
  range.selectNodeContents(el)
  range.collapse(false)
  sel.removeAllRanges()
  sel.addRange(range)
}

/**
 * Coupe la zone au curseur : le début reste dans `el`, la fin est retirée et
 * renvoyée en markdown. Sert à « Entrée » au milieu d'un paragraphe.
 */
export function splitAtCaret(el: HTMLElement): { before: string; after: string } {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return { before: htmlToMd(el), after: "" }
  const caret = sel.getRangeAt(0)
  const tail = document.createRange()
  tail.selectNodeContents(el)
  tail.setStart(caret.endContainer, caret.endOffset)
  const holder = document.createElement("div")
  holder.appendChild(tail.extractContents())
  return { before: htmlToMd(el).trimEnd(), after: htmlToMd(holder).trimStart() }
}

/** Demande une URL et crée le lien sur la sélection courante. */
export function promptLink() {
  const url = window.prompt("Adresse du lien (https://… ou /page-du-site)")
  if (url && url.trim()) document.execCommand("createLink", false, url.trim())
}
