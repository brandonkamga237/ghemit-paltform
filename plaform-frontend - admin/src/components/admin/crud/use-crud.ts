import { useState } from "react"
import { api } from "@/lib/api"
import type { ContentItem } from "@/lib/types"
import { toast } from "@gehmit/ui/components/toast"
import { useResource } from "@/lib/use-resource"
import { toDraft, toPayload, type CrudConfig, type Draft } from "./model"

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : undefined)

/** Éléments d'un type de contenu : chargement, recherche, suppression. */
export function useCrudList(type: string) {
  const res = useResource(() => api.get<ContentItem[]>(`/api/admin/content/${type}`), [type])
  const items = res.data ?? []
  const { loading, error: loadError, reload: refresh } = res
  const [q, setQ] = useState("")

  const remove = async (item: ContentItem) => {
    try {
      await api.del(`/api/admin/content/${item.id}`)
      toast.add({ title: "Élément supprimé" })
      refresh()
      return true
    } catch (e) {
      toast.add({ title: "Suppression impossible", description: errorMessage(e) })
      return false
    }
  }

  const query = q.trim().toLowerCase()
  const visible = query
    ? items.filter((i) => `${JSON.stringify(i.payload)} ${i.slug ?? ""}`.toLowerCase().includes(query))
    : items

  return { items, visible, loading, loadError, q, setQ, refresh, remove }
}

/** Formulaire de création / modification d'un élément, avec validation des champs. */
export function useCrudEditor(config: CrudConfig, onSaved: () => void) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [draft, setDraft] = useState<Draft>({})
  const [slug, setSlug] = useState("")
  const [position, setPosition] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const start = (item: ContentItem | null, nextPosition: number) => {
    setEditing(item)
    setDraft(toDraft(config.fields, item?.payload ?? {}))
    setSlug(item ? String(item.payload.slug ?? item.slug ?? "") : "")
    setPosition(item ? item.position : nextPosition)
    setError(null)
    setOpen(true)
  }

  const set = (name: string, value: unknown) => setDraft((d) => ({ ...d, [name]: value }))

  const save = async () => {
    for (const f of config.fields) {
      const message = f.validate?.(String(draft[f.name] ?? ""))
      if (message) {
        setError(`${f.label} : ${message}`)
        return
      }
    }
    const payload = toPayload(config.fields, draft)
    if (config.hasSlug) payload.slug = slug
    setSaving(true)
    setError(null)
    try {
      const body = { slug: slug || null, position, payload }
      if (editing) await api.put(`/api/admin/content/${editing.id}`, body)
      else await api.post(`/api/admin/content/${config.type}`, body)
      setOpen(false)
      toast.add({ title: editing ? "Élément mis à jour" : "Élément créé" })
      onSaved()
    } catch (e) {
      setError(errorMessage(e) ?? "Erreur d'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  return { open, setOpen, editing, draft, set, slug, setSlug, position, setPosition, error, saving, start, save }
}

export type CrudEditor = ReturnType<typeof useCrudEditor>
