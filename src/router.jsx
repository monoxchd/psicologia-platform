import { createBrowserRouter } from 'react-router-dom'
import AuthGuard from './components/auth/AuthGuard.jsx'
import AccessPage from './pages/AccessPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import FormPage from './pages/FormPage.jsx'
import CreditsPage from './pages/CreditsPage.jsx'
import MatchingPage from './pages/MatchingPage.jsx'
import SchedulingPage from './pages/SchedulingPage.jsx'
import ConfirmationPage from './pages/ConfirmationPage.jsx'
import TherapistAdminPage from './pages/TherapistAdminPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import BlogPage from './pages/BlogPage.jsx'
import ArticlePage from './pages/ArticlePage.jsx'
import BlogAdminPage from './pages/BlogAdminPage.jsx'
import ArticleEditorPage from './pages/ArticleEditorPage.jsx'

export const router = createBrowserRouter([
  {
    path: "/access",
    element: <AccessPage />
  },
  {
    path: "/",
    element: <AuthGuard><DashboardPage /></AuthGuard>
  },
  {
    path: "/dashboard",
    element: <AuthGuard><DashboardPage /></AuthGuard>
  },
  {
    path: "/landing",
    element: <AuthGuard><LandingPage /></AuthGuard>
  },
  {
    path: "/form",
    element: <AuthGuard><FormPage /></AuthGuard>
  },
  {
    path: "/credits",
    element: <AuthGuard><CreditsPage /></AuthGuard>
  },
  {
    path: "/matching",
    element: <AuthGuard><MatchingPage /></AuthGuard>
  },
  {
    path: "/scheduling",
    element: <AuthGuard><SchedulingPage /></AuthGuard>
  },
  {
    path: "/confirmation",
    element: <AuthGuard><ConfirmationPage /></AuthGuard>
  },
  {
    path: "/therapist-admin",
    element: <AuthGuard><TherapistAdminPage /></AuthGuard>
  },
  {
    path: "/login",
    element: <AuthGuard><LoginPage /></AuthGuard>
  },
  {
    path: "/register",
    element: <AuthGuard><RegisterPage /></AuthGuard>
  },
  {
    path: "/blog",
    element: <AuthGuard><BlogPage /></AuthGuard>
  },
  {
    path: "/blog/:slug",
    element: <AuthGuard><ArticlePage /></AuthGuard>
  },
  {
    path: "/blog-admin",
    element: <AuthGuard><BlogAdminPage /></AuthGuard>
  },
  {
    path: "/blog-admin/new",
    element: <AuthGuard><ArticleEditorPage /></AuthGuard>
  },
  {
    path: "/blog-admin/:slug/edit",
    element: <AuthGuard><ArticleEditorPage /></AuthGuard>
  }
])