import type { ReactNode } from "react"
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { mediaSrc } from "@/lib/api"
import { serializeBlocks, type ArticleDoc } from "./model"

/**
 * Aperçu fidèle de la page article du site public
 * (plaform-frontend/src/pages/article.tsx) : mêmes tailles, mêmes blocs.
 */

const SITE = "https://gehmit.org"
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]

function richText(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} className="font-semibold text-navy">{part.slice(2, -2)}</strong>
    if (/^\*[^*]+\*$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (m) {
      const href = m[2].startsWith("/") ? `${SITE}${m[2]}` : m[2]
      return (
        <a key={i} href={href} target="_blank" rel="noreferrer" className="font-medium text-gehmit underline underline-offset-4">
          {m[1]}
        </a>
      )
    }
    return part
  })
}

function youtube(url: string): string | null {
  const m =
    url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([\w-]{6,})/) ?? url.match(/youtu\.be\/([\w-]{6,})/)
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null
}

function TableView({ text, caption }: { text: string; caption?: string }) {
  const rows = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !/^\|?[\s:-]+\|[\s:|-]*$/.test(l))
    .map((l) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()))
  if (rows.length === 0) return null
  const [head, ...body] = rows
  return (
    <figure className="flex flex-col gap-2">
      <div className="overflow-x-auto border-y border-sand-dark">
        <table className="w-full min-w-[480px] text-left">
          <thead>
            <tr className="border-b border-sand-dark bg-cream">
              {head.map((c, i) => (
                <th key={i} className="px-4 py-3 text-small font-semibold text-navy">{richText(c)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, i) => (
              <tr key={i} className="border-b border-sand last:border-0">
                {row.map((c, j) => (
                  <td key={j} className="px-4 py-3 text-small text-ink-muted">{richText(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption ? <figcaption className="text-small text-ink-muted">{caption}</figcaption> : null}
    </figure>
  )
}

const TONES = {
  info: { icon: InfoIcon, cls: "bg-open-bg" },
  success: { icon: CheckCircle2Icon, cls: "bg-gold-tint" },
  warning: { icon: AlertTriangleIcon, cls: "bg-soon-bg" },
} as const

function BlockView({ block }: { block: Record<string, unknown> }) {
  const text = String(block.text ?? "")
  switch (block.type) {
    case "h2":
      return <h2 className="pt-4 font-heading text-h2 font-semibold text-navy">{richText(text)}</h2>
    case "h3":
      return <h3 className="pt-2 font-heading text-h3 font-semibold text-navy">{richText(text)}</h3>
    case "quote":
      return (
        <blockquote className="my-4 flex flex-col gap-3 border-y border-sand-dark py-8">
          <p className="font-heading text-h2 text-navy italic">{richText(text)}</p>
          {block.cite ? <cite className="text-small font-semibold text-ink-muted not-italic">{String(block.cite)}</cite> : null}
        </blockquote>
      )
    case "image":
      return (
        <figure className="flex flex-col gap-2">
          <img src={mediaSrc(String(block.url))} alt={String(block.alt ?? text)} className="w-full object-cover" />
          {text ? <figcaption className="text-small text-ink-muted">{text}</figcaption> : null}
        </figure>
      )
    case "video": {
      const embed = youtube(String(block.url))
      return (
        <figure className="flex flex-col gap-2">
          {embed ? (
            <div className="aspect-video w-full bg-navy">
              <iframe src={embed} title={text || "Vidéo"} className="h-full w-full" allowFullScreen />
            </div>
          ) : (
            <video src={mediaSrc(String(block.url))} controls preload="metadata" className="w-full" />
          )}
          {text ? <figcaption className="text-small text-ink-muted">{text}</figcaption> : null}
        </figure>
      )
    }
    case "table":
      return <TableView text={text} caption={block.caption ? String(block.caption) : undefined} />
    case "callout": {
      const tone = TONES[(block.tone as keyof typeof TONES) ?? "info"] ?? TONES.info
      const Icon = tone.icon
      return (
        <aside className={cn("flex gap-3.5 px-6 py-5", tone.cls)}>
          <Icon className="mt-0.5 size-5 shrink-0 text-navy" />
          <p className="text-body text-navy">{richText(text)}</p>
        </aside>
      )
    }
    case "hr":
      return <hr className="border-t border-sand" />
    case "ul":
    case "ol": {
      const Tag = block.type === "ol" ? "ol" : "ul"
      return (
        <Tag
          className={cn(
            "space-y-2 pl-6 text-lead text-navy/80 marker:text-gehmit",
            block.type === "ol" ? "list-decimal marker:font-semibold" : "list-disc"
          )}
        >
          {text.split("\n").filter((l) => l.trim() !== "").map((l, i) => (
            <li key={i}>{richText(l)}</li>
          ))}
        </Tag>
      )
    }
    case "code":
      return (
        <pre className="overflow-x-auto bg-navy p-5">
          <code className="font-mono text-small text-surface">{text}</code>
        </pre>
      )
    default:
      return <p className="text-lead text-navy/80">{richText(text)}</p>
  }
}

export function ArticlePreview({ doc, minutes }: { doc: ArticleDoc; minutes: number }) {
  const body = serializeBlocks(doc.blocks)
  const m = doc.publishedAt.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const date = m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : "Date à définir"

  return (
    <div className="bg-surface pb-16">
      <div className="mx-auto box-content flex max-w-text flex-col gap-5 px-gutter pt-14 pb-10">
        <p className="text-small text-ink-muted">
          Blog <span className="text-ink-faint">/</span>{" "}
          <span className="font-semibold text-navy">{doc.category || "Sans rubrique"}</span>
        </p>
        <p className="text-small text-ink-muted">
          {date} · {minutes} min de lecture
        </p>
        <h1 className="font-heading text-display font-semibold text-navy">
          {doc.title || "Titre de l'article"}
        </h1>
        {doc.excerpt ? <p className="text-lead text-navy/75">{doc.excerpt}</p> : null}
      </div>
      {doc.imageUrl ? (
        <div className="mx-auto max-w-[1040px] px-5 pb-12">
          <img src={mediaSrc(doc.imageUrl)} alt={doc.imageAlt || doc.title} className="h-[240px] w-full object-cover sm:h-[480px]" />
        </div>
      ) : null}
      <article className="mx-auto box-content flex max-w-text flex-col gap-group px-gutter">
        {body.length === 0 ? (
          <p className="text-body text-ink-faint italic">Le corps de l'article est vide.</p>
        ) : (
          body.map((b, i) => <BlockView key={i} block={b} />)
        )}
      </article>
      {doc.cta ? (
        <section className="mt-16 bg-navy text-surface">
          <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-between gap-group px-5 py-block">
            <div className="flex flex-col gap-2">
              <span className="font-heading text-h2 font-semibold">{doc.cta.title}</span>
              <span className="text-body text-surface/70">{doc.cta.text}</span>
            </div>
            <span className="inline-flex h-12 items-center rounded-sm bg-gehmit px-6 text-small font-semibold">
              {doc.cta.label || "Bouton"}
            </span>
          </div>
        </section>
      ) : null}
    </div>
  )
}
