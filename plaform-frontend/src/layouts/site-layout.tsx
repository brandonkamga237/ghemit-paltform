import { useEffect } from "react"
import { Link, Outlet, useLocation } from "react-router"
import { MotionConfig } from "motion/react"
import { Header } from "@/components/site/header"
import { Footer } from "@/components/site/footer"
import { WhatsAppButton } from "@/components/site/whatsapp-button"
import logoUrl from "@/assets/logo-gehmit.webp"

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [pathname])
  return null
}

/** En-tête réduit pour les parcours de formulaire. */
export function SlimHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-cream">
      <div className="mx-auto flex h-[72px] max-w-page items-center justify-between px-gutter">
        <Link to="/" aria-label="Gehmit — accueil">
          <img src={logoUrl} alt="Gehmit" width={472} height={192} className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-4 text-small text-ink-muted">
          <span className="hidden sm:inline">Besoin d'aide ?</span>
          <Link to="/contact" className="font-semibold text-gehmit hover:underline">
            Nous écrire
          </Link>
        </div>
      </div>
    </header>
  )
}

export function SiteLayout() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <ScrollToTop />
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </MotionConfig>
  )
}

export function FormLayout() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <ScrollToTop />
        <SlimHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </MotionConfig>
  )
}
