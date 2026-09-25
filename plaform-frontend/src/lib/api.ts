import type {
  Achievement,
  Article,
  ContactInfo,
  FaqItem,
  Formation,
  Partner,
  Program,
} from "@/data/content"

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080"

export interface RemoteContent {
  programs?: Program[]
  formations?: Formation[]
  calendarRows?: { name: string; months: string[]; tone: "gehmit" | "soon" }[]
  articles?: Article[]
  blogCategories?: string[]
  faq?: FaqItem[]
  partners?: (Partner | string)[]
  stats?: { value: string; label: string; gold?: boolean }[]
  achievements?: Achievement[]
  contact?: Partial<ContactInfo>
  pageTexts?: Record<string, string>
}

export async function fetchRemoteContent(timeoutMs = 3500): Promise<RemoteContent | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_URL}/api/public/content`, { signal: ctrl.signal })
    if (!res.ok) return null
    return (await res.json()) as RemoteContent
  } catch {
    return null
  } finally {
    clearTimeout(timer)
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
