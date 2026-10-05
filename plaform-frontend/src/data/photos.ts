import dimensions from "@/assets/photos/photos.json"

/**
 * Photos institutionnelles embarquées dans le build (générées par
 * scripts/optimize-photos.sh). Vite les sert avec un nom haché : cache
 * navigateur illimité, aucune requête vers l'API.
 */
export type PhotoName = keyof typeof dimensions

const files = import.meta.glob<string>("@/assets/photos/*.{avif,webp}", {
  eager: true,
  import: "default",
  query: "?url",
})

export interface StaticPhoto {
  avif: string
  webp: string
  fallback: string
  width: number
  height: number
}

function srcSet(name: string, ext: "avif" | "webp") {
  return Object.entries(files)
    .map(([path, url]) => {
      const m = path.match(new RegExp(`/${name}-(\\d+)\\.${ext}$`))
      return m ? { w: Number(m[1]), url } : null
    })
    .filter((v): v is { w: number; url: string } => v !== null)
    .sort((a, b) => a.w - b.w)
}

export function staticPhoto(name: PhotoName): StaticPhoto {
  const webp = srcSet(name, "webp")
  const toAttr = (list: { w: number; url: string }[]) =>
    list.map((v) => `${v.url} ${v.w}w`).join(", ")
  return {
    avif: toAttr(srcSet(name, "avif")),
    webp: toAttr(webp),
    fallback: webp[Math.min(1, webp.length - 1)]?.url ?? "",
    ...dimensions[name],
  }
}
