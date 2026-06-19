import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { InstituteProvider } from '@/context/InstituteContext';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import PageTransition from '@/components/layout/PageTransition';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import InstituteProfilePage from '@/pages/InstituteProfilePage';
import BranchesPage from '@/pages/BranchesPage';
import CoursesPage from '@/pages/CoursesPage';
import FacultyPage from '@/pages/FacultyPage';
import ResultsPage from '@/pages/ResultsPage';
import ReviewsPage from '@/pages/ReviewsPage';
import LeadsPage from '@/pages/LeadsPage';
import MediaPage from '@/pages/MediaPage';
import FaqsPage from '@/pages/FaqsPage';
import FacilitiesPage from '@/pages/FacilitiesPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import SettingsPage from '@/pages/SettingsPage';
import CreditsPage from '@/pages/CreditsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<PageTransition><DashboardPage /></PageTransition>} />
        <Route path="profile" element={<PageTransition><InstituteProfilePage /></PageTransition>} />
        <Route path="branches" element={<PageTransition><BranchesPage /></PageTransition>} />
        <Route path="courses" element={<PageTransition><CoursesPage /></PageTransition>} />
        <Route path="faculty" element={<PageTransition><FacultyPage /></PageTransition>} />
        <Route path="results" element={<PageTransition><ResultsPage /></PageTransition>} />
        <Route path="reviews" element={<PageTransition><ReviewsPage /></PageTransition>} />
        <Route path="leads" element={<PageTransition><LeadsPage /></PageTransition>} />
        <Route path="media" element={<PageTransition><MediaPage /></PageTransition>} />
        <Route path="faqs" element={<PageTransition><FaqsPage /></PageTransition>} />
        <Route path="facilities" element={<PageTransition><FacilitiesPage /></PageTransition>} />
        <Route path="subscription" element={<PageTransition><SubscriptionPage /></PageTransition>} />
        <Route path="credits" element={<PageTransition><CreditsPage /></PageTransition>} />
        <Route path="settings" element={<PageTransition><SettingsPage /></PageTransition>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InstituteProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </InstituteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
