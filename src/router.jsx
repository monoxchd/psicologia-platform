import { createBrowserRouter } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import FormPage from './pages/FormPage.jsx'
import SimpleCreditsPage from './pages/SimpleCreditsPage.jsx'
import MatchingPage from './pages/MatchingPage.jsx'
import SchedulingPage from './pages/SchedulingPage.jsx'
import ConfirmationPage from './pages/ConfirmationPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

import DashboardPage from './pages/DashboardPage.jsx'
import SimpleDashboardPage from './pages/SimpleDashboardPage.jsx'
import ClientDashboardPage from './pages/ClientDashboardPage.jsx'
import ActivityFormPage from './pages/ActivityFormPage.jsx'
import BlogPage from './pages/BlogPage.jsx'
import ArticlePage from './pages/ArticlePage.jsx'
import BlogAdminPage from './pages/BlogAdminPage.jsx'
import ArticleEditorPage from './pages/ArticleEditorPage.jsx'
import TherapistDashboardPage from './pages/TherapistDashboardPage.jsx'
import TherapistProfileEditPage from './pages/TherapistProfileEditPage.jsx'
import AcolhimentoLandingPage from './pages/AcolhimentoLandingPage.jsx'
import CompanyLandingPage from './pages/CompanyLandingPage.jsx'
import CompanyRegisterPage from './pages/CompanyRegisterPage.jsx'
import QuestionnaireFormPage from './pages/QuestionnaireFormPage.jsx'
import QuestionnaireResponsesPage from './pages/QuestionnaireResponsesPage.jsx'
import QuestionnaireResponseDetailPage from './pages/QuestionnaireResponseDetailPage.jsx'
import CompanyLoginPage from './pages/CompanyLoginPage.jsx'
import CompanyMatchingPage from './pages/CompanyMatchingPage.jsx'
import CompanySchedulingPage from './pages/CompanySchedulingPage.jsx'
import HrDashboardPage from './pages/HrDashboardPage.jsx'
import CompanyAuthGate from './components/CompanyAuthGate.jsx'
import EnigmaQuizPage from './pages/EnigmaQuizPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import TriagePage from './pages/TriagePage.jsx'

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/simple-dashboard",
    element: <SimpleDashboardPage />
  },
  {
    path: "/dashboard",
    element: <ClientDashboardPage />
  },
  {
    path: "/dashboard-old",
    element: <DashboardPage />
  },
  {
    path: "/atividades/:slug",
    element: <ActivityFormPage />
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
    path: "/login",
    element: <LoginPage />
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
  },
  {
    path: "/therapist/dashboard",
    element: <TherapistDashboardPage />
  },
  {
    path: "/therapist/profile/edit",
    element: <TherapistProfileEditPage />
  },
  {
    path: "/acolhimento",
    element: <AcolhimentoLandingPage />
  },
  {
    path: "/acolhimento/:slug",
    element: <AcolhimentoLandingPage />
  },
  {
    path: "/empresa/:slug",
    element: <CompanyLandingPage />
  },
  {
    path: "/empresa/:slug/login",
    element: <CompanyLoginPage />
  },
  {
    path: "/empresa/:slug/cadastro",
    element: <CompanyRegisterPage />
  },
  {
    path: "/empresa/:slug/psicologos",
    element: <CompanyAuthGate><CompanyMatchingPage /></CompanyAuthGate>
  },
  {
    path: "/empresa/:slug/agendar/:therapistId",
    element: <CompanyAuthGate><CompanySchedulingPage /></CompanyAuthGate>
  },
  {
    path: "/empresa/:slug/rh",
    element: <CompanyAuthGate><HrDashboardPage /></CompanyAuthGate>
  },
  {
    path: "/empresa/:slug/questionario/:questionnaire_slug",
    element: <QuestionnaireFormPage />
  },
  {
    path: "/therapist/questionarios/:slug/respostas",
    element: <QuestionnaireResponsesPage />
  },
  {
    path: "/therapist/respostas/:id",
    element: <QuestionnaireResponseDetailPage />
  },
  {
    path: "/enigma",
    element: <EnigmaQuizPage />
  },
  {
    path: "/admin",
    element: <AdminPage />
  },
  {
    path: "/triagem",
    element: <TriagePage />
  }
])