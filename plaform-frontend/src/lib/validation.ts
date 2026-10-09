/** Contrôle minimal d'une adresse e-mail (le serveur reste juge). */
export const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v)
