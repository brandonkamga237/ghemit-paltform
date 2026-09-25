/**
 * Authentification « formulaire maison » au-dessus des endpoints OIDC de Keycloak
 * (grant password + refresh_token). Remplace keycloak-js : plus de redirection
 * vers la page de login hébergée, tout se passe dans l'app.
 */

export const KC_URL: string =
  (import.meta.env.VITE_KEYCLOAK_URL as string | undefined) ?? "http://localhost:8180"
export const KC_REALM: string =
  (import.meta.env.VITE_KEYCLOAK_REALM as string | undefined) ?? "gehmit"
export const KC_CLIENT: string =
  (import.meta.env.VITE_KEYCLOAK_CLIENT as string | undefined) ?? "admin-frontend"

const TOKEN_URL = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`
const STORAGE_KEY = "gehmit.admin.tokens"

interface TokenSet {
  access_token: string
  refresh_token: string
  /** Timestamp (ms) d'expiration du access token. */
  access_expires_at: number
  /** Timestamp (ms) d'expiration du refresh token. */
  refresh_expires_at: number
}

interface JwtPayload {
  preferred_username?: string
  realm_access?: { roles?: string[] }
}

let tokens: TokenSet | null = loadTokens()

function loadTokens(): TokenSet | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TokenSet) : null
  } catch {
    return null
  }
}

function saveTokens(t: TokenSet | null) {
  tokens = t
  if (t) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(t))
  else sessionStorage.removeItem(STORAGE_KEY)
}

async function grant(body: URLSearchParams): Promise<TokenSet> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(err?.error ?? `Keycloak ${res.status}`)
  }
  const data = (await res.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
    refresh_expires_in: number
  }
  const now = Date.now()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    access_expires_at: now + data.expires_in * 1000,
    refresh_expires_at: now + data.refresh_expires_in * 1000,
  }
}

/** Connexion via grant « password ». Lève une erreur « invalid_grant » si identifiants faux. */
export async function loginWithPassword(username: string, password: string): Promise<void> {
  const t = await grant(
    new URLSearchParams({
      grant_type: "password",
      client_id: KC_CLIENT,
      username,
      password,
      scope: "openid",
    })
  )
  saveTokens(t)
}

/** Déconnexion locale (le grant password ne crée pas de session SSO navigateur). */
export function logoutTokens() {
  saveTokens(null)
}

function decodeJwt(token: string): JwtPayload {
  const payload = token.split(".")[1]
  // Décodage base64url compatible Unicode
  const json = decodeURIComponent(
    atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  )
  return JSON.parse(json) as JwtPayload
}

/** Infos extraites du access token (null si absent). */
export function currentUser(): { username: string; isAdmin: boolean } | null {
  if (!tokens) return null
  const p = decodeJwt(tokens.access_token)
  return {
    username: p.preferred_username ?? "",
    isAdmin: p.realm_access?.roles?.includes("admin") ?? false,
  }
}

/** True si on a un refresh token encore valide (session restaurable). */
export function hasSession(): boolean {
  return !!tokens && tokens.refresh_expires_at > Date.now()
}

let refreshing: Promise<void> | null = null

/** Les appels API : retourne un access token valide (refresh si besoin), ou null. */
export async function getAccessToken(): Promise<string | null> {
  if (!tokens) return null
  if (tokens.access_expires_at - Date.now() > 15_000) return tokens.access_token
  if (tokens.refresh_expires_at <= Date.now()) {
    saveTokens(null)
    return null
  }
  refreshing ??= grant(
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: KC_CLIENT,
      refresh_token: tokens.refresh_token,
    })
  )
    .then(saveTokens)
    .catch(() => saveTokens(null))
    .finally(() => {
      refreshing = null
    })
  await refreshing
  return tokens?.access_token ?? null
}
