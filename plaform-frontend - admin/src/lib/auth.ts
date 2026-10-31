/** Session de l'administrateur : contexte et accès (`useAuth`). Le fournisseur est dans `auth-provider.tsx`. */
import { createContext, useContext } from "react"

export interface AuthState {
  ready: boolean
  authenticated: boolean
  isAdmin: boolean
  username: string
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthState>({
  ready: true,
  authenticated: false,
  isAdmin: false,
  username: "",
  login: () => Promise.resolve(),
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)
