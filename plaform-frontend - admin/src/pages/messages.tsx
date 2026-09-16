import { useCallback, useEffect, useState } from "react"
import { EyeIcon } from "lucide-react"
import { api } from "@/lib/api"
import type { Candidature, ContactMessage } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [candidatures, setCandidatures] = useState<Candidature[]>([])
  const [error, setError] = useState<string | null>(null)
  const [openMessage, setOpenMessage] = useState<ContactMessage | null>(null)
  const [openCandidature, setOpenCandidature] = useState<Candidature | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [m, c] = await Promise.all([
        api.get<ContactMessage[]>("/api/admin/messages"),
        api.get<Candidature[]>("/api/admin/candidatures"),
      ])
      setMessages(m)
      setCandidatures(c)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const markMessageRead = async (m: ContactMessage) => {
    if (!m.readFlag) await api.patch(`/api/admin/messages/${m.id}/read`).catch(() => {})
    setOpenMessage(m)
    void refresh()
  }

  const markCandidatureRead = async (c: Candidature) => {
    if (!c.readFlag)
      await api.patch(`/api/admin/candidatures/${c.id}/read`).catch(() => {})
    setOpenCandidature(c)
    void refresh()
  }

  const unreadM = messages.filter((m) => !m.readFlag).length
  const unreadC = candidatures.filter((c) => !c.readFlag).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">
          Boîte de réception
        </h1>
        <p className="text-[15px] text-ink-muted">
          Messages du formulaire de contact et candidatures aux programmes.
        </p>
      </div>
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4 text-[15px]">
          {error}
        </div>
      )}

      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">
            Messages {unreadM > 0 && <Badge className="ml-2">{unreadM}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="candidatures">
            Candidatures {unreadC > 0 && <Badge className="ml-2">{unreadC}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Card>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Expéditeur</TableHead>
                    <TableHead>Objet</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((m) => (
                    <TableRow key={m.id} className={m.readFlag ? "opacity-70" : ""}>
                      <TableCell className="pl-6">
                        {new Date(m.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={m.readFlag ? "" : "font-semibold"}>
                            {m.name || "—"}
                          </span>
                          <span className="text-[13px] text-muted-foreground">
                            {m.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{m.subject || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={m.readFlag ? "outline" : "default"}>
                          {m.readFlag ? "Lu" : "Nouveau"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void markMessageRead(m)}
                          aria-label="Ouvrir"
                        >
                          <EyeIcon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {messages.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Aucun message.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidatures">
          <Card>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Candidat</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidatures.map((c) => (
                    <TableRow key={c.id} className={c.readFlag ? "opacity-70" : ""}>
                      <TableCell className="pl-6">
                        {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>{c.program}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={c.readFlag ? "" : "font-semibold"}>
                            {[c.form.prenom, c.form.nom].filter(Boolean).join(" ") || "—"}
                          </span>
                          <span className="text-[13px] text-muted-foreground">
                            {String(c.form.email ?? "")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.readFlag ? "outline" : "default"}>
                          {c.readFlag ? "Traitée" : "Nouvelle"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void markCandidatureRead(c)}
                          aria-label="Ouvrir"
                        >
                          <EyeIcon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {candidatures.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Aucune candidature.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Détail message */}
      <Dialog open={!!openMessage} onOpenChange={(o) => !o && setOpenMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{openMessage?.subject || "Message"}</DialogTitle>
          </DialogHeader>
          {openMessage && (
            <div className="flex flex-col gap-3">
              <div className="text-[14px] text-muted-foreground">
                {openMessage.name || "Anonyme"} — {openMessage.email} —{" "}
                {new Date(openMessage.createdAt).toLocaleString("fr-FR")}
              </div>
              <p className="whitespace-pre-wrap rounded-md bg-muted p-4 text-[15px] leading-relaxed">
                {openMessage.message}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Détail candidature */}
      <Dialog
        open={!!openCandidature}
        onOpenChange={(o) => !o && setOpenCandidature(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Candidature — {openCandidature?.program}</DialogTitle>
          </DialogHeader>
          {openCandidature && (
            <Card>
              <CardHeader>
                <CardTitle className="text-[14px] text-muted-foreground">
                  {new Date(openCandidature.createdAt).toLocaleString("fr-FR")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="flex flex-col gap-2">
                  {Object.entries(openCandidature.form).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[140px_1fr] gap-3 text-[14px]">
                      <dt className="font-semibold capitalize">{k}</dt>
                      <dd className="whitespace-pre-wrap">{String(v ?? "—")}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
