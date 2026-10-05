import type { Article } from "@/data/content"

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080"

/** Préfixe les URLs relatives de la médiathèque par l'origine de l'API. */
export const mediaUrl = (url: string) => (url.startsWith("/") ? `${API_URL}${url}` : url)

/** Article complet par slug (corps compris) ; null si absent, brouillon ou API injoignable. */
export async function fetchArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/articles/${encodeURIComponent(slug)}`)
    if (!res.ok) return null
    return (await res.json()) as Article
  } catch {
    return null
  }
}

export async function apiPost(path: string, body: unknown): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
}

export interface CvUpload {
  objectKey: string
  url: string
  filename: string
}

export async function uploadCv(file: File): Promise<CvUpload> {
  const data = new FormData()
  data.append("file", file)
  const res = await fetch(`${API_URL}/api/public/cv`, { method: "POST", body: data })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return (await res.json()) as CvUpload
}
