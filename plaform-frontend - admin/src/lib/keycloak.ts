import Keycloak from "keycloak-js"

export const keycloak = new Keycloak({
  url: (import.meta.env.VITE_KEYCLOAK_URL as string | undefined) ?? "http://localhost:8180",
  realm: (import.meta.env.VITE_KEYCLOAK_REALM as string | undefined) ?? "gehmit",
  clientId: (import.meta.env.VITE_KEYCLOAK_CLIENT as string | undefined) ?? "admin-frontend",
})

// Dedoublonne l'appel à init (StrictMode monte les effets deux fois)
let initPromise: Promise<boolean> | null = null

export function initKeycloak(): Promise<boolean> {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: "login-required",
      pkceMethod: "S256",
      checkLoginIframe: false,
    })
  }
  return initPromise
}
