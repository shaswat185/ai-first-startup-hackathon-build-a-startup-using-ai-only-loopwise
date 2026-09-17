import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import PublicLayout from "./layouts/PublicLayout";

import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BusinessSetupPage from "./pages/BusinessSetupPage";
import DiagnosePage from "./pages/DiagnosePage";
import DiagnosisResultsPage from "./pages/DiagnosisResultsPage";
import ActionPlanPage from "./pages/ActionPlanPage";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-setup"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <BusinessSetupPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnose"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DiagnosePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnosis/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DiagnosisResultsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/action-plan/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ActionPlanPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HistoryPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
