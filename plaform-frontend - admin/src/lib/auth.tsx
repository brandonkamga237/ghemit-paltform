import { createContext, useContext, useState, type ReactNode } from "react"
import { currentUser, hasSession, loginWithPassword, logoutTokens } from "./token"

interface AuthState {
  ready: boolean
  authenticated: boolean
  isAdmin: boolean
  username: string
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  ready: true,
  authenticated: false,
  isAdmin: false,
  username: "",
  login: () => Promise.resolve(),
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Session restaurée si un refresh token valide est en sessionStorage.
  const initial = hasSession() ? currentUser() : null
  const [session, setSession] = useState<{ username: string; isAdmin: boolean } | null>(initial)

  const login = async (username: string, password: string) => {
    await loginWithPassword(username, password)
    const u = currentUser()
    if (!u?.isAdmin) {
      logoutTokens()
      setSession(null)
      throw new Error("forbidden")
    }
    setSession(u)
  }

  const logout = () => {
    logoutTokens()
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        ready: true,
        authenticated: !!session,
        isAdmin: session?.isAdmin ?? false,
        username: session?.username ?? "",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
