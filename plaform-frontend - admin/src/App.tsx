import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { useAuth } from "@/lib/auth"
import { LoginPage } from "@/pages/login"
import { AdminLayout } from "@/layouts/admin-layout"
import { DashboardPage } from "@/pages/dashboard"
import {
  EventsPage,
  FormationsPage,
  PartnersPage,
  ProgramsPage,
} from "@/pages/content-pages"
import { MediaPage } from "@/pages/media"
import { NewsletterPage } from "@/pages/newsletter"
import { MessagesPage } from "@/pages/messages"
import { CandidaturesPage } from "@/pages/candidatures"
import { ArticlesPage } from "@/pages/articles"
import { ArticleEditorPage } from "@/pages/article-editor"

export default function App() {
  const { authenticated } = useAuth()

  if (!authenticated) {
    return <LoginPage />
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rédaction en pleine page, hors de la mise en page d'administration */}
        <Route path="articles/:id" element={<ArticleEditorPage />} />
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="programmes" element={<ProgramsPage />} />
          <Route path="formations" element={<FormationsPage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="evenements" element={<EventsPage />} />
          <Route path="partenaires" element={<PartnersPage />} />
          <Route path="medias" element={<MediaPage />} />
          <Route path="newsletter" element={<NewsletterPage />} />
          <Route path="candidatures" element={<CandidaturesPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
