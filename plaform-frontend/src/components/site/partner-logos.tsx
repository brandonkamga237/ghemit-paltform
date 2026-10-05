import { usePartners } from "@/data/remote"
import { mediaUrl } from "@/lib/api"
import { Container } from "@/components/site/bands"

/** Bandeau des partenaires (administrés en back office). Masqué s'il n'y en a aucun. */
export function PartnerLogos({ title }: { title: string }) {
  const partners = usePartners()
  if (partners.length === 0) return null
  return (
    <section className="border-t border-sand bg-surface">
      <Container className="flex flex-col gap-6 py-12">
        <span className="mono-label">{title}</span>
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((p) => (
            <li
              key={p.name}
              title={p.description ?? p.name}
              className="flex h-[72px] items-center justify-center overflow-hidden rounded-lg border border-sand bg-cream px-3"
            >
              {p.logoUrl ? (
                <img
                  src={`${mediaUrl(p.logoUrl)}?w=320`}
                  alt={p.name}
                  width={160}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="max-h-14 w-auto object-contain"
                />
              ) : (
                <span className="text-center text-[14px] font-semibold text-navy">{p.name}</span>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
