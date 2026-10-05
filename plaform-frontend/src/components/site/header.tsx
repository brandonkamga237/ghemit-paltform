import { useEffect, useState } from "react"
import { Link, NavLink, useLocation } from "react-router"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { usePrograms } from "@/data/remote"
import { Button } from "@/components/ui/button"
import logoUrl from "@/assets/logo-gehmit.webp"

const navItems = [
  { label: "Accueil", to: "/" },
  { label: "À propos", to: "/a-propos" },
  { label: "Programmes", to: "/programmes", dropdown: true },
  { label: "Solutions", to: "/solutions" },
  { label: "Notre impact", to: "/notre-impact" },
  { label: "Événements", to: "/evenements" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    "transition-colors duration-150 hover:text-gehmit",
    isActive &&
      "border-b-2 border-gehmit pb-[3px] font-semibold text-gehmit"
  )
}

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
    const onScroll = () => setScrolled(window.scrollY > 400)
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

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-sand bg-surface"
        onMouseLeave={() => setMenuOpen(false)}
      >
        <div
          className={cn(
            "mx-auto flex max-w-[1240px] items-center justify-between px-5 transition-all duration-200 sm:px-10",
            scrolled ? "h-16" : "h-[88px]"
          )}
        >
          <div className="flex items-center gap-9 xl:gap-11">
            <Link to="/" aria-label="Gehmit — accueil">
              <img
                src={logoUrl}
                alt="Gehmit"
                width={472}
                height={192}
                className={cn(
                  "w-auto transition-all duration-200",
                  scrolled ? "h-10" : "h-12"
                )}
              />
            </Link>
            <nav className="hidden items-center gap-6 text-[15px] font-medium whitespace-nowrap lg:flex xl:gap-7">
              {navItems.map((item) =>
                item.dropdown ? (
                  <span key={item.to} className="relative">
                    <NavLink
                      to={item.to}
                      onMouseEnter={() => setMenuOpen(true)}
                      onClick={() => setMenuOpen((v) => !v)}
                      className={({ isActive }) =>
                        cn(
                          navLinkClass({ isActive: isActive || menuOpen }),
                          "inline-flex items-center gap-1.5"
                        )
                      }
                    >
                      {item.label}
                      <ChevronDownIcon
                        className={cn(
                          "size-3 transition-transform duration-200",
                          menuOpen && "rotate-180"
                        )}
                      />
                    </NavLink>
                  </span>
                ) : (
                  <NavLink key={item.to} to={item.to} className={navLinkClass} end={item.to === "/"}>
                    {item.label}
                  </NavLink>
                )
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4 whitespace-nowrap">
            <Button
              render={<Link to="/don" />}
              className="hidden h-11 rounded-md bg-gold px-5 text-[15px] font-semibold text-navy hover:bg-gold-hover sm:inline-flex"
            >
              Faire un don
            </Button>
            <button
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-md transition-colors lg:hidden",
                mobileOpen ? "text-surface" : "text-navy"
              )}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileOpen ? <XIcon className="size-6" /> : <MenuIcon className="size-6" />}
            </button>
          </div>
        </div>

        {/* Méga-menu Programmes */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-x-0 top-full hidden border-b border-sand-dark bg-cream shadow-[0_4px_16px_rgba(0,0,0,0.12)] lg:block"
            >
              <div className="mx-auto grid max-w-[1240px] grid-cols-5 gap-6 px-10 pt-7 pb-9">
                {programs.map((p) => (
                  <Link
                    key={p.slug}
                    to={p.slug === "formations" ? "/formations" : `/programmes/${p.slug}`}
                    className="group flex flex-col gap-1.5"
                  >
                    <span className="flex items-center gap-2 text-[17px] font-semibold text-navy transition-colors group-hover:text-gehmit">
                      {p.name}
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          p.status === "open" && "bg-gehmit",
                          p.status === "soon" && "bg-soon-border",
                          p.status === "closed" && "bg-ink-faint"
                        )}
                      />
                    </span>
                    <span className="text-[14.5px] leading-normal text-ink-muted">
                      {p.cardDescription}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Menu mobile plein écran — index numéroté sur navy */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 flex flex-col bg-navy pt-[88px] lg:hidden"
          >
            <nav className="flex flex-col overflow-y-auto px-6 py-4">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-baseline gap-4 border-b border-white/10 py-[15px]",
                        isActive ? "text-gold" : "text-surface"
                      )
                    }
                  >
                    <span className="tnum w-7 font-mono text-[11.5px] tracking-[0.1em] text-surface/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-heading text-[26px] font-semibold">
                      {item.label}
                    </span>
                  </NavLink>
                  {item.dropdown ? (
                    <div className="grid grid-cols-2 gap-x-4 border-b border-white/10 pt-1 pb-3 pl-11">
                      {programs.map((p) => (
                        <Link
                          key={p.slug}
                          to={p.slug === "formations" ? "/formations" : `/programmes/${p.slug}`}
                          className="py-2 text-[14.5px] font-medium text-surface/65"
                        >
                          {p.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-4 p-5 pb-6">
              <a
                href="mailto:info.gehmit@gmail.com"
                className="font-mono text-[12.5px] tracking-[0.06em] text-surface/50"
              >
                info.gehmit@gmail.com
              </a>
              <Button
                render={<Link to="/don" />}
                className="h-12 w-full rounded-md bg-gold text-base font-semibold text-navy hover:bg-gold-hover"
              >
                Faire un don
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barre de don persistante — mobile */}
      {!mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-dark bg-surface/95 p-3 backdrop-blur-sm sm:hidden">
          <Button
            render={<Link to="/don" />}
            className="h-12 w-full rounded-md bg-gold text-[15px] font-semibold text-navy hover:bg-gold-hover"
          >
            Faire un don
          </Button>
        </div>
      )}
    </>
  )
}
