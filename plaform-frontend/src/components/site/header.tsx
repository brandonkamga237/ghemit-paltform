import { useEffect, useState } from "react"
import { Link, NavLink, useLocation } from "react-router"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/cn"
import { contact } from "@/data/content"
import { usePrograms } from "@/data/remote"
import { forCompanies, parcours, programStatus } from "@/data/parcours"
import { StatusDot } from "@/components/site/status-pill"
import logoUrl from "@/assets/logo-gehmit.webp"

/** Navigation validée dans le document de refonte (août 2026). */
const navItems = [
  { label: "Accueil", to: "/" },
  { label: "À propos", to: "/a-propos" },
  { label: "Programmes", to: "/programmes", menu: true },
  { label: "Solutions", to: "/solutions" },
  { label: "Notre impact", to: "/notre-impact" },
  { label: "Événements", to: "/evenements" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
]

/** Routes rattachées à « Programmes » pour l'état actif du menu. */
const programRoutes = ["/programmes", "/formations", "/caravanes", "/junior-builders", "/rencontre-challenge", "/candidature"]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const programs = usePrograms()

  // Fermer les menus à chaque navigation (ajustement pendant le rendu).
  const [prevPath, setPrevPath] = useState(location.pathname)
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname)
    setMenuOpen(false)
    setMobileOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [menuOpen])

  const inPrograms = programRoutes.some((r) => location.pathname.startsWith(r))

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 bg-cream/95 backdrop-blur-sm transition-shadow duration-200",
          (scrolled || menuOpen) && "shadow-[0_1px_0_var(--color-sand-dark)]"
        )}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <div className="mx-auto flex h-[72px] max-w-page items-center justify-between gap-group px-gutter">
          <Link to="/" aria-label="Gehmit — accueil" className="shrink-0">
            <img src={logoUrl} alt="Gehmit" width={472} height={192} className="h-10 w-auto" />
          </Link>

          <nav className="hidden items-center lg:flex" aria-label="Navigation principale">
            {navItems.map((item) =>
              item.menu ? (
                <span key={item.to} className="relative flex items-center" onMouseEnter={() => setMenuOpen(true)}>
                  <NavLink
                    to={item.to}
                    className={cn(navCls, inPrograms && activeCls, "pr-1")}
                  >
                    {item.label}
                  </NavLink>
                  <button
                    type="button"
                    aria-expanded={menuOpen}
                    aria-label="Afficher les programmes"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="inline-flex h-10 items-center pr-3 text-navy hover:text-gehmit"
                  >
                    <ChevronDownIcon className={cn("size-3.5 transition-transform duration-200", menuOpen && "rotate-180")} />
                  </button>
                </span>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onMouseEnter={() => setMenuOpen(false)}
                  className={({ isActive }) => cn(navCls, isActive && activeCls)}
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              to="/don"
              className="inline-flex h-10 items-center rounded-sm bg-gold px-4 text-small font-semibold whitespace-nowrap text-navy transition-colors hover:bg-gold-hover active:bg-gold-active sm:px-5"
            >
              Faire un don
            </Link>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center text-navy lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <MenuIcon className="size-6" />
            </button>
          </div>
        </div>

        {/* Menu Programmes : l'offre rangée sur le parcours */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute inset-x-0 top-full hidden border-t border-sand bg-surface shadow-[0_16px_32px_-16px_rgba(30,45,74,0.3)] lg:block"
            >
              <div className="mx-auto grid max-w-page grid-cols-[230px_1fr] gap-block px-gutter py-block">
                <div className="flex flex-col gap-4 border-r border-sand pr-10">
                  <p className="font-heading text-h3 text-navy">
                    De l'orientation à l'emploi, <span className="accent-word">quatre étapes</span>.
                  </p>
                  <Link to="/programmes" className="text-small font-semibold text-gehmit hover:underline">
                    Tout le parcours →
                  </Link>
                </div>
                <div className="flex flex-col gap-group">
                  <div className="grid grid-cols-4 gap-group">
                    {parcours.map((stage, i) => (
                      <div key={stage.id} className="flex flex-col gap-3.5">
                        <span className="flex items-baseline gap-2 border-b border-sand pb-2.5 text-navy">
                          <span className="tnum text-caption font-semibold text-gold">{i + 1}</span>
                          <span className="font-heading text-lead italic">{stage.verb}</span>
                        </span>
                        <ul className="flex flex-col gap-3">
                          {stage.offers.map((o) => {
                            const st = programStatus(programs, o.programSlug)
                            return (
                              <li key={o.name}>
                                <Link to={o.to} className="group flex flex-col gap-0.5">
                                  <span className="flex items-center gap-2 text-small font-semibold text-navy transition-colors group-hover:text-gehmit">
                                    {o.name}
                                    {st && st.status !== "archived" && <StatusDot status={st.status} />}
                                  </span>
                                  <span className="text-caption text-ink-muted">{o.line}</span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-group border-t border-sand pt-4 text-small">
                    <span className="font-semibold text-navy">Vous êtes une entreprise ?</span>
                    {forCompanies.slice(0, 3).map((o) => (
                      <Link key={o.name} to={o.to} className="text-ink-muted transition-colors hover:text-gehmit">
                        {o.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Menu mobile plein écran */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-navy text-surface lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
              <span className="font-heading text-h3 font-semibold">Gehmit</span>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center"
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer le menu"
              >
                <XIcon className="size-6" />
              </button>
            </div>

            <nav className="flex flex-col px-5 pb-8" aria-label="Navigation principale">
              {navItems.map((item) => (
                <div key={item.to} className="border-t border-white/10">
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn("block py-3.5 font-heading text-h3", isActive ? "text-gold" : "text-surface")
                    }
                  >
                    {item.label}
                  </NavLink>
                  {item.menu && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 pb-5">
                      {parcours.map((stage) => (
                        <div key={stage.id} className="flex flex-col gap-1">
                          <span className="text-caption text-gold italic">{stage.verb}</span>
                          {stage.offers.map((o) => (
                            <Link key={o.name} to={o.to} className="py-1 text-small text-surface/85">
                              {o.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3 border-t border-white/10 p-5">
              <a href={`mailto:${contact.email}`} className="text-small text-surface/60">
                {contact.email}
              </a>
              <Link
                to="/don"
                className="flex h-12 items-center justify-center rounded-sm bg-gold text-body font-semibold text-navy"
              >
                Faire un don
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

const navCls =
  "relative inline-flex h-10 items-center px-3 text-small font-medium whitespace-nowrap text-navy transition-colors hover:text-gehmit xl:px-3.5"
const activeCls =
  "text-gehmit after:absolute after:inset-x-3 after:-bottom-[15px] after:h-0.5 after:bg-gehmit"
