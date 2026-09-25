import { useCallback, useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { ContentItem } from "@/lib/types"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/** Textes de pages modifiables — mêmes clés que pageTextDefaults du site public. */
const PAGE_TEXT_LABELS: Record<string, string> = {
  "home.hero.title": "Accueil — titre du héros",
  "home.hero.lede": "Accueil — chapô du héros",
  "about.hero.title": "À propos — titre",
  "about.hero.lede": "À propos — chapô",
  "techpath.hero.title": "Solutions (TechPath) — titre",
  "techpath.hero.lede": "Solutions (TechPath) — chapô",
  "contact.hero.title": "Contact — titre",
  "contact.hero.lede": "Contact — chapô",
  "juniorbuilders.hero.title": "Junior Builders — titre",
  "juniorbuilders.hero.lede": "Junior Builders — chapô",
  "hiredeveloper.hero.title": "Louer un développeur — titre",
  "hiredeveloper.hero.lede": "Louer un développeur — chapô",
  "caravanes.hero.title": "Caravanes — titre",
  "caravanes.hero.lede": "Caravanes — chapô",
  "challenge.hero.title": "Rencontre Challenge — titre",
  "challenge.hero.lede": "Rencontre Challenge — chapô",
}

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
      <PageTextsCard item={settings.find((s) => s.slug === "page-texts")} onSaved={refresh} />
    </div>
  )
}

function PageTextsCard({
  item,
  onSaved,
}: {
  item: ContentItem | undefined
  onSaved: () => void
}) {
  const [texts, setTexts] = useState<Record<string, string>>({})
  const { saving, save } = useSettingSave(item, onSaved)

  useEffect(() => {
    const t = item?.payload.texts
    setTexts(t && typeof t === "object" && !Array.isArray(t) ? (t as Record<string, string>) : {})
  }, [item])

  if (!item) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Textes des pages</CardTitle>
        <CardDescription>
          Titres et chapôs des pages publiques. Laissez vide pour utiliser le texte
          par défaut du site.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(PAGE_TEXT_LABELS).map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label>{label}</Label>
              <Textarea
                value={texts[key] ?? ""}
                onChange={(e) => setTexts((t) => ({ ...t, [key]: e.target.value }))}
                rows={2}
              />
            </div>
          ))}
        </div>
        <Button
          className="self-start"
          disabled={saving}
          onClick={() => {
            const cleaned = Object.fromEntries(
              Object.entries(texts).filter(([, v]) => v.trim() !== "")
            )
            void save({ texts: cleaned })
          }}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </CardContent>
    </Card>
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
