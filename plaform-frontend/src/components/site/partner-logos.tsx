import { usePartners } from "@/data/remote"
import { mediaUrl } from "@/lib/api"
import { Container } from "@/components/site/bands"

/** Bandeau des partenaires (administrés en back office). Masqué s'il n'y en a aucun. */
export function PartnerLogos({ title }: { title: string }) {
  const partners = usePartners()
  if (partners.length === 0) return null
  return (
    <section className="bg-surface">
      <Container className="flex flex-col gap-group py-block">
        <h2 className="text-small font-semibold text-ink-muted">{title}</h2>
        <ul className="grid grid-cols-2 gap-px bg-sand sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((p) => (
            <li
              key={p.name}
              title={p.description ?? p.name}
              className="flex h-24 items-center justify-center bg-surface px-4"
            >
              {p.logoUrl ? (
                <img
                  src={`${mediaUrl(p.logoUrl)}?w=320`}
                  alt={p.name}
                  width={160}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="max-h-12 w-auto object-contain opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                />
              ) : (
                <span className="text-center font-heading text-body font-semibold text-navy">{p.name}</span>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
