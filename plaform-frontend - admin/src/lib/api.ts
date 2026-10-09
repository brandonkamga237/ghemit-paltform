import { getAccessToken, logoutTokens } from "./token"

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080"

/** Adresse affichable d'un média : les URL relatives de la médiathèque passent par l'API. */
export const mediaSrc = (url: string) => (url.startsWith("/") ? `${API_URL}${url}` : url)

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken()
  if (!token) {
    logoutTokens()
    window.location.reload()
    throw new Error("Session expirée")
  }
  const isForm = init?.body instanceof FormData
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  })
  if (res.status === 401) {
    logoutTokens()
    window.location.reload()
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`${res.status} ${text}`.trim())
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  del: (path: string) => request<void>(path, { method: "DELETE" }),
}

/** Ouvre un CV de candidature : téléchargement authentifié, jamais via une URL publique. */
export async function openCv(cvUrl: string) {
  const key = cvUrl.replace(/^.*\/cv\//, "")
  const token = await getAccessToken()
  const res = await fetch(`${API_URL}/api/admin/media/cv/${key}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`CV introuvable (${res.status})`)
  const url = URL.createObjectURL(await res.blob())
  window.open(url, "_blank", "noopener")
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
