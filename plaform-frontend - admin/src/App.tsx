import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { useAuth } from "@/lib/auth"
import { AdminLayout } from "@/layouts/admin-layout"
import { DashboardPage } from "@/pages/dashboard"
import {
  AchievementsPage,
  ArticlesPage,
  CalendarPage,
  FaqPage,
  FormationsPage,
  PartnersPage,
  ProgramsPage,
  StatsPage,
} from "@/pages/content-pages"
import { SettingsPage } from "@/pages/settings"
import { MediaPage } from "@/pages/media"
import { NewsletterPage } from "@/pages/newsletter"
import { MessagesPage } from "@/pages/messages"
import { Button } from "@/components/ui/button"

export default function App() {
  const { ready, authenticated, isAdmin, logout } = useAuth()

  if (!ready || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-[15px] text-muted-foreground">
          Connexion à Keycloak…
        </span>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <h1 className="font-heading text-2xl font-semibold">Accès refusé</h1>
        <p className="text-[15px] text-muted-foreground">
          Votre compte n'a pas le rôle « admin » du realm gehmit.
        </p>
        <Button variant="outline" onClick={logout}>
          Se déconnecter
        </Button>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="programmes" element={<ProgramsPage />} />
          <Route path="formations" element={<FormationsPage />} />
          <Route path="calendrier" element={<CalendarPage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="partenaires" element={<PartnersPage />} />
          <Route path="statistiques" element={<StatsPage />} />
          <Route path="realisations" element={<AchievementsPage />} />
          <Route path="reglages" element={<SettingsPage />} />
          <Route path="medias" element={<MediaPage />} />
          <Route path="newsletter" element={<NewsletterPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
