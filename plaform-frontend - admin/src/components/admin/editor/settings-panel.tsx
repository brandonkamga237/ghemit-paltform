import { useEffect, type ReactNode } from "react"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { slugify, type ArticleDoc } from "./model"

const inputCls =
  "h-11 w-full rounded-sm border border-sand-dark bg-white px-3 text-small text-navy outline-none placeholder:text-ink-faint focus:border-gehmit focus:ring-3 focus:ring-gehmit/15"

/** Réglages de l'article, dans un panneau latéral (hors du flux d'écriture). */
export function SettingsPanel({
  open,
  doc,
  categories,
  slugTaken,
  onChange,
  onClose,
  onUnpublish,
  onDelete,
}: {
  open: boolean
  doc: ArticleDoc
  categories: string[]
  slugTaken: boolean
  onChange: (patch: Partial<ArticleDoc>) => void
  onClose: () => void
  onUnpublish?: () => void
  onDelete?: () => void
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const cta = doc.cta ?? { title: "", text: "", label: "", to: "" }
  const setCta = (k: keyof typeof cta, v: string) => onChange({ cta: { ...cta, [k]: v } })

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-navy-deep/30 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        role="dialog"
        aria-label="Réglages de l'article"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-surface transition-[translate,visibility] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "visible translate-x-0 shadow-[-16px_0_40px_-24px_rgba(20,30,51,0.45)]" : "invisible translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sand px-6">
          <span className="font-heading text-h3 font-semibold text-navy">Réglages</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les réglages"
            className="inline-flex size-9 items-center justify-center rounded-sm text-ink-muted hover:bg-cream hover:text-navy"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-group overflow-y-auto px-6 py-6">
          <Section title="Adresse">
            <Field label="Slug" hint={slugTaken ? undefined : `gehmit.org/blog/${doc.slug || "…"}`} error={slugTaken ? "Un autre article utilise déjà ce slug." : undefined}>
              <div className="flex gap-2">
                <input
                  value={doc.slug}
                  onChange={(e) => onChange({ slug: slugify(e.target.value), slugTouched: true })}
                  className={inputCls}
                  aria-invalid={slugTaken}
                />
                {doc.slugTouched && (
                  <button
                    type="button"
                    onClick={() => onChange({ slug: slugify(doc.title), slugTouched: false })}
                    className="shrink-0 px-2 text-caption font-semibold text-gehmit hover:underline"
                    title="Recalculer à partir du titre"
                  >
                    Depuis le titre
                  </button>
                )}
              </div>
            </Field>
          </Section>

          <Section title="Classement">
            <Field label="Rubrique">
              <input
                list="article-categories"
                value={doc.category}
                onChange={(e) => onChange({ category: e.target.value })}
                placeholder="Ex. Orientation, Témoignage…"
                className={inputCls}
              />
              <datalist id="article-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Date de publication" hint="Détermine l'ordre sur le blog. Vide : aujourd'hui, à la publication.">
              <input
                type="date"
                value={doc.publishedAt}
                onChange={(e) => onChange({ publishedAt: e.target.value })}
                className={inputCls}
              />
            </Field>
            <label className="flex items-start gap-3 py-1">
              <input
                type="checkbox"
                checked={doc.featured}
                onChange={(e) => onChange({ featured: e.target.checked })}
                className="mt-1 size-4 accent-[var(--color-gehmit)]"
              />
              <span className="flex flex-col">
                <span className="text-small font-semibold text-navy">Mettre à la une</span>
                <span className="text-caption text-ink-muted">Affiché en grand en tête du blog.</span>
              </span>
            </label>
          </Section>

          <Section title="Couverture">
            <Field label="Texte alternatif" hint="Décrit l'image pour les lecteurs d'écran et le référencement.">
              <input
                value={doc.imageAlt}
                onChange={(e) => onChange({ imageAlt: e.target.value })}
                placeholder={doc.imageUrl ? "Ex. Participants au séminaire de Douala" : "Ajoutez d'abord une couverture"}
                disabled={!doc.imageUrl}
                className={cn(inputCls, "disabled:bg-cream")}
              />
            </Field>
          </Section>

          <Section title="Encart de fin d'article">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={doc.cta !== null}
                onChange={(e) => onChange({ cta: e.target.checked ? cta : null })}
                className="size-4 accent-[var(--color-gehmit)]"
              />
              <span className="text-small font-semibold text-navy">Ajouter un appel à l'action</span>
            </label>
            {doc.cta && (
              <div className="flex flex-col gap-4">
                <Field label="Titre">
                  <input value={cta.title} onChange={(e) => setCta("title", e.target.value)} placeholder="Ex. Rejoindre le programme" className={inputCls} />
                </Field>
                <Field label="Texte">
                  <input value={cta.text} onChange={(e) => setCta("text", e.target.value)} placeholder="Ex. Candidatures ouvertes jusqu'au 30 sept." className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Bouton">
                    <input value={cta.label} onChange={(e) => setCta("label", e.target.value)} placeholder="Candidater" className={inputCls} />
                  </Field>
                  <Field label="Lien">
                    <input value={cta.to} onChange={(e) => setCta("to", e.target.value)} placeholder="/candidature/paei" className={inputCls} />
                  </Field>
                </div>
              </div>
            )}
          </Section>

          {(onUnpublish || onDelete) && (
            <Section title="Article">
              <div className="flex flex-col items-start gap-3">
                {onUnpublish && (
                  <button type="button" onClick={onUnpublish} className="text-small font-semibold text-navy underline-offset-4 hover:underline">
                    Repasser en brouillon (retirer du site)
                  </button>
                )}
                {onDelete && (
                  <button type="button" onClick={onDelete} className="text-small font-semibold text-destructive underline-offset-4 hover:underline">
                    Supprimer l'article
                  </button>
                )}
              </div>
            </Section>
          )}
        </div>
      </aside>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-sand pt-5 first:border-t-0 first:pt-0">
      <h3 className="font-heading text-small text-navy italic">{title}</h3>
      {children}
    </section>
  )
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-small font-semibold text-navy">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="text-caption text-destructive">{error}</span>
      ) : hint ? (
        <span className="text-caption text-ink-muted">{hint}</span>
      ) : null}
    </label>
  )
}
