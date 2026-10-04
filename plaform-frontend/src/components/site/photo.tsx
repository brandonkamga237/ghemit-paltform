import { cn } from "cn"

const DEFAULT_WIDTHS = [320, 640, 960, 1280, 1920]

/** Génère un attribut `srcset` avec des variantes redimensionnées. */
export function imageSrcSet(src: string, widths = DEFAULT_WIDTHS): string {
  return widths.map((w) => `${src}?w=${w} ${w}w`).join(", ")
}

/**
 * Emplacement photo. Remplacer `label` par une vraie image :
 * <Photo src="/images/..." alt="..." /> rend une <img> couvrante.
 */
export function Photo({
  label,
  src,
  alt = "",
  className,
  captionClassName,
  dark = false,
  priority = false,
  sizes = "100vw",
}: {
  label?: string
  src?: string
  alt?: string
  className?: string
  captionClassName?: string
  dark?: boolean
  priority?: boolean
  sizes?: string
}) {
  if (src) {
    return (
      <img
        src={src}
        srcSet={imageSrcSet(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
        className={cn("h-full w-full object-cover", className)}
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
