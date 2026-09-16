import { useEffect } from "react"
import { Outlet, useLocation } from "react-router"
import { AnimatePresence, motion } from "motion/react"
import { Header } from "@/components/site/header"
import { Footer } from "@/components/site/footer"

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
    <header className="sticky top-0 z-40 border-b border-sand bg-surface">
      <div className="mx-auto flex h-[88px] max-w-[1240px] items-center justify-between px-5 sm:px-10">
        <a href="/" className="font-heading text-[28px] font-bold text-gehmit">
          Gehmit
        </a>
        <div className="flex items-center gap-4 text-[15px] text-ink-muted">
          <span className="hidden sm:inline">Besoin d'aide ?</span>
          <a href="/contact" className="font-semibold text-gehmit hover:underline">
            Nous écrire
          </a>
        </div>
      </div>
    </header>
  )
}

export function SiteLayout() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          className="flex-1 pb-16 sm:pb-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  )
}

export function FormLayout() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <SlimHeader />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          className="flex-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
