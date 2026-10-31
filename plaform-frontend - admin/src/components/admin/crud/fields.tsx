import type { ReactNode } from "react"
import { ImageField } from "@/components/admin/media-picker"
import { Checkbox } from "@gehmit/ui/components/checkbox"
import { Input } from "@gehmit/ui/components/input"
import { Label } from "@gehmit/ui/components/label"
import { Textarea } from "@gehmit/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@gehmit/ui/components/select"
import { hintOf, valueLabel, type Draft, type FieldDef } from "./model"

/** Libellé, contrôle et aide d'un champ de formulaire. */
export function FieldWrap({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-small font-semibold">{label}</Label>
      {children}
      {hint && <span className="text-caption text-ink-faint">{hint}</span>}
    </div>
  )
}

/** Contrôle adapté au type du champ (texte, liste, case, nombre, image…). */
export function FieldInput({
  field,
  draft,
  set,
}: {
  field: FieldDef
  draft: Draft
  set: (name: string, value: unknown) => void
}) {
  const kind = field.kind ?? "text"
  const value = draft[field.name]

  switch (kind) {
    case "textarea":
      return (
        <FieldWrap label={field.label} hint={hintOf(field, value)}>
          <Textarea
            value={String(value ?? "")}
            onChange={(e) => set(field.name, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className="min-h-[90px]"
          />
        </FieldWrap>
      )
    case "checkbox":
      return (
        <div className="flex items-center gap-2.5 pt-1">
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(v) => set(field.name, v === true)}
          />
          <Label className="text-small font-semibold">{field.label}</Label>
        </div>
      )
    case "select":
      return (
        <FieldWrap label={field.label} hint={field.hint}>
          <Select
            value={String(value ?? "")}
            onValueChange={(v) => set(field.name, v)}
            items={Object.fromEntries((field.options ?? []).map((o) => [o, valueLabel(o)]))}
          >
            <SelectTrigger className="w-full justify-between">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((o) => (
                <SelectItem key={o} value={o}>
                  {valueLabel(o)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrap>
      )
    case "number":
      return (
        <FieldWrap label={field.label} hint={field.hint}>
          <Input
            type="number"
            value={Number(value ?? 0)}
            onChange={(e) => set(field.name, Number(e.target.value))}
          />
        </FieldWrap>
      )
    case "image":
      return (
        <ImageField
          value={String(value ?? "")}
          onChange={(url) => set(field.name, url)}
          label={field.label}
          hint={field.hint}
        />
      )
    default:
      return (
        <FieldWrap
          label={field.label}
          hint={hintOf(field, value) ?? (kind === "tags" ? "Séparées par des virgules" : undefined)}
        >
          <Input
            value={String(value ?? "")}
            onChange={(e) => set(field.name, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
          />
        </FieldWrap>
      )
  }
}
