import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { initKeycloak, keycloak } from "./keycloak"

interface AuthState {
  ready: boolean
  authenticated: boolean
  isAdmin: boolean
  username: string
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  ready: false,
  authenticated: false,
  isAdmin: false,
  username: "",
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    ready: false,
    authenticated: false,
    isAdmin: false,
    username: "",
    logout: () => keycloak.logout({ redirectUri: window.location.origin }),
  })

  useEffect(() => {
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => keycloak.login())
    }
    initKeycloak()
      .then((authenticated) =>
        setState((s) => ({
          ...s,
          ready: true,
          authenticated,
          isAdmin: keycloak.hasRealmRole("admin"),
          username:
            (keycloak.tokenParsed?.preferred_username as string | undefined) ?? "",
        }))
      )
      .catch(() => setState((s) => ({ ...s, ready: true })))
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
