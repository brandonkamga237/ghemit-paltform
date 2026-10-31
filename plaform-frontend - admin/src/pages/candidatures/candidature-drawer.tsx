import { useState } from "react"
import { openCv } from "@/lib/api"
import type { Candidature, CandidatureStatus } from "@/lib/types"
import { candidateEmail, candidateName, fieldLabel, fmtDateTime, programLabel, STATUS_META } from "@/lib/inbox"
import { toast } from "@gehmit/ui/components/toast"
import { Button } from "@gehmit/ui/components/button"
import { Label } from "@gehmit/ui/components/label"
import { Textarea } from "@gehmit/ui/components/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@gehmit/ui/components/sheet"
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
import { StatusSelect } from "./status-select"

/** Détail d'une candidature : statut, triage, réponses au formulaire, note interne. */
export function CandidatureDrawer({
  candidature: c,
  triage,
  queueSize,
  onDecide,
  onClose,
  onUpdate,
  onDelete,
}: {
  candidature: Candidature | null
  triage: boolean
  queueSize: number
  onDecide: (status: CandidatureStatus) => void
  onClose: () => void
  onUpdate: (id: string, patch: Record<string, unknown>) => Promise<Candidature | null>
  onDelete: (id: string) => Promise<void>
}) {
  if (!c) return null
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-xl">
        {/* key : une autre candidature (triage) remet la note et la confirmation à neuf, sans rejouer l'ouverture. */}
        <DrawerContent
          key={c.id}
          candidature={c}
          triage={triage}
          queueSize={queueSize}
          onDecide={onDecide}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </SheetContent>
    </Sheet>
  )
}

function DrawerContent({
  candidature: c,
  triage,
  queueSize,
  onDecide,
  onUpdate,
  onDelete,
}: {
  candidature: Candidature
  triage: boolean
  queueSize: number
  onDecide: (status: CandidatureStatus) => void
  onUpdate: (id: string, patch: Record<string, unknown>) => Promise<Candidature | null>
  onDelete: (id: string) => Promise<void>
}) {
  const [note, setNote] = useState(c.note ?? "")
  const [savingNote, setSavingNote] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const email = candidateEmail(c)
  const decisions = (c.allowedStatuses ?? []).filter((s) => s !== "archived")

  return (
    <>
      <SheetHeader className="border-b pb-4">
        <SheetTitle className="flex flex-wrap items-center gap-2 text-lg">
          {programLabel(c.program)}
        </SheetTitle>
        <span className="text-caption text-muted-foreground">
          Reçue le {fmtDateTime(c.createdAt)} · {candidateName(c)}
        </span>
      </SheetHeader>

      <div className="flex flex-col gap-5 px-4 py-4">
        {/* Statut + actions */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusSelect candidature={c} className="w-40" onChange={(s) => void onUpdate(c.id, { status: s })} />
          {email && (
            <Button variant="outline" size="sm" render={<a href={`mailto:${email}`} />}>
              Répondre par e-mail
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void onUpdate(c.id, { readFlag: !c.readFlag })}
          >
            {c.readFlag ? "Marquer non lue" : "Marquer lue"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            Supprimer
          </Button>
        </div>

        {/* Mode triage : décision immédiate + candidature suivante */}
        {triage && (
          <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/[0.04] p-3.5">
            <span className="text-caption font-semibold text-primary">
              Mode triage — {queueSize} nouvelle{queueSize > 1 ? "s" : ""} restante{queueSize > 1 ? "s" : ""}
            </span>
            <div className="flex flex-wrap gap-2">
              {decisions.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === "rejected" ? "outline" : "default"}
                  onClick={() => onDecide(s)}
                >
                  {STATUS_META[s].label}
                </Button>
              ))}
              {(c.allowedStatuses ?? []).includes("archived") && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => onDecide("archived")}
                >
                  Archiver
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Données du formulaire */}
        <dl className="flex flex-col gap-2.5 rounded-lg border p-4">
          {Object.entries(c.form).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[160px_1fr] gap-3 text-small">
              <dt className="font-semibold">{fieldLabel(k)}</dt>
              {k === "cvUrl" && typeof v === "string" && v ? (
                <dd>
                  <button
                    type="button"
                    onClick={() =>
                      openCv(v).catch((e: Error) =>
                        toast.add({ title: "Ouverture du CV impossible", description: e.message })
                      )
                    }
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    Ouvrir le CV
                  </button>
                </dd>
              ) : (
                <dd className="whitespace-pre-wrap break-words">
                  {Array.isArray(v) ? v.join(", ") : String(v ?? "—")}
                </dd>
              )}
            </div>
          ))}
        </dl>

        {/* Note interne */}
        <div className="flex flex-col gap-1.5">
          <Label>Note interne (visible uniquement par l'équipe)</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex. Profil intéressant, à rappeler la semaine prochaine…"
            rows={3}
          />
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            disabled={savingNote || note === (c.note ?? "")}
            onClick={async () => {
              setSavingNote(true)
              await onUpdate(c.id, { note })
              setSavingNote(false)
            }}
          >
            {savingNote ? "Enregistrement…" : "Enregistrer la note"}
          </Button>
        </div>
      </div>

      {/* Confirmation de suppression */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette candidature ?</AlertDialogTitle>
            <AlertDialogDescription>
              La candidature de {candidateName(c)} ({programLabel(c.program)}) sera
              définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDelete(false)
                void onDelete(c.id)
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
