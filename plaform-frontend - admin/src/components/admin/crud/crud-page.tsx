import { useState } from "react"
import { PlusIcon, SearchIcon } from "lucide-react"
import type { ContentItem } from "@/lib/types"
import { PageHeader } from "@/components/admin/page-header"
import { Button } from "@gehmit/ui/components/button"
import { Input } from "@gehmit/ui/components/input"
import { Skeleton } from "@gehmit/ui/components/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@gehmit/ui/components/alert-dialog"
import { itemLabel, type CrudConfig } from "./model"
import { useCrudEditor, useCrudList } from "./use-crud"
import { CrudEditDialog, CrudTable } from "./crud-views"

const plural = (n: number) => (n > 1 ? "s" : "")

/**
 * Écran de contenu générique (programmes, événements, partenaires…) piloté
 * par une `CrudConfig` : liste, recherche, création, modification, suppression.
 */
export function CrudPage({ config }: { config: CrudConfig }) {
  const list = useCrudList(config.type)
  const editor = useCrudEditor(config, list.refresh)
  const [deleting, setDeleting] = useState<ContentItem | null>(null)

  return (
    <div className="flex flex-col gap-group">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          !config.fixedItems && (
            <Button onClick={() => editor.start(null, list.items.length)} className="gap-2">
              <PlusIcon className="size-4" />
              Nouveau
            </Button>
          )
        }
      />

      {!list.loadError && list.items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1 sm:max-w-xs">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={list.q}
              onChange={(e) => list.setQ(e.target.value)}
              placeholder={`Rechercher parmi ${list.items.length} élément${plural(list.items.length)}…`}
              className="pl-9"
            />
          </div>
          <span className="ml-auto text-caption text-muted-foreground">
            {list.visible.length} affiché{plural(list.visible.length)} / {list.items.length}
          </span>
        </div>
      )}

      {list.loadError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-small">
          Impossible de charger les données : {list.loadError}
        </div>
      ) : list.loading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : list.items.length === 0 ? (
        <div className="rounded-lg border border-dashed px-5 py-section text-center text-ink-muted">
          Aucun élément. Cliquez sur « Nouveau » pour commencer.
        </div>
      ) : list.visible.length === 0 ? (
        <div className="rounded-lg border border-dashed px-5 py-block text-center text-ink-muted">
          Aucun élément ne correspond à « {list.q} ».
        </div>
      ) : (
        <CrudTable
          config={config}
          items={list.visible}
          onEdit={(item) => editor.start(item, item.position)}
          onDelete={setDeleting}
        />
      )}

      <CrudEditDialog config={config} editor={editor} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet élément ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting ? `« ${itemLabel(config, deleting)} » sera définitivement supprimé.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleting && (await list.remove(deleting))) setDeleting(null)
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
