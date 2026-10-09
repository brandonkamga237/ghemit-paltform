import type { ReactNode } from "react"
import { CheckIcon, CircleAlertIcon, FileTextIcon } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "cn"
import { contact } from "@/data/content"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Champs de formulaire du site : 16 px minimum (pas de zoom iOS), angles nets. */
export const inputCls =
  "h-12 rounded-sm border-sand-dark bg-white px-3.5 text-[16px] text-navy placeholder:text-ink-faint focus-visible:border-gehmit focus-visible:ring-3 focus-visible:ring-gehmit/15"

export const textareaCls =
  "min-h-[120px] rounded-sm border-sand-dark bg-white p-3.5 text-[16px] leading-relaxed text-navy placeholder:text-ink-faint focus-visible:border-gehmit focus-visible:ring-3 focus-visible:ring-gehmit/15"

/**
 * Libellé + champ + aide ou erreur. Rendu en <label> pour associer le libellé
 * au champ ; `as="div"` quand le contenu contient déjà un <label> (fichier).
 */
export function Field({
  label,
  error,
  hint,
  optional,
  as = "label",
  className,
  children,
}: {
  label: string
  error?: string
  hint?: string
  optional?: boolean
  as?: "label" | "div"
  className?: string
  children: ReactNode
}) {
  const Tag = as
  return (
    <Tag className={cn("flex flex-col gap-2", className)}>
      <span className="flex items-baseline justify-between gap-3 text-[15px] font-semibold text-navy">
        {label}
        {optional && <span className="text-[13px] font-normal text-ink-muted">Facultatif</span>}
      </span>
      {children}
      {error ? (
        <span role="alert" className="flex items-center gap-1.5 text-[14px] text-soon-text">
          <CircleAlertIcon className="size-3.5 shrink-0" />
          {error}
        </span>
      ) : hint ? (
        <span className="text-[14px] text-ink-muted">{hint}</span>
      ) : null}
    </Tag>
  )
}

/** Liste déroulante au style des champs. */
export function SelectField({
  value,
  onChange,
  options,
  invalid,
  placeholder = "Sélectionner",
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  invalid?: boolean
  placeholder?: string
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as string)}>
      <SelectTrigger aria-invalid={invalid} className={cn(inputCls, "w-full justify-between")}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Choix exclusifs présentés comme des boutons (profil, type…). */
export function ChoiceGroup({
  options,
  value,
  onChange,
  multiple = false,
}: {
  options: string[]
  value: string | string[]
  onChange: (v: string) => void
  multiple?: boolean
}) {
  const selected = (o: string) => (Array.isArray(value) ? value.includes(o) : value === o)
  return (
    <div className="flex flex-wrap gap-2" role={multiple ? "group" : "radiogroup"}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role={multiple ? "checkbox" : "radio"}
          aria-checked={selected(o)}
          onClick={() => onChange(o)}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-sm border px-4 text-[15px] transition-colors",
            selected(o)
              ? "border-navy bg-navy font-semibold text-surface"
              : "border-sand-dark bg-white text-navy hover:border-navy"
          )}
        >
          {selected(o) && <CheckIcon className="size-3.5" strokeWidth={2.5} />}
          {o}
        </button>
      ))}
    </div>
  )
}

/** Pied de formulaire : rappel à gauche, action à droite, erreur d'envoi dessous. */
export function FormFooter({
  note,
  error,
  children,
}: {
  note?: ReactNode
  error?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-sand pt-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {note ? <span className="text-[14.5px] text-ink-muted">{note}</span> : <span />}
        {children}
      </div>
      {error && (
        <span role="alert" className="flex items-start gap-1.5 text-[14.5px] text-soon-text">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
          Envoi impossible pour le moment. Vérifiez votre connexion, ou écrivez-nous à{" "}
          {contact.email}.
        </span>
      )}
    </div>
  )
}

export const submitCls =
  "inline-flex h-12 items-center justify-center rounded-sm bg-gehmit px-7 text-[15.5px] font-semibold text-surface transition-colors hover:bg-gehmit-hover active:bg-gehmit-active disabled:opacity-60"

/** Confirmation après envoi : ce qui a été reçu et ce qui va se passer. */
export function FormSuccess({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 border-t-2 border-gehmit bg-surface p-7 sm:p-9"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-gehmit text-surface">
        <CheckIcon className="size-5" strokeWidth={2.5} />
      </span>
      <span className="font-heading text-[28px] leading-tight font-semibold text-navy">{title}</span>
      <div className="max-w-[560px] text-[16.5px] leading-relaxed text-ink-muted">{children}</div>
    </motion.div>
  )
}

/** Panneau blanc qui porte un formulaire. */
export function FormPanel({ onSubmit, children }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; children: ReactNode }) {
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6 bg-surface p-6 shadow-[0_1px_0_var(--color-sand-dark)] sm:p-9">
      {children}
    </form>
  )
}

/** Petit récapitulatif clé/valeur (encart latéral des formulaires). */
export function Recap({ title, eyebrow, rows, children }: { title: string; eyebrow: string; rows: [string, string][]; children?: ReactNode }) {
  return (
    <aside className="flex flex-col gap-4 bg-navy p-7 text-surface lg:sticky lg:top-24">
      <span className="text-[14px] text-surface/60">{eyebrow}</span>
      <span className="font-heading text-[26px] leading-tight font-semibold">{title}</span>
      <dl className="flex flex-col border-t border-white/10">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-white/10 py-3 text-[15px]">
            <dt className="text-surface/60">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      {children ? <div className="text-[14.5px] leading-relaxed text-surface/65">{children}</div> : null}
    </aside>
  )
}


/** Section « formulaire + récapitulatif » des pages d'offre. */
export function FormSection({
  id,
  title,
  text,
  aside,
  children,
}: {
  id: string
  title: ReactNode
  text?: ReactNode
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 bg-cream">
      <div className="mx-auto grid w-full max-w-[1240px] items-start gap-10 px-5 py-16 sm:px-10 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="flex flex-col gap-8 lg:col-span-7">
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] text-navy sm:text-[40px]">
              {title}
            </h2>
            {text ? <p className="max-w-[560px] text-[17px] leading-relaxed text-ink-muted">{text}</p> : null}
          </div>
          {children}
        </div>
        {aside ? <div className="lg:col-span-4 lg:col-start-9">{aside}</div> : null}
      </div>
    </section>
  )
}

/** Sélection d'un CV PDF (2 Mo max). */
export function CvInput({ name, onChange }: { name?: string; onChange: (f: File | null, error?: string) => void }) {
  return (
    <label className="flex h-12 cursor-pointer items-center justify-between rounded-sm border border-dashed border-sand-dark bg-white px-3.5 text-[16px] transition-colors hover:border-gehmit focus-within:border-gehmit">
      <span className={name ? "text-navy" : "text-ink-muted"}>{name || "Choisir un fichier PDF"}</span>
      <FileTextIcon className="size-4 text-ink-faint" />
      <input
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null
          if (f && f.size > 2 * 1024 * 1024) onChange(null, "Le fichier dépasse 2 Mo.")
          else onChange(f)
        }}
      />
    </label>
  )
}
