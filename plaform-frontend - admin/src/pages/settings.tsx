import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { ContentItem } from "@/lib/types"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SettingsPage() {
  const [settings, setSettings] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setSettings(await api.get<ContentItem[]>("/api/admin/content/settings"))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (loading) return <div className="py-16 text-center text-ink-muted">Chargement…</div>
  if (error)
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-5 py-4">
        {error}
      </div>
    )

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.01em]">Réglages</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <ContactCard item={settings.find((s) => s.slug === "contact")} onSaved={refresh} />
        <CategoriesCard
          item={settings.find((s) => s.slug === "blog-categories")}
          onSaved={refresh}
        />
      </div>
    </div>
  )
}

function useSettingSave(item: ContentItem | undefined, onSaved: () => void) {
  const [saving, setSaving] = useState(false)
  return {
    saving,
    save: async (payload: Record<string, unknown>) => {
      if (!item) return
      setSaving(true)
      try {
        await api.put(`/api/admin/content/${item.id}`, { payload })
        toast.add({ title: "Réglage enregistré" })
        onSaved()
      } catch (e) {
        toast.add({
          title: "Enregistrement impossible",
          description: e instanceof Error ? e.message : undefined,
        })
      } finally {
        setSaving(false)
      }
    },
  }
}

function ContactCard({
  item,
  onSaved,
}: {
  item: ContentItem | undefined
  onSaved: () => void
}) {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const { saving, save } = useSettingSave(item, onSaved)

  useEffect(() => {
    setEmail(String(item?.payload.email ?? ""))
    setPhone(String(item?.payload.phone ?? ""))
    setCity(String(item?.payload.city ?? ""))
  }, [item])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coordonnées</CardTitle>
        <CardDescription>Affichées dans le pied de page et la page contact.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>E-mail</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Téléphone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Ville</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <Button
          className="self-start"
          disabled={saving || !item}
          onClick={() => void save({ email, phone, city })}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </CardContent>
    </Card>
  )
}

function CategoriesCard({
  item,
  onSaved,
}: {
  item: ContentItem | undefined
  onSaved: () => void
}) {
  const [items, setItems] = useState("")
  const { saving, save } = useSettingSave(item, onSaved)

  useEffect(() => {
    const list = item?.payload.items
    setItems(Array.isArray(list) ? list.join(", ") : "")
  }, [item])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catégories du blog</CardTitle>
        <CardDescription>Filtres affichés sur la page /blog.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Catégories</Label>
          <Input
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="Tous, GLab Sisters, Événements…"
          />
          <span className="text-[13px] text-muted-foreground">
            Séparées par des virgules
          </span>
        </div>
        <Button
          className="self-start"
          disabled={saving || !item}
          onClick={() =>
            void save({
              items: items
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </CardContent>
    </Card>
  )
}
