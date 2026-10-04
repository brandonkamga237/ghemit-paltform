import { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { SiteLayout, FormLayout } from "@/layouts/site-layout"
import { HomePage } from "@/pages/home"

const AboutPage = lazy(() =>
  import("@/pages/about").then((m) => ({ default: m.AboutPage }))
)
const ProgrammesPage = lazy(() =>
  import("@/pages/programmes").then((m) => ({ default: m.ProgrammesPage }))
)
const ProgrammeDetailPage = lazy(() =>
  import("@/pages/programme-detail").then((m) => ({
    default: m.ProgrammeDetailPage,
  }))
)
const CandidaturePage = lazy(() =>
  import("@/pages/candidature").then((m) => ({ default: m.CandidaturePage }))
)
const FormationsPage = lazy(() =>
  import("@/pages/formations").then((m) => ({ default: m.FormationsPage }))
)
const TechPathPage = lazy(() =>
  import("@/pages/techpath").then((m) => ({ default: m.TechPathPage }))
)
const JuniorBuildersPage = lazy(() =>
  import("@/pages/junior-builders").then((m) => ({
    default: m.JuniorBuildersPage,
  }))
)
const HireDeveloperPage = lazy(() =>
  import("@/pages/hire-developer").then((m) => ({
    default: m.HireDeveloperPage,
  }))
)
const CaravanesPage = lazy(() =>
  import("@/pages/caravanes").then((m) => ({ default: m.CaravanesPage }))
)
const RencontreChallengePage = lazy(() =>
  import("@/pages/rencontre-challenge").then((m) => ({
    default: m.RencontreChallengePage,
  }))
)
const ImpactPage = lazy(() =>
  import("@/pages/impact").then((m) => ({ default: m.ImpactPage }))
)
const BlogPage = lazy(() =>
  import("@/pages/blog").then((m) => ({ default: m.BlogPage }))
)
const ArticlePage = lazy(() =>
  import("@/pages/article").then((m) => ({ default: m.ArticlePage }))
)
const ContactPage = lazy(() =>
  import("@/pages/contact").then((m) => ({ default: m.ContactPage }))
)
const DonatePage = lazy(() =>
  import("@/pages/donate").then((m) => ({ default: m.DonatePage }))
)
const PartnerPage = lazy(() =>
  import("@/pages/partner").then((m) => ({ default: m.PartnerPage }))
)

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
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
            <Route
              path="rencontre-challenge"
              element={<RencontreChallengePage />}
            />
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
      </Suspense>
    </BrowserRouter>
  )
}
