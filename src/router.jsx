import { createBrowserRouter } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import FormPage from './pages/FormPage.jsx'
import SimpleCreditsPage from './pages/SimpleCreditsPage.jsx'
import MatchingPage from './pages/MatchingPage.jsx'
import SchedulingPage from './pages/SchedulingPage.jsx'
import ConfirmationPage from './pages/ConfirmationPage.jsx'
import TherapistAdminPage from './pages/TherapistAdminPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import SimpleDashboardPage from './pages/SimpleDashboardPage.jsx'
import DemoJourneyPage from './pages/DemoJourneyPage.jsx'
import BlogPage from './pages/BlogPage.jsx'
import ArticlePage from './pages/ArticlePage.jsx'
import BlogAdminPage from './pages/BlogAdminPage.jsx'
import ArticleEditorPage from './pages/ArticleEditorPage.jsx'

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/dashboard",
    element: <DashboardPage />
  },
  {
    path: "/simple-dashboard",
    element: <SimpleDashboardPage />
  },
  {
    path: "/demo-journey",
    element: <DemoJourneyPage />
  },
  {
    path: "/form",
    element: <FormPage />
  },
  {
    path: "/credits",
    element: <SimpleCreditsPage />
  },
  {
    path: "/matching",
    element: <MatchingPage />
  },
  {
    path: "/scheduling",
    element: <SchedulingPage />
  },
  {
    path: "/confirmation",
    element: <ConfirmationPage />
  },
  {
    path: "/therapist-admin",
    element: <TherapistAdminPage />
  },
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/register",
    element: <RegisterPage />
  },
  {
    path: "/blog",
    element: <BlogPage />
  },
  {
    path: "/blog/:slug",
    element: <ArticlePage />
  },
  {
    path: "/blog-admin",
    element: <BlogAdminPage />
  },
  {
    path: "/blog-admin/new",
    element: <ArticleEditorPage />
  },
  {
    path: "/blog-admin/:slug/edit",
    element: <ArticleEditorPage />
  }
])