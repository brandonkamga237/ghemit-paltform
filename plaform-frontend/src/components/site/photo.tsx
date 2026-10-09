import { cn } from "@/lib/cn"
import { photoCaptions, staticPhoto, type PhotoName } from "@/data/photos"
import { imageSrcSet } from "@/lib/api"


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
            "font-mono text-caption",
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

/**
 * Photo légendée : l'image et son contexte (événement, lieu, date).
 * `frameClassName` fixe le cadrage (hauteur, ratio) ; `position` règle le
 * point focal pour garder les visages dans le cadre.
 */
export function Figure({
  photo,
  alt,
  caption,
  className,
  frameClassName,
  position,
  sizes,
  priority,
  tone = "light",
}: {
  photo: PhotoName
  alt: string
  caption?: string
  className?: string
  frameClassName?: string
  position?: string
  sizes?: string
  priority?: boolean
  tone?: "light" | "dark"
}) {
  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <div className={cn("overflow-hidden bg-sand", frameClassName)} style={position ? { ["--pos" as string]: position } : undefined}>
        <Photo
          photo={photo}
          alt={alt}
          sizes={sizes}
          priority={priority}
          className={cn(position && "[object-position:var(--pos)]")}
        />
      </div>
      <figcaption
        className={cn(
          "text-caption",
          tone === "dark" ? "text-surface/60" : "text-ink-muted"
        )}
      >
        {caption ?? photoCaptions[photo]}
      </figcaption>
    </figure>
  )
}
