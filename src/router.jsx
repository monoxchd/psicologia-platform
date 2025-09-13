import { createBrowserRouter } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import FormPage from './pages/FormPage.jsx'
import CreditsPage from './pages/CreditsPage.jsx'
import MatchingPage from './pages/MatchingPage.jsx'
import SchedulingPage from './pages/SchedulingPage.jsx'
import ConfirmationPage from './pages/ConfirmationPage.jsx'
import TherapistAdminPage from './pages/TherapistAdminPage.jsx'

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/form",
    element: <FormPage />
  },
  {
    path: "/credits",
    element: <CreditsPage />
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
  }
])