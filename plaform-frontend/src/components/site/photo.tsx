import { cn } from "cn"
import { staticPhoto, type PhotoName } from "@/data/photos"

const DEFAULT_WIDTHS = [320, 640, 960, 1280, 1920]

/** `srcset` d'une image de la médiathèque, redimensionnée par l'API (`?w=`). */
export function imageSrcSet(src: string, widths = DEFAULT_WIDTHS): string {
  return widths.map((w) => `${src}?w=${w} ${w}w`).join(", ")
}

/**
 * Image couvrante.
 * - `photo` : photo institutionnelle embarquée (AVIF/WebP, dimensions connues).
 * - `src` : image dynamique de la médiathèque (articles, partenaires…).
 * - sinon : emplacement neutre avec `label`.
 */
export function Photo({
  label,
  photo,
  src,
  alt = "",
  className,
  captionClassName,
  dark = false,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  label?: string
  photo?: PhotoName
  src?: string
  alt?: string
  className?: string
  captionClassName?: string
  dark?: boolean
  priority?: boolean
  sizes?: string
}) {
  const loading = priority ? "eager" : "lazy"
  const fetchPriority = priority ? "high" : "auto"
  const imgClass = cn("h-full w-full object-cover", className)

  if (photo) {
    const p = staticPhoto(photo)
    return (
      <picture className="contents">
        <source type="image/avif" srcSet={p.avif} sizes={sizes} />
        <source type="image/webp" srcSet={p.webp} sizes={sizes} />
        <img
          src={p.fallback}
          width={p.width}
          height={p.height}
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          className={imgClass}
        />
      </picture>
    )
  }
  if (src) {
    return (
      <img
        src={src}
        srcSet={imageSrcSet(src)}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        className={imgClass}
      />
    )
  }
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex items-end p-4",
        dark ? "bg-navy-light" : "bg-sand",
        className
      )}
    >
      {label ? (
        <span
          className={cn(
            "font-mono text-[11px] leading-relaxed",
            dark ? "text-surface/60" : "text-sand-text",
            captionClassName
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  )
}
