import { cn } from "cn"

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
}: {
  label?: string
  src?: string
  alt?: string
  className?: string
  captionClassName?: string
  dark?: boolean
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
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
