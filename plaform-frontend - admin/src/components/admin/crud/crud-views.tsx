import { PencilIcon, Trash2Icon } from "lucide-react"
import type { ContentItem } from "@/lib/types"
import { Button } from "@gehmit/ui/components/button"
import { Input } from "@gehmit/ui/components/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@gehmit/ui/components/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@gehmit/ui/components/dialog"
import { FieldInput, FieldWrap } from "./fields"
import { itemLabel, type CrudConfig } from "./model"
import type { CrudEditor } from "./use-crud"

/** Tableau des éléments : colonnes de la configuration, date de modification, actions. */
export function CrudTable({
  config,
  items,
  onEdit,
  onDelete,
}: {
  config: CrudConfig
  items: ContentItem[]
  onEdit: (item: ContentItem) => void
  onDelete: (item: ContentItem) => void
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {config.columns.map((c) => (
              <TableHead key={c.key}>{c.label}</TableHead>
            ))}
            <TableHead className="w-28 whitespace-nowrap">Modifié</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="cursor-pointer" onClick={() => onEdit(item)}>
              {config.columns.map((c) => (
                <TableCell key={c.key}>
                  {c.render ? c.render(item) : String(item.payload[c.key] ?? item.slug ?? "—")}
                </TableCell>
              ))}
              <TableCell className="text-caption whitespace-nowrap text-ink-faint">
                {new Date(item.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)} aria-label="Modifier">
                    <PencilIcon className="size-4" />
                  </Button>
                  {!config.fixedItems && (
                    <Button variant="ghost" size="icon" onClick={() => onDelete(item)} aria-label="Supprimer">
                      <Trash2Icon className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/** Création / modification d'un élément : slug et ordre (si la liste est libre), puis les champs. */
export function CrudEditDialog({ config, editor: ed }: { config: CrudConfig; editor: CrudEditor }) {
  return (
    <Dialog open={ed.open} onOpenChange={ed.setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {ed.editing ? `Modifier — ${itemLabel(config, ed.editing)}` : `Nouveau — ${config.title}`}
          </DialogTitle>
          <DialogDescription>Renseignez les champs puis enregistrez.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          {!config.fixedItems && (
            <div className="grid gap-4 sm:grid-cols-2">
              {config.hasSlug && (
                <FieldWrap label="Slug" hint="Identifiant unique (URL)">
                  <Input value={ed.slug} onChange={(e) => ed.setSlug(e.target.value)} placeholder="mon-slug" />
                </FieldWrap>
              )}
              <FieldWrap label="Ordre d'affichage">
                <Input type="number" value={ed.position} onChange={(e) => ed.setPosition(Number(e.target.value))} />
              </FieldWrap>
            </div>
          )}
          {config.fields.map((f) => (
            <FieldInput key={f.name} field={f} draft={ed.draft} set={ed.set} />
          ))}
          {ed.error && <p className="text-small text-destructive">{ed.error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => ed.setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={ed.save} disabled={ed.saving}>
            {ed.saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
