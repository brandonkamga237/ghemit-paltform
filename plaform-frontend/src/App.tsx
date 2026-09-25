import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { SiteLayout, FormLayout } from "@/layouts/site-layout"
import { HomePage } from "@/pages/home"
import { AboutPage } from "@/pages/about"
import { ProgrammesPage } from "@/pages/programmes"
import { ProgrammeDetailPage } from "@/pages/programme-detail"
import { CandidaturePage } from "@/pages/candidature"
import { FormationsPage } from "@/pages/formations"
import { TechPathPage } from "@/pages/techpath"
import { JuniorBuildersPage } from "@/pages/junior-builders"
import { HireDeveloperPage } from "@/pages/hire-developer"
import { CaravanesPage } from "@/pages/caravanes"
import { RencontreChallengePage } from "@/pages/rencontre-challenge"
import { ImpactPage } from "@/pages/impact"
import { BlogPage } from "@/pages/blog"
import { ArticlePage } from "@/pages/article"
import { ContactPage } from "@/pages/contact"
import { DonatePage } from "@/pages/donate"
import { PartnerPage } from "@/pages/partner"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="a-propos" element={<AboutPage />} />
          <Route path="programmes" element={<ProgrammesPage />} />
          <Route path="programmes/:slug" element={<ProgrammeDetailPage />} />
          <Route path="formations" element={<FormationsPage />} />
          <Route path="solutions" element={<TechPathPage />} />
          <Route path="junior-builders" element={<JuniorBuildersPage />} />
          <Route path="louer-developpeur" element={<HireDeveloperPage />} />
          <Route path="caravanes" element={<CaravanesPage />} />
          <Route path="rencontre-challenge" element={<RencontreChallengePage />} />
          <Route path="notre-impact" element={<ImpactPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<ArticlePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="don" element={<DonatePage />} />
          <Route path="partenaire" element={<PartnerPage />} />
        </Route>
        <Route element={<FormLayout />}>
          <Route path="candidature/:slug" element={<CandidaturePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
