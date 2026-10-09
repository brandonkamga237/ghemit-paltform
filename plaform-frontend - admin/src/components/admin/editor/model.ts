import type { ArticleCta, Block } from "@/components/admin/structured-editors"
import { plainText } from "@/lib/rich-text"

export type BlockType = Block["type"]

/** Bloc tel que manipulé par l'éditeur : identifiant stable + révision. */
export interface EditorBlock extends Block {
  id: string
  /** Incrémentée quand le contenu doit être réinjecté dans le DOM éditable. */
  rev: number
  alt?: string
  wide?: boolean
}

/** Document « article » complet, tel qu'édité. */
export interface ArticleDoc {
  title: string
  excerpt: string
  category: string
  slug: string
  /** Le slug suit le titre tant qu'il n'a pas été modifié à la main. */
  slugTouched: boolean
  publishedAt: string
  featured: boolean
  status: "draft" | "published"
  imageUrl: string
  imageAlt: string
  cta: ArticleCta | null
  blocks: EditorBlock[]
}

/** Blocs dont le texte s'édite en ligne, avec mise en forme. */
export const RICH_TYPES: BlockType[] = ["p", "h2", "h3", "quote", "callout"]
export const LIST_TYPES: BlockType[] = ["ul", "ol"]

let counter = 0
export const uid = () => `b${Date.now().toString(36)}${(counter++).toString(36)}`

export function newBlock(type: BlockType, text = ""): EditorBlock {
  const base: EditorBlock = { id: uid(), rev: 0, type, text }
  if (type === "image" || type === "video") return { ...base, url: "" }
  if (type === "callout") return { ...base, tone: "info" }
  return base
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

const str = (v: unknown) => (v === undefined || v === null ? "" : String(v))

/** Contenu stocké → document éditable. */
export function docFromPayload(payload: Record<string, unknown>, slug: string | null): ArticleDoc {
  const body = Array.isArray(payload.body) ? (payload.body as Record<string, unknown>[]) : []
  const cta = payload.cta && typeof payload.cta === "object" ? (payload.cta as ArticleCta) : null
  return {
    title: str(payload.title),
    excerpt: str(payload.excerpt),
    category: str(payload.category),
    slug: str(payload.slug) || str(slug),
    slugTouched: Boolean(str(payload.slug) || slug),
    publishedAt: str(payload.publishedAt),
    featured: Boolean(payload.featured),
    status: payload.status === "draft" ? "draft" : "published",
    imageUrl: str(payload.imageUrl),
    imageAlt: str(payload.imageAlt),
    cta,
    blocks: body.map((b) => ({
      id: uid(),
      rev: 0,
      type: (b.type as BlockType) ?? "p",
      text: str(b.text),
      url: b.url ? str(b.url) : undefined,
      caption: b.caption ? str(b.caption) : undefined,
      tone: (b.tone as EditorBlock["tone"]) ?? undefined,
      cite: b.cite ? str(b.cite) : undefined,
      alt: b.alt ? str(b.alt) : undefined,
      wide: b.wide === true ? true : undefined,
    })),
  }
}

export function emptyDoc(): ArticleDoc {
  return {
    title: "",
    excerpt: "",
    category: "",
    slug: "",
    slugTouched: false,
    publishedAt: "",
    featured: false,
    status: "draft",
    imageUrl: "",
    imageAlt: "",
    cta: null,
    blocks: [newBlock("p")],
  }
}

/** Corps nettoyé, au format attendu par l'API et le site public. */
export function serializeBlocks(blocks: EditorBlock[]): Record<string, unknown>[] {
  return blocks
    .filter((b) => {
      if (b.type === "image" || b.type === "video") return Boolean(b.url)
      if (b.type === "hr") return true
      return b.text.trim() !== ""
    })
    .map((b) => {
      const text = b.type === "code" || b.type === "table" ? b.text : b.text.trim()
      switch (b.type) {
        case "image":
          return {
            type: "image",
            url: b.url,
            ...(text ? { text } : {}),
            ...(b.alt ? { alt: b.alt } : {}),
            ...(b.wide ? { wide: true } : {}),
          }
        case "video":
          return { type: "video", url: b.url, ...(text ? { text } : {}) }
        case "hr":
          return { type: "hr" }
        case "table":
          return { type: "table", text, ...(b.caption?.trim() ? { caption: b.caption.trim() } : {}) }
        case "callout":
          return { type: "callout", text, tone: b.tone ?? "info" }
        case "quote":
          return { type: "quote", text, ...(b.cite?.trim() ? { cite: b.cite.trim() } : {}) }
        case "ul":
        case "ol":
          return {
            type: b.type,
            text: text
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean)
              .join("\n"),
          }
        default:
          return { type: b.type, text }
      }
    })
}

/**
 * Document → payload enregistré. Les clés inconnues de l'article d'origine
 * (anciens champs) sont conservées.
 */
export function payloadFromDoc(doc: ArticleDoc, base: Record<string, unknown> = {}): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    ...base,
    title: doc.title.trim(),
    excerpt: doc.excerpt.trim(),
    category: doc.category.trim(),
    slug: doc.slug,
    publishedAt: doc.publishedAt,
    featured: doc.featured,
    status: doc.status,
    imageUrl: doc.imageUrl || undefined,
    imageAlt: doc.imageAlt.trim() || undefined,
    body: serializeBlocks(doc.blocks),
    cta: doc.cta && Object.values(doc.cta).some((v) => v.trim() !== "") ? doc.cta : undefined,
  }
  for (const k of Object.keys(payload)) if (payload[k] === undefined) delete payload[k]
  return payload
}

/** Mots du corps : même base de calcul que la durée de lecture de l'API. */
export function wordCount(doc: ArticleDoc): number {
  return doc.blocks
    .map((b) => plainText(b.text))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length
}

/** Même règle que l'API (220 mots par minute, au moins 1). */
export const readingMinutes = (words: number) => Math.max(1, Math.round(words / 220))

export const todayIso = () => new Date().toISOString().slice(0, 10)
