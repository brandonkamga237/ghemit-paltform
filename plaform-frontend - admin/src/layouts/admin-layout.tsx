import { useEffect, useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router"
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  FolderOpenIcon,
  GraduationCapIcon,
  HandshakeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MailIcon,
  MenuIcon,
  MessageSquareIcon,
  NewspaperIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import type { CandidaturesSummary, MessagesSummary } from "@/lib/types"
import logoUrl from "@/assets/logo-gehmit-blanc.webp"

const PUBLIC_SITE = "https://gehmit.org"

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  count?: "candidatures" | "messages"
}

const groups: { title?: string; items: NavItem[] }[] = [
  { items: [{ to: "/", label: "Tableau de bord", icon: LayoutDashboardIcon }] },
  {
    title: "Publier",
    items: [
      { to: "/articles", label: "Articles", icon: NewspaperIcon },
      { to: "/evenements", label: "Événements", icon: CalendarDaysIcon },
      { to: "/formations", label: "Formations", icon: BookOpenIcon },
      { to: "/programmes", label: "Programmes", icon: GraduationCapIcon },
      { to: "/partenaires", label: "Partenaires", icon: HandshakeIcon },
      { to: "/medias", label: "Médiathèque", icon: FolderOpenIcon },
    ],
  },
  {
    title: "Relations",
    items: [
      { to: "/candidatures", label: "Candidatures", icon: InboxIcon, count: "candidatures" },
      { to: "/messages", label: "Messages", icon: MessageSquareIcon, count: "messages" },
      { to: "/newsletter", label: "Newsletter", icon: MailIcon },
    ],
  },
]

/** Non-lus de la boîte de réception, rafraîchis toutes les minutes. */
function useUnread() {
  const [unread, setUnread] = useState<{ candidatures: number; messages: number }>({
    candidatures: 0,
    messages: 0,
  })
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const [c, m] = await Promise.all([
          api.get<CandidaturesSummary>("/api/admin/candidatures/summary"),
          api.get<MessagesSummary>("/api/admin/messages/summary"),
        ])
        if (alive) setUnread({ candidatures: c.unread, messages: m.unread })
      } catch {
        // compteurs facultatifs : la navigation reste utilisable
      }
    }
    void load()
    const id = window.setInterval(load, 60_000)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [])
  return unread
}

function Nav({ unread }: { unread: { candidatures: number; messages: number } }) {
  return (
    <nav className="flex flex-col gap-group" aria-label="Administration">
      {groups.map((g, gi) => (
        <div key={gi} className="flex flex-col gap-0.5">
          {g.title && (
            <span className="px-3 pb-2 font-heading text-caption text-gold italic">{g.title}</span>
          )}
          {g.items.map((item) => {
            const count = item.count ? unread[item.count] : 0
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "group relative flex h-10 items-center gap-3 rounded-sm px-3 text-small transition-colors",
                    isActive
                      ? "bg-white/[0.07] font-semibold text-surface before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-gold"
                      : "text-surface/65 hover:bg-white/[0.04] hover:text-surface"
                  )
                }
              >
                <item.icon className="size-[17px] shrink-0" strokeWidth={1.75} />
                <span className="flex-1">{item.label}</span>
                {count > 0 && (
                  <span className="tnum min-w-6 rounded-sm bg-gold px-1.5 text-center text-caption leading-5 font-semibold text-navy-deep">
                    {count}
                  </span>
                )}
              </NavLink>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

function SidebarFooter() {
  const { username, logout } = useAuth()
  return (
    <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
      <a
        href={PUBLIC_SITE}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 text-small text-surface/65 transition-colors hover:text-surface"
      >
        Voir le site
        <ArrowUpRightIcon className="size-3.5" />
      </a>
      <div className="flex items-center justify-between gap-2 px-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gehmit text-caption font-semibold text-surface uppercase"
          >
            {(username ?? "?").slice(0, 1)}
          </span>
          <span className="truncate text-small text-surface/85">{username}</span>
        </span>
        <button
          type="button"
          onClick={logout}
          aria-label="Se déconnecter"
          title="Se déconnecter"
          className="inline-flex size-8 items-center justify-center rounded-sm text-surface/60 transition-colors hover:bg-white/[0.06] hover:text-surface"
        >
          <LogOutIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const unread = useUnread()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Fermer le tiroir mobile à chaque navigation.
  const [prev, setPrev] = useState(pathname)
  if (prev !== pathname) {
    setPrev(pathname)
    setOpen(false)
  }

  return (
    <div className="flex min-h-svh bg-cream">
      {/* Barre latérale — grand écran */}
      <aside className="sticky top-0 hidden h-svh w-[248px] shrink-0 flex-col gap-group overflow-y-auto bg-navy-deep px-3 py-6 lg:flex">
        <div className="flex flex-col gap-1 px-3">
          <img src={logoUrl} alt="Gehmit" width={472} height={192} className="h-9 w-auto self-start" />
          <span className="text-caption text-surface/50">Administration</span>
        </div>
        <div className="flex-1">
          <Nav unread={unread} />
        </div>
        <SidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre du haut — mobile */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-navy-deep px-4 lg:hidden">
          <img src={logoUrl} alt="Gehmit" width={472} height={192} className="h-7 w-auto" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className="inline-flex size-10 items-center justify-center text-surface"
          >
            <MenuIcon className="size-5" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-page flex-1 px-gutter py-block">
          <Outlet />
        </main>
      </div>

      {/* Tiroir mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-navy-deep/60"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-[280px] flex-col gap-group overflow-y-auto bg-navy-deep px-3 py-5">
            <div className="flex items-center justify-between px-3">
              <img src={logoUrl} alt="Gehmit" width={472} height={192} className="h-8 w-auto" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="inline-flex size-9 items-center justify-center text-surface"
              >
                <XIcon className="size-5" />
              </button>
            </div>
            <div className="flex-1">
              <Nav unread={unread} />
            </div>
            <SidebarFooter />
          </aside>
        </div>
      )}
    </div>
  )
}
