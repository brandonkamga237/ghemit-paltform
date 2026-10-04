import { NavLink, Outlet } from "react-router"
import {
  BarChart3Icon,
  CalendarDaysIcon,
  FileQuestionIcon,
  FileTextIcon,
  FolderOpenIcon,
  GraduationCapIcon,
  HandshakeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MailIcon,
  MessageSquareIcon,
  Settings2Icon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import logoUrl from "@/assets/logo-gehmit.webp"

const contentLinks = [
  { to: "/programmes", label: "Programmes", icon: GraduationCapIcon },
  { to: "/formations", label: "Formations", icon: FileTextIcon },
  { to: "/calendrier", label: "Calendrier", icon: CalendarDaysIcon },
  { to: "/articles", label: "Articles", icon: FileTextIcon },
  { to: "/faq", label: "FAQ", icon: FileQuestionIcon },
  { to: "/partenaires", label: "Partenaires", icon: HandshakeIcon },
  { to: "/statistiques", label: "Statistiques", icon: BarChart3Icon },
  { to: "/realisations", label: "Réalisations", icon: TrophyIcon },
  { to: "/reglages", label: "Réglages", icon: Settings2Icon },
]

const siteLinks = [
  { to: "/medias", label: "Médiathèque", icon: FolderOpenIcon },
  { to: "/newsletter", label: "Newsletter", icon: MailIcon },
  { to: "/candidatures", label: "Candidatures", icon: InboxIcon },
  { to: "/messages", label: "Messages", icon: MessageSquareIcon },
]

export function AdminLayout() {
  const { username, logout } = useAuth()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex flex-col gap-1.5 px-2 py-3">
            <img
              src={logoUrl}
              alt="Gehmit"
              width={472}
              height={192}
              className="h-10 w-auto self-start"
            />
            <span className="text-[13px] text-muted-foreground">
              Administration du site
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <NavLink to="/" end>
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive}>
                        <LayoutDashboardIcon />
                        <span>Tableau de bord</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Contenu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {contentLinks.map((l) => (
                  <SidebarMenuItem key={l.to}>
                    <NavLink to={l.to}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive}>
                          <l.icon />
                          <span>{l.label}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Site</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {siteLinks.map((l) => (
                  <SidebarMenuItem key={l.to}>
                    <NavLink to={l.to}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive}>
                          <l.icon />
                          <span>{l.label}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <div className="flex items-center justify-between gap-2 px-2 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <UsersIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-[14px]">{username}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOutIcon className="size-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b px-5">
          <SidebarTrigger />
          <span className="text-[15px] font-semibold">Back-office</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
