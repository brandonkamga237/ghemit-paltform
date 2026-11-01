import { useEffect, useEffectEvent, useState } from "react"

interface State<T> {
  /** Clé de la requête dont `data` / `error` sont le résultat. */
  key: string | null
  data: T | undefined
  error: string | null
}

const message = (e: unknown) => (e instanceof Error ? e.message : "Erreur de chargement")

/**
 * Charge une ressource de l'API et la recharge quand `deps` change.
 *
 * - `loading` est déduit (la dernière réponse ne correspond pas encore aux
 *   `deps` courants) : aucun `setState` synchrone dans l'effet.
 * - Les données précédentes restent affichées pendant un rechargement.
 * - Une réponse arrivée après un changement de `deps` est ignorée.
 * - `setData` applique une mise à jour locale (après une mutation) sans recharger.
 *
 * `deps` doit être sérialisable (chaînes, nombres, booléens).
 */
export function useResource<T>(
  load: () => Promise<T>,
  deps: readonly unknown[],
  options: { enabled?: boolean; onError?: (message: string) => void } = {}
) {
  const { enabled = true } = options
  const [nonce, setNonce] = useState(0)
  const [state, setState] = useState<State<T>>({ key: null, data: undefined, error: null })
  const key = enabled ? `${JSON.stringify(deps)}#${nonce}` : null

  const run = useEffectEvent((k: string) => {
    let cancelled = false
    load().then(
      (data) => {
        if (!cancelled) setState({ key: k, data, error: null })
      },
      (e: unknown) => {
        if (cancelled) return
        setState((s) => ({ key: k, data: s.data, error: message(e) }))
        options.onError?.(message(e))
      }
    )
    return () => {
      cancelled = true
    }
  })

  useEffect(() => {
    if (key !== null) return run(key)
  }, [key])

  return {
    data: state.data,
    error: state.error,
    loading: key !== null && state.key !== key,
    /** Relance la requête (après une mutation côté serveur). */
    reload: () => setNonce((n) => n + 1),
    /** Mise à jour locale des données déjà chargées. */
    setData: (update: (data: T | undefined) => T | undefined) => setState((s) => ({ ...s, data: update(s.data) })),
  }
}
